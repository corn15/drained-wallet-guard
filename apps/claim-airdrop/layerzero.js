let rpc_url = "https://"
let private = ""
let addr = "0x" // the address derived from the private key
let zro = "0x6985884C4392D348587B19cb9eAAf157F13271cd"

let recv = "0x" // the address to transfer the zro to

// transfer all zro to recv
let ethers = require('ethers');
let provider = new ethers.JsonRpcProvider(rpc_url);
let wallet = new ethers.Wallet(private, provider);
let zro_contract = new ethers.Contract(zro, [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address,uint256) returns (bool)"
], wallet);



let main = async function() {
    while (1) {
        let balance = await zro_contract.balanceOf(addr);
        if (balance == 0) {
            // sleep 1s
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        }
        console.log("Owner has balance: ", balance.toString());
        let tx = await zro_contract.transfer(recv, balance);
        console.log(tx.hash);
        await tx.wait();
    }
}

main()

