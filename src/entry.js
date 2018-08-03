const web3 = require('./web3')
const ledger = require('./ledger')
const wallet = require('./wallet')
const sendTx = require('./sendTx')

global.ledger = ledger
global.wallet = wallet
global.web3 = web3
global.eth = web3.eth
global.sendTx = sendTx

if (process.env.SECRET_STORE)
{
    console.log(`Setting secret store ${process.env.SECRET_STORE}`)
    wallet.setSecretStore(process.env.SECRET_STORE)
}
else
    console.log('Please set secret store - ledger, local or ethProvider - to be able to use this console')
