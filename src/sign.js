const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default
const Eth = require('@ledgerhq/hw-app-eth').default

console.log('Eth:', Eth)
console.log('TransportNodeHid:', TransportNodeHid)

const sign = () => {
    console.log(`Connecting to wallet: Ledger`)
    TransportNodeHid.create().then(transport => {
        const wallet = new Eth(transport)
        console.log(`transport: ${JSON.stringify(transport, null, 2)}`)
        console.log(`wallet: ${JSON.stringify(wallet, null, 2)}`)
    }).catch((error) => {
        console.log(`Failed to access ledger, please plug-in or unlock device: ${error}`)
    })
}

module.exports = sign
