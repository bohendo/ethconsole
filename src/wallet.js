const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default
const Eth = require('@ledgerhq/hw-app-eth').default

const ledgerError = (msg) => {
    console.error(`Failed to access ledger, please plug-in or unlock device: ${msg}`)
}

var ledger
const getLedger = () => {
    if (ledger) {
        return Promise.resolve(ledger)
    }
    ledger = TransportNodeHid.create().then(transport => new Eth(transport))
    return ledger
}

const sign = (address_index, hexData, signFunction) => {
    return getLedger().then(ledger => {
        return ledger[signFunction](`44'/60'/${address_index}'/0/0`, hexData).then(signature => {
            return signature
        }).catch(ledgerError)
    }).catch(ledgerError)
}

// Define Exported Object
const wallet = {}

wallet.getAddress = (address_index) => {
    return getLedger().then(ledger => {
        return ledger.getAddress(`44'/60'/${address_index}'/0/0`).then(address => {
            return address.address
        }).catch(ledgerError)
    }).catch(ledgerError)
}

wallet.signTx = (address_index, hexTx) => {
    return sign(address_index, hexTx, 'signTransaction')
}

wallet.signMsg = (address_index, hexMsg) => {
    return sign(address_index, hexMsg, 'signPersonalMessage')
}

wallet.setAccount = (address_index) => {
    wallet.getAddress(address_index).then(address => {
        process.env.ETH_ADDRESS = address
        process.env.ETH_ADDRESS_INDEX = address_index
        console.log(`Successfully set "from address" as: accounts[${process.env.ETH_ADDRESS_INDEX}] = "${process.env.ETH_ADDRESS}"`)
    }).catch(ledgerError)
}

wallet.unsetAccount = () => {
    delete process.env.ETH_ADDRESS
    delete process.env.ETH_ADDRESS_INDEX
    console.log(`Successfully unset "from address"`)
}

module.exports = wallet
