const web3 = require('./web3')
const wallet = require('./wallet')
const sendTx = require('./sendTx')

global.wallet = wallet
global.web3 = web3
global.eth = web3.eth
global.sendTx = sendTx

if (process.env.ETH_SECRET_STORE) {
    console.log(`Setting secret store ${process.env.ETH_SECRET_STORE}`)
    wallet.setSecretStore(process.env.ETH_SECRET_STORE)
} else {
    console.log('Please set secret store - ledger, local or ethProvider - to be able to use this console')
}
