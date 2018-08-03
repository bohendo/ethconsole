const https = require('https')
const EthereumTx = require('ethereumjs-tx')

const web3 = require('./web3')
const wallet = require('./wallet')

const txError = (msg) => {
    console.error(`Error sending transaction: ${msg}`)
}

global.tx = {
    to: '0xb2fC8A24F1ac52C577DF7be839cF2a4304E08a92',
    value: '2000000000000000',
    data: '0x'
}

const prepTx = (tx) => {
    tx.from = process.env.ETH_ADDRESS
    if (!tx.from || !process.env.ETH_ADDRESS_INDEX || tx.from.length !== 42) {
        throw(`Please specify a "from address" with: wallet.setAccount(integer)`)
    }

    return wallet.getAddress(process.env.ETH_ADDRESS_INDEX).then(address => {
        if (address !== tx.from) {
            throw(`Error, from address and index do not match, please run wallet.setAccount(integer) again`)
        }

        return getGasPrice().then(gasPrice => {
            tx.gasPrice = gasPrice
            return web3.eth.estimateGas(tx).then(gas => {
                tx.gas = String(gas * 1.5)
                return web3.eth.getTransactionCount(tx.from).then(nonce => {
                    tx.nonce = nonce
                    console.log(`Preparing to sign transaction: ${JSON.stringify(tx, null, 2)}`)

                    tx.chainId = 1
                    tx.v = '0x01'
                    tx.s = '0x00'
                    tx.r = '0x00'

                    return tx

                }).catch(txError)
            }).catch(txError)
        }).catch(txError)
    }).catch(txError)
}

const sendTx = (tx) => {
    return prepTx(tx).then(tx => {
        if (!tx) return null
        var rawTx = new EthereumTx(tx)

        return wallet.signTx(process.env.ETH_ADDRESS_INDEX, rawTx.serialize().toString('hex')).then(signature => {
            rawTx.v = '0x' + signature.v
            rawTx.r = '0x' + signature.r
            rawTx.s = '0x' + signature.s

            if (!rawTx.verifySignature()) {
                throw(`Error: signature is invalid for tx: ${JSON.stringify(rawTx, null, 2)}`)
            }

            return new Promise((resolve, reject) => {
                var hash
                return web3.eth.sendSignedTransaction('0x' + rawTx.serialize().toString('hex'))
                    .once('transactionHash', (_hash) => {
                        hash = _hash
                        console.log(`Transaction sent: ${hash}`)
                    }).once('receipt', (reciept) => {
                        return resolve(receipt)
                    }).catch(error => {
                        const wait = () => setTimeout(() => {
                            web3.eth.getTransactionReceipt(hash).then(receipt => {
                                if (receipt) return resolve(receipt)
                            }).catch(wait)
                        }, 5000)
                        return wait()
                    })
            })
        }).catch(txError)
    }).catch(txError)
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
