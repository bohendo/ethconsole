const ledger = require('./ledger')

const walletError = (msg) => {
    if (msg && msg.name && msg.message)
        console.error(`${msg.name}: ${msg.message}`)
    else
        console.error(msg)
}
// secretStore = object that implements signTx, signMsg and getAddress

var secretStore = undefined

// Define Exported Object
const wallet = {}

wallet.setAccount = (index) => {
    if (!secretStore) {
        console.log('Secret store not set')
        return null
    }
    secretStore.getAddress(index).then(address => {
        process.env.ETH_ADDRESS = address
        process.env.ETH_ADDRESS_INDEX = index
        console.log(`Successfully set "from address" as: accounts[${process.env.ETH_ADDRESS_INDEX}] = "${process.env.ETH_ADDRESS}"`)
    }).catch(walletError)
}

wallet.unsetAccount = () => {
    delete process.env.ETH_ADDRESS
    delete process.env.ETH_ADDRESS_INDEX
    console.log(`Successfully unset "from address"`)
}

wallet.setSecretStore = (store) => {
    if (store === 'ledger')
        secretStore = ledger
    /*
    else if (store === 'local')
        secretStore = localSecret
    else if (store === 'ethProvider')
        secretStore = ethProviderSecret
    */
    else {
        console.log(`Secret store ${store} not supported. Try ledger, local or ethProvider `)
    }
}

wallet.getAddress = (index) => {
    return secretStore ?
        secretStore.getAddress(index).catch(walletError) :
        console.log('Secret store not set')
}

wallet.signTx = (index, hexTx) => {
    return secretStore ?
        secretStore.signTx(index, hexTx).catch(walletError) :
        console.log('Secret store not set')
}

wallet.signMsg = (index, hexMsg) => {
    return secretStore ?
        secretStore.signMsg(index, hexMsg).catch(walletError) :
        console.log('Secret store not set')
}

module.exports = wallet
