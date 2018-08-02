const web3 = require('./web3')
const wallet = require('./wallet')
const sendTx = require('./sendTx')

global.wallet = wallet
global.web3 = web3
global.eth = web3.eth
global.sendTx = sendTx
