const https = require('https')
const EthereumTx = require('ethereumjs-tx')

const web3 = require('./web3')
const wallet = require('./wallet')

global.tx = {
    to: '0xb2fC8A24F1ac52C577DF7be839cF2a4304E08a92',
    value: '6000000000000000',
    data: '0x'
}

const sendTx = (tx) => {
    tx.from = process.env.ETH_ADDRESS
    if (!tx.from || !process.env.ETH_ADDRESS_INDEX || tx.from.length !== 42) {
        console.log(`Please specify a "from address" with: wallet.setAccount(integer)`)
        return null
    }

    return wallet.getAddress(process.env.ETH_ADDRESS_INDEX).then(address => {
        if (address !== tx.from) {
            console.log(`Error, from address and index do not match, please run wallet.setAccount(integer) again`)
            return null
        }

        return getGasPrice()
    }).then(gasPrice => {
        tx.gasPrice = gasPrice
        return web3.eth.estimateGas(tx)
    }).then(gas => {
        tx.gas = gas * 2
        return web3.eth.getTransactionCount(tx.from)
    }).then(nonce => {
        tx.nonce = nonce

        console.log(`Preparing to sign transaction: ${JSON.stringify(tx, null, 2)}`)

        tx.chainId = 1
        tx.v = '0x01'
        tx.s = '0x00'
        tx.r = '0x00'

        var rawTx = new EthereumTx(tx)

        return wallet.signTx(process.env.ETH_ADDRESS_INDEX, rawTx.serialize().toString('hex')).then(signature => {
            rawTx.v = '0x' + signature.v
            rawTx.r = '0x' + signature.r
            rawTx.s = '0x' + signature.s

            console.log(`Preparing to send transaction: ${JSON.stringify(rawTx, null, 2)}`)

            if (!rawTx.verifySignature()) {
                console.log(`Error: signature is valid`)
                return null
            }

            web3.eth.sendSignedTransaction('0x' + rawTx.serialize().toString('hex'))

        }).catch((error) => {
            console.log(`Error: ${error}`)
        })
    }).catch((error) => {
        console.log(`Error: ${error}`)
    })


/*
    return (getGasPrice().then((gasPrice) => {
        tx.gasPrice = gasPrice
        return (web3.eth.estimateGas(tx).then(gas=>{
            tx.gas = gas * 2
            return (web3.eth.personal.unlockAccount(tx.from, fs.readFileSync(`/run/secrets/${tx.from}`, 'utf8')).then( (result) => {
                log(`Sending transaction: ${JSON.stringify(tx)}`)
                // send the transaction
                return new Promise((resolve, reject) => {
                    var _hash
                    return web3.eth.sendTransaction(tx).once('transactionHash', (hash) => {
                        log(`Transaction Sent: ${hash}`)
                        _hash = hash
                    }).once('receipt',(receipt) => {
                        return resolve(receipt)
                    }).catch((error) => {
                        log(error)
                        // Web3 throws error while waiting for reciept. So check manually
                        const wait = () => setTimeout(() => {
                            web3.eth.getTransactionReceipt(_hash).then((receipt) => {
                                if (receipt)
                                    return resolve(receipt)
                            }).catch(wait)
                        }, 5000)
                        return wait()
                    })
                })
            }).catch(die))
        }).catch(die))
    }).catch(die))
*/
}

const getGasPrice = () => {
    return new Promise( (resolve, reject) => {
        https.get('https://ethgasstation.info/json/ethgasAPI.json', (res) => {
            res.setEncoding('utf8')
            var data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', () => {
                // Div by 10 because API returns 10x high value
                return resolve(web3.utils.toWei(String(JSON.parse(data).average/10), 'gwei'))
            })
            res.on('error', (err) => {
                return reject(err)
            })
        })
    })
}

module.exports = sendTx
