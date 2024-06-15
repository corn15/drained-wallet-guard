let zkSync = require('zksync-ethers');
let ethers = require('ethers');
let { readJson } = require('../../src/io.js');
let { processAirdrop,  sendGas } = require('../../src/airdrop.js');

MIN_GAS = 0.0003;
ABI_DIR = '../../abi/zksync';
SECRET_PATH = '../../.secrets';

let main = async function() {
    secrets = await readJson(SECRET_PATH);

    airdropContract = await readJson(`${ABI_DIR}/airdrop.json`);
    airdropContractAddress = airdropContract["address"];
    airdropABI = airdropContract["abi"];

    tokenContract = await readJson(`${ABI_DIR}/token.json`);
    tokenAddress = tokenContract["address"];
    tokenABI = tokenContract["abi"];

    const zkSyncProvider = new zkSync.Provider(secrets["rpc-l2"]);
    const ethProvider = new ethers.JsonRpcProvider(secrets["rpc-mainnet"]);

    const recipient = secrets["recipient-address"]
    const gasDistributor = new zkSync.Wallet(secrets["private-key-gas-provider"], zkSyncProvider, ethProvider);
    let claimers = [];
    for (let key of secrets["private-key-claimers"]) {
        claimers.push(new zkSync.Wallet(key, zkSyncProvider, ethProvider));
    }

    let contract = new ethers.Contract(airdropContractAddress, airdropABI, gasDistributor);
    let startBlock = await contract.startClaimBlock();
    while (startBlock > BigInt(await zkSyncProvider.getBlockNumber())) {
        console.log('Waiting for the airdrop to start...');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('Airdrop has started!');

    for (let claimer of claimers) {
        console.log('Checking claimer balance...');
        let  balance = await zkSyncProvider.getBalance(claimer.address, "latest");
        if (balance < ethers.parseEther(MIN_GAS.toString())) {
            console.log('Claimer does not have enough gas to claim the airdrop');
            let sendGasTx = await sendGas(gasDistributor, claimer, ethers.parseEther(MIN_GAS.toString()));
            console.log('Gas distributed: ', sendGasTx.hash);
        }
        await processAirdrop(recipient, claimer, airdropContractAddress, tokenAddress, tokenABI, airdropABI);
    }
}

main()