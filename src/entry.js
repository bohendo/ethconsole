require("babel-polyfill")
const eth = require('ethers')
const wallet = require('./wallet')

global.log = (msg) => console.log(JSON.stringify(msg, undefined, 20))

global.eth = eth
global.provider = new eth.providers.JsonRpcProvider(process.env.ETH_PROVIDER)
global.wallet = eth.Wallet.fromMnemonic('candy maple cake sugar pudding cream honey rich smooth crumble sweet treat').connect(provider)

if (process.env.ETH_SECRET_STORE) {
    console.log(`Setting secret store ${process.env.ETH_SECRET_STORE}`)
    wallet.setSecretStore(process.env.ETH_SECRET_STORE)
} else {
    console.log('Please set secret store - ledger, local or ethProvider - to be able to use this console')
}
