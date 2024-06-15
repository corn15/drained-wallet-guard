
let { ethers } = require("ethers");

let sendGas = async (from, to, gas) => {
    const nonce = await from.getNonce();
    let tx = {
        to: to,
        value: gas,
        nonce: nonce,
    }

    let receipt = await from.sendTransaction(tx);
    return receipt;
}

let processAirdrop = async (to, claimerWallet, airdropContractAddress, tokenAddress, tokenABI, airdropABI) => {
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, claimerWallet);
    const airdropContract = new ethers.Contract(airdropContractAddress, airdropABI, claimerWallet);

    try {
        console.log('Attempting to claim airdrop...');

        const claimNonce = await claimerWallet.getNonce();
        let claimTx = await airdropContract.claim({nonce: claimNonce});
        console.log('Transaction sent: ', claimTx.hash);
        let claimReceipt = await claimTx.wait();
        console.log('Transaction confirmed: ', claimReceipt);

        let balance = await tokenContract.balanceOf(claimerWallet.address);
        console.log('Claimer balance: ', balance.toString());

        const transferNonce = await claimerWallet.getNonce();
        let transferTx = await tokenContract.transfer(to, balance, {nonce: transferNonce});
        console.log('Transfer transaction sent: ', transferTx.hash);
        let transferReceipt = await transferTx.wait();
        console.log('Transfer transaction confirmed: ', transferReceipt);

    } catch (error) {
        console.error('Error claiming airdrop: ', error);
    }
}

module.exports = { processAirdrop, sendGas };
