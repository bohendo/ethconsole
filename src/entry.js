require("babel-polyfill")
const eth = require('ethers')
const web3 = require('./web3')
const wallet = require('./wallet')
const sendTx = require('./sendTx')

global.wallet = wallet
global.web3 = web3
global.eth = eth
global.sendTx = sendTx
global.BN = web3.utils.BN

if (process.env.ETH_SECRET_STORE) {
    console.log(`Setting secret store ${process.env.ETH_SECRET_STORE}`)
    wallet.setSecretStore(process.env.ETH_SECRET_STORE)
} else {
    console.log('Please set secret store - ledger, local or ethProvider - to be able to use this console')
}
