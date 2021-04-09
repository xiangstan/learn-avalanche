const fs = require("fs")

// Load and configure Avalanche client
const client = require("./client")

// Path where we will keep the credentials for the pathway
const credentialsPath = "./credentials"

async function main() {
  // 1. Configure keychain
  // Initialize the X-Chain client and keychain
  const chain = client.XChain()
  const keyChain = chain.keyChain()
  const keyPath = `${credentialsPath}/keypair.json`
  // 2. Generate private key
  // Check if we already have an existing key
  if (!fs.existsSync(keyPath)) {
    /* keyChain.makeKey() generates a new private key. You can have as many private keys as you like, for different purposes, like staking or token transfers. */
    console.log("Generating a new keypair...")
    const key = keyChain.makeKey()

    console.log("Saving keypair to", keyPath)
    fs.writeFileSync(keyPath, JSON.stringify({
      pubkey: key.getPublicKeyString(),
      privkey: key.getPrivateKeyString(),
    }, null, 2))
  }

  console.log("Loading credentials into keychain...")
  const data = JSON.parse(fs.readFileSync(keyPath))

  /* keyChain.importKey(...) loads an existing private key. Could be loaded from an environment variable or a file (in our case) */
  const key = keyChain.importKey(data.privkey)
  console.log("Imported X-chain address:", key.getAddressString())
  // 3. Check address balance
  console.log("Fetching address balances...")
  /* An address on Avalanche network might have balances for different assets, not just AVAX. For that particular reason it's easier to use chain.getAllBalances method instead of chain.getBalance(address, assetID) as one must know the real asset ID (and not its symbol) before a call like that could be made. We will cover that part later in the Pathway track. */
  const balances = await chain.getAllBalances(key.getAddressString())

  if (balances.length > 0) {
    console.log(balances)
  } else {
    console.log("Address does not have any associated balances yet.")
    console.log("==============================================================")
    console.log("Visit https://faucet.avax-test.network/ to pre-fund your address.")
    console.log("==============================================================")
  }
}

main().catch((err) => {
  console.log("We have encountered an error!")
  console.error(err)
})
