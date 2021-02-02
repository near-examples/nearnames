import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'

import { config } from './config'

export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, GAS, SEED_PHRASE_LOCAL_COPY,
    networkId, nodeUrl, walletUrl, nameSuffix,
    contractName,
} = config

const {
    KeyPair,
    InMemorySigner,
    transactions: {
        addKey, deleteKey, fullAccessKey
    },
    utils: {
        PublicKey,
        format: {
            parseNearAmount, formatNearAmount
        }
    }
} = nearAPI

export const initNear = (skipFunding = false) => async ({ update, getState, dispatch }) => {

    // check returned from funding key -> claim the named account
    update('funding', false)
    if (!skipFunding) {
        const fundingData = get(FUNDING_DATA)
        if (fundingData && fundingData.key) {
            update('funding', true)
            return dispatch(hasFundingKeyFlow(fundingData))
        }
    }

    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    });

    // check links, see if they're still valid
    let links = get(ACCOUNT_LINKS, []).sort((a) => a.claimed ? 1 : -1)
    for (let i = 0; i < links.length; i++) {
        const { key, accountId, keyStored = Date.now() } = links[i]
        if (Date.now() - keyStored < 5000) {
            continue
        }
        const keyExists = await hasKey(key, accountId, near)
        if (!keyExists) {
            links[i].claimed = true
            set(ACCOUNT_LINKS, links)
        }
    }
    const claimed = links.filter(({claimed}) => !!claimed)
    links = links.filter(({claimed}) => !claimed)

    // resume wallet / contract flow
    const wallet = new nearAPI.WalletAccount(near);
    wallet.signIn = () => {
        wallet.requestSignIn(contractName, 'Blah Blah')
    }
    wallet.signedIn = wallet.isSignedIn()
    if (wallet.signedIn) {
        wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2)
    }

    const contract = await new nearAPI.Contract(wallet.account(), contractName, {
        changeMethods: ['send', 'create_account_and_claim'],
    })
    wallet.isAccountTaken = async (accountId) => {
        accountId = accountId + nameSuffix
        const account = new nearAPI.Account(near.connection, accountId);
        try {
            await account.state()
            update('app', {accountTaken: true, wasValidated: true})
        } catch(e) {
            update('app', {accountTaken: false, wasValidated: true})
        }
    }
    wallet.fundAccount = async (amount, accountId, recipientName) => {
        accountId = accountId + nameSuffix
        if (parseInt(amount, 10) < 5 || accountId.length < 2 || accountId.length > 48) {
            return update('app.wasValidated', true)
        }
        const keyPair = KeyPair.fromRandom('ed25519')
        set(FUNDING_DATA, { key: keyPair.secretKey, accountId, recipientName, amount, funder_account_id: wallet.getAccountId() })
        await contract.send({ public_key: keyPair.publicKey.toString() }, GAS, parseNearAmount(amount))
    }

    update('', { near, wallet, links, claimed })
};

export const hasFundingKeyFlow = ({ key, accountId, recipientName, amount, funder_account_id }) => async ({ update, getState, dispatch }) => {
    const keyPair = KeyPair.fromString(key)
    const keyExists = await hasKey(key, contractName)
    if (!keyExists) {
        dispatch(initNear(true))
    }

    const signer = await InMemorySigner.fromKeyPair(networkId, contractName, keyPair)
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
    });
    const account = new nearAPI.Account(near.connection, contractName);
    const contract = await new nearAPI.Contract(account, contractName, {
        changeMethods: ['send', 'create_account_and_claim'],
        sender: account
    })

    const newKeyPair = KeyPair.fromRandom('ed25519')
    let result
    try {
        const links = get(ACCOUNT_LINKS, [])
        links.push({ key: newKeyPair.secretKey, accountId, recipientName, keyStored: Date.now() })
        set(ACCOUNT_LINKS, links)
        
        result = await contract.create_account_and_claim({
            new_account_id: accountId,
            new_public_key: newKeyPair.publicKey.toString()
        }, GAS, '0')

        if (result === true) {
            del(FUNDING_DATA)
            fetch('https://hooks.zapier.com/hooks/catch/6370559/oc18t1b/', {
                method: 'POST',
                body: JSON.stringify({
                    funder_account_id,
                    alias: recipientName,
                    account_id: accountId,
                    amount,
                    time_created: Date.now()
                })
            })
            dispatch(initNear())
        } else {
            dispatch(initNear(true))
        }
    } catch (e) {
        if (e.message.indexOf('no matching key pair found') === -1) {
            throw e
        }
        dispatch(initNear(true))
    }
}

export const unclaimLink = (keyToFind) => async ({ update }) => {
    let links = get(ACCOUNT_LINKS, [])
    const link = links.find(({ key }) => key === keyToFind)
    if (!link) {
        alert('cannot find link')
        return
    }
    link.claimed = false
    set(ACCOUNT_LINKS, links)

    const claimed = links.filter(({claimed}) => claimed === true)
    links = links.filter(({claimed}) => !claimed)
    
    update('', { links, claimed })
}

export const keyRotation = () => async ({ update, getState, dispatch }) => {
    const state = getState()
    const { key, accountId, publicKey, seedPhrase } = state.accountData

    const keyPair = KeyPair.fromString(key)
    const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair)
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
    });
    const account = new nearAPI.Account(near.connection, accountId);
    const accessKeys = await account.getAccessKeys()
    const actions = [
        deleteKey(PublicKey.from(accessKeys[0].public_key)),
        addKey(PublicKey.from(publicKey), fullAccessKey())
    ]

    set(SEED_PHRASE_LOCAL_COPY, seedPhrase)

    const result = await account.signAndSendTransaction(accountId, actions)

    fetch('https://hooks.zapier.com/hooks/catch/6370559/ocibjmr/', {
        method: 'POST',
        body: JSON.stringify({
            account_id: accountId,
            time_claimed: Date.now()
        })
    })
    
    return result
}

export const hasKey = async (key, accountId, near) => {
    const keyPair = KeyPair.fromString(key)
    const pubKeyStr = keyPair.publicKey.toString()

    if (!near) {
        const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair)
        near = await nearAPI.connect({
            networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
        });
    }
    const account = new nearAPI.Account(near.connection, accountId);
    try {
        const accessKeys = await account.getAccessKeys()
        if (accessKeys.length > 0 && accessKeys.find(({ public_key }) => public_key === pubKeyStr)) {
            return true
        }
    } catch (e) {
        console.warn(e)
    }
    return false
}