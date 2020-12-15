import * as nearAPI from 'near-api-js'
import { BN } from 'bn.js'
import { get, set, del } from '../utils/storage'

const {
    KeyPair,
    InMemorySigner,
    transactions: {
        functionCall, addKey, deleteKey, fullAccessKey
    },
    utils: {
        PublicKey,
        format: {
            parseNearAmount, formatNearAmount
        }
    }
} = nearAPI

const FUNDING_DATA = '__FUNDING_DATA'
const ACCOUNT_LINKS = '__ACCOUNT_LINKS'
const GAS = new BN('200000000000000').toString()
const networkId = 'default'
const nodeUrl = 'https://rpc.testnet.near.org'
const walletUrl = 'https://wallet.testnet.near.org'

export const initNear = () => async ({ update, getState, dispatch }) => {

    // check returned from funding key -> claim the named account
    update('funding', false)
    const fundingData = get(FUNDING_DATA)
    if (fundingData && fundingData.key) {
        update('funding', true)
        return dispatch(hasFundingKeyFlow(fundingData))
    }

    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    });

    // check links, see if they're still valid
    const links = get(ACCOUNT_LINKS, [])
    console.log('links', links)
    for (let i = 0; i < links.length; i++) {
        const { key, accountId } = links[i]
        const account = new nearAPI.Account(near.connection, accountId);
        try {
            const accessKeys = await account.getAccessKeys()
            if (accessKeys.length > 0) {
                const keyPair = KeyPair.fromString(key)
                if (!accessKeys.find(({ public_key }) => public_key === keyPair.publicKey.toString())) {
                    links[i].claimed = true
                    set(ACCOUNT_LINKS, links)
                }
            }
        } catch (e) {
            console.warn(e)
        }
    }

    // resume wallet / contract flow
    const wallet = new nearAPI.WalletAccount(near);
    wallet.signIn = () => {
        wallet.requestSignIn('testnet', 'Blah Blah')
    }
    wallet.signedIn = wallet.isSignedIn()
    if (wallet.signedIn) {
        wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2)
    }

    const contract = await new nearAPI.Contract(wallet.account(), 'testnet', {
        changeMethods: ['send', 'create_account_and_claim'],
    })
    wallet.isAccountTaken = async (accountId) => {
        const account = new nearAPI.Account(near.connection, accountId);
        try {
            await account.state()
            update('app', {accountTaken: true, wasValidated: true})
        } catch(e) {
            update('app', {accountTaken: false, wasValidated: true})
        }
    }
    wallet.fundAccount = async (amount, accountId) => {
        console.log(amount, accountId)
        if (parseInt(amount, 10) < 5 || accountId.length < 2 || accountId.length > 48) {
            return update('app.wasValidated', true)
        }
        const keyPair = KeyPair.fromRandom('ed25519')
        set(FUNDING_DATA, { key: keyPair.secretKey, accountId })
        await contract.send({ public_key: keyPair.publicKey.toString() }, GAS, parseNearAmount(amount))
    }

    update('', { near, wallet, links })
};

export const hasFundingKeyFlow = ({ key, accountId }) => async ({ update, getState, dispatch }) => {
    const keyPair = KeyPair.fromString(key)
    const signer = await InMemorySigner.fromKeyPair(networkId, 'testnet', keyPair)
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
    });
    const account = new nearAPI.Account(near.connection, 'testnet');
    const contract = await new nearAPI.Contract(account, 'testnet', {
        changeMethods: ['send', 'create_account_and_claim'],
        sender: account
    })

    const newKeyPair = KeyPair.fromRandom('ed25519')
    let result
    try {
        result = await contract.create_account_and_claim({
            new_account_id: accountId,
            new_public_key: newKeyPair.publicKey.toString()
        }, GAS, '0')

        const links = get(ACCOUNT_LINKS, [])
        links.push({ key: newKeyPair.secretKey, accountId })
        set(ACCOUNT_LINKS, links)
    } catch (e) {
        if (e.message.indexOf('no matching key pair found') === -1) {
            throw e
        }
    }
    console.log('result', result)
    del(FUNDING_DATA)

    dispatch(initNear())
}

export const keyRotation = () => async ({ update, getState, dispatch }) => {
    const state = getState()
    const { key, accountId, publicKey } = state.accountData

    console.log(key)

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

    const result = await account.signAndSendTransaction(accountId, actions)
    console.log('result', result)
}