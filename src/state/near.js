import * as nearAPI from 'near-api-js';
import { get, set, del } from '../utils/storage';

import { config } from './config';

const ANALYTICS_URL = 'https://hooks.zapier.com/hooks/catch/6370559/ocibjmr/';
const SIGN_IN_TITLE = '';

export const { FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, networkId, nodeUrl, walletUrl, nameSuffix, contractName } = config;

const {
  KeyPair,
  InMemorySigner,
  transactions: { addKey, deleteKey, fullAccessKey },
  utils: {
    PublicKey,
    format: { parseNearAmount, formatNearAmount },
  },
} = nearAPI;

export const initNear =
  () =>
  async ({ update, getState, dispatch }) => {
    // // check returned from funding key -> claim the named account
    // update('funding', false)
    // if (!skipFunding) {
    //     const fundingData = get(FUNDING_DATA)
    //     if (fundingData && fundingData.key) {
    //         update('funding', true)
    //         return dispatch(hasFundingKeyFlow(fundingData))
    //     }
    // }

    const near = await nearAPI.connect({
      networkId,
      nodeUrl,
      walletUrl,
      deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    });

    const isAccountTaken = async (accountId) => {
      const account = new nearAPI.Account(near.connection, accountId);
      try {
        await account.state();
      } catch (e) {
        console.warn(e);
        if (/does not exist while viewing/.test(e.toString())) {
          return false;
        }
      }
      return true;
    };
    // check localLinks, see if they're still valid
    const localLinks = get(ACCOUNT_LINKS, []).sort((a) => (a.claimed ? 1 : -1));
    for (let i = 0; i < localLinks.length; i++) {
      const { key, accountId, keyStored = 0, claimed } = localLinks[i];
      const exists = await isAccountTaken(accountId);
      if (!exists) {
        localLinks.splice(i, 1);
        continue;
      }
      if (!!claimed || Date.now() - keyStored < 5000) {
        continue;
      }
      const keyExists = await hasKey(key, accountId, near);
      if (!keyExists) {
        localLinks[i].claimed = true;
      }
    }
    set(ACCOUNT_LINKS, localLinks);

    const claimed = localLinks.filter(({ claimed }) => !!claimed);
    const links = localLinks.filter(({ claimed }) => !claimed);

    // resume wallet / contract flow
    const wallet = new nearAPI.WalletAccount(near);
    wallet.signIn = () => {
      wallet.requestSignIn(contractName, SIGN_IN_TITLE);
    };
    wallet.signedIn = wallet.isSignedIn();
    if (wallet.signedIn) {
      wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2);
    }

    const contract = await new nearAPI.Contract(wallet.account(), contractName, {
      changeMethods: ['send', 'create_account', 'create_account_and_claim'],
    });
    wallet.isAccountTaken = async (accountId) => {
      const accountTaken = await isAccountTaken(accountId + nameSuffix);
      update('app', { accountTaken, wasValidated: true });
      return accountTaken;
    };
    wallet.fundAccount = async (amount, accountId, recipientName) => {
      if (accountId.indexOf(nameSuffix) > -1 || accountId.indexOf('.') > -1) {
        alert(`The "${nameSuffix}" suffix gets added automatically, so please omit it from the Account Name field. Also, no periods (".") are allowed.`);
        return update('app.wasValidated', true);
      }
      if (await wallet.isAccountTaken(accountId)) {
        return;
      }

      update('app', { accountTaken: true }); // assume until check says false

      accountId = accountId + nameSuffix;
      if (parseFloat(amount, 10) < 0.1 || accountId.length < 2 || accountId.length > 48) {
        return update('app.wasValidated', true);
      }
      const keyPair = KeyPair.fromRandom('ed25519');

      const links = get(ACCOUNT_LINKS, []);
      links.push({ key: keyPair.secretKey, accountId, recipientName, keyStored: Date.now() });
      set(ACCOUNT_LINKS, links);

      // set(FUNDING_DATA, { key: keyPair.secretKey, accountId, recipientName, amount, funder_account_id: wallet.getAccountId() })
      await contract.create_account({ new_account_id: accountId, new_public_key: keyPair.publicKey.toString() }, GAS, parseNearAmount(amount));
    };

    update('', { near, wallet, links, claimed });
  };

export const unclaimLink =
  (keyToFind) =>
  async ({ update }) => {
    let links = get(ACCOUNT_LINKS, []);
    const link = links.find(({ key }) => key === keyToFind);
    if (!link) {
      alert('cannot find link');
      return;
    }
    link.claimed = false;
    set(ACCOUNT_LINKS, links);

    const claimed = links.filter(({ claimed }) => claimed === true);
    links = links.filter(({ claimed }) => !claimed);

    update('', { links, claimed });
  };

export const keyRotation =
  () =>
  async ({ update, getState, dispatch }) => {
    const state = getState();
    const { key, accountId, publicKey, seedPhrase } = state.accountData;

    const keyPair = KeyPair.fromString(key);
    const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair);
    const near = await nearAPI.connect({
      networkId,
      nodeUrl,
      walletUrl,
      deps: { keyStore: signer.keyStore },
    });
    const account = new nearAPI.Account(near.connection, accountId);
    const accessKeys = await account.getAccessKeys();
    const actions = [deleteKey(PublicKey.from(accessKeys[0].public_key)), addKey(PublicKey.from(publicKey), fullAccessKey())];

    set(SEED_PHRASE_LOCAL_COPY, seedPhrase);

    const result = await account.signAndSendTransaction(accountId, actions);

    fetch(ANALYTICS_URL, {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        time_claimed: Date.now(),
      }),
    });

    return result;
  };

export const hasKey = async (key, accountId, near) => {
  const keyPair = KeyPair.fromString(key);
  const pubKeyStr = keyPair.publicKey.toString();

  if (!near) {
    const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair);
    near = await nearAPI.connect({
      networkId,
      nodeUrl,
      walletUrl,
      deps: { keyStore: signer.keyStore },
    });
  }
  const account = new nearAPI.Account(near.connection, accountId);
  try {
    const accessKeys = await account.getAccessKeys();
    if (accessKeys.length > 0 && accessKeys.find(({ public_key }) => public_key === pubKeyStr)) {
      return true;
    }
  } catch (e) {
    console.warn(e);
  }
  return false;
};

/// Deprecated

// export const hasFundingKeyFlow = ({ key, accountId, recipientName, amount, funder_account_id }) => async ({ update, getState, dispatch }) => {
//     const keyPair = KeyPair.fromString(key)
//     const keyExists = await hasKey(key, contractName)
//     if (!keyExists) {
//         dispatch(initNear(true))
//     }

//     const signer = await InMemorySigner.fromKeyPair(networkId, contractName, keyPair)
//     const near = await nearAPI.connect({
//         networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
//     });
//     const account = new nearAPI.Account(near.connection, contractName);
//     const contract = await new nearAPI.Contract(account, contractName, {
//         changeMethods: ['send', 'create_account_and_claim'],
//         sender: account
//     })

//     const newKeyPair = KeyPair.fromRandom('ed25519')
//     try {
//         const links = get(ACCOUNT_LINKS, [])
//         links.push({ key: newKeyPair.secretKey, accountId, recipientName, keyStored: Date.now() })
//         set(ACCOUNT_LINKS, links)
//     } catch(e) {
//         alert('Browser error saving key. Still have funds. Please refresh this page.')
//         return dispatch(initNear(true))
//     }

//     const links = get(ACCOUNT_LINKS, [])
//     const hasLink = links.some(({ accountId: id }) => accountId === id)
//     if (!hasLink) {
//         alert('Browser error saving key. Still have funds. Please refresh this page.')
//         return dispatch(initNear(true))
//     }

//     let result
//     try {
//         result = await contract.create_account_and_claim({
//             new_account_id: accountId,
//             new_public_key: newKeyPair.publicKey.toString()
//         }, GAS, '0')

//         if (result === true) {
//             del(FUNDING_DATA)
//             fetch('https://hooks.zapier.com/hooks/catch/6370559/oc18t1b/', {
//                 method: 'POST',
//                 body: JSON.stringify({
//                     funder_account_id,
//                     alias: recipientName,
//                     account_id: accountId,
//                     amount,
//                     time_created: Date.now()
//                 })
//             })
//             dispatch(initNear())
//         } else {
//             dispatch(initNear(true))
//         }
//     } catch (e) {
//         if (e.message.indexOf('no matching key pair found') === -1) {
//             throw e
//         }
//         dispatch(initNear(true))
//     }
// }
