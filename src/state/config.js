

import { BN } from 'bn.js'
const ENV = process.env.REACT_APP_ENV

// testnet / default
let config = {
    FUNDING_DATA: '__FUNDING_DATA',
    ACCOUNT_LINKS: '__ACCOUNT_LINKS',
    GAS: new BN('200000000000000').toString(),
    networkId: 'default',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
}

if (ENV === 'prod') {
    config.networkId = 'mainnet'
    config.nodeUrl = 'https://rpc.testnet.near.org'
    config.walletUrl = 'https://wallet.near.org'
}

export { config }
