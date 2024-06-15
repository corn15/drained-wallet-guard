let ethers = require('ethers');

let signPermitMessage = async function(chainID, tokenName, tokenCA, ownerWallet, spenderAddr, nonce) {
    let domain = {
        name: tokenName,
        version: "1",
        chainId: chainID,
        verifyingContract: tokenCA,
    };

    let types = {
        Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
        ],
    };

    let message = {
        owner: ownerWallet.address,
        spender: spenderAddr,
        value: ethers.MaxUint256.toString(),
        nonce: nonce,
        deadline: ethers.MaxUint256,
    };

    let signature = await ownerWallet.signTypedData(domain, types, message);

    return signature;
}

let generatePermitSignatures = async function(chainId, token, ownerWallets, spenderAddr) {
    let tokenCA = await token.getAddress();
    let tokenName = await token.name();

    const signatures = [];
    const vs = [];
    const rs = [];
    const ss = [];

    for (wallet of ownerWallets) {
        const nonces = await token.nonces(wallet.address);
        const signature = await signPermitMessage(chainId, tokenName, tokenCA, wallet, spenderAddr, nonces);
        const { v, r, s } = ethers.Signature.from(signature);
        vs.push(v);
        rs.push(r);
        ss.push(s);
        signatures.push({ signature, v, r, s });
    }

    return [signatures, vs, rs, ss];
}

module.exports = { generatePermitSignatures };