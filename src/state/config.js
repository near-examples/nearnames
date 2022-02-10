import { BN } from 'bn.js';

// testnet / default
let config = {
  SEED_PHRASE_LOCAL_COPY: '__SEED_PHRASE_LOCAL_COPY',
  FUNDING_DATA: '__FUNDING_DATA',
  ACCOUNT_LINKS: '__ACCOUNT_LINKS',
  GAS: '200000000000000',
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  nameSuffix: '.testnet',
  contractName: 'testnet',
};

if (process.env.REACT_APP_ENV === 'prod') {
  config = {
    ...config,
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://wallet.near.org',
    nameSuffix: '.near',
    contractName: 'near',
  };
}

export { config };
