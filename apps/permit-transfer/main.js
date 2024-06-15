let ethers = require('ethers');
let { readJson } = require('../../src/io.js');
let { generatePermitSignatures } = require('../../src/permit.js');

ABI_DIR = '../../abi/zksync';
SECRET_PATH = '../../.secrets';

let main = async function() {
    const collectorInfo = await readJson(`${ABI_DIR}/collector.json`);
    const collectorCA = collectorInfo["address"];
    const collectorABI = collectorInfo["abi"];

    const tokenInfo = await readJson(`${ABI_DIR}/token.json`);
    const tokenCA = tokenInfo["address"];
    const tokenABI = tokenInfo["abi"];

    const secrets = await readJson(SECRET_PATH);
    const rpc = secrets["rpc-l2"];
    const gasProvider = secrets["private-key-gas-provider"];
    const owners = secrets["private-key-claimers"];

    let provider = new ethers.JsonRpcProvider(rpc);
    let token = new ethers.Contract(tokenCA, tokenABI, provider);
    let ownerWallets = [];
    let ownerAddrs = [];
    for (let key of owners) {
        let w = new ethers.Wallet(key, provider);
        ownerWallets.push(w);
        ownerAddrs.push(w.address);
    }

    let wallet = new ethers.Wallet(gasProvider, provider);
    let collector = new ethers.Contract(collectorCA, collectorABI, wallet);

    let chainId = (await provider.getNetwork()).chainId;

    while (true) {
        for (let i = 0; i < owners.length; i++) {
            let balance = await token.balanceOf(ownerWallets[i].address);
            if (balance == 0) {
                continue;
            }
            console.log("Owner ", i, " has balance: ", balance.toString());
            const [signatures, vs, rs, ss] = await generatePermitSignatures(chainId, token, ownerWallets, collectorCA);
            console.log("Permit Signatures: ", signatures);
            let tx = await collector.permitTransfer(ownerAddrs, vs, rs, ss);
            console.log(tx.hash);
            await tx.wait();
            console.log("Done");
        }
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}

main();