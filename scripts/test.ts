import axios from "axios";
import Web3 from "web3";

import dotenv from 'dotenv'
dotenv.config()

const web3 = new Web3(process.env.RPC_URL);

const main = async () => {
  const apiUrl = "https://aggregator-api.kyberswap.com/zksync/api/v1/";
  const tokenIn = "0x2039bb4116B4EFc145Ec4f0e2eA75012D6C0f181"; // BUSD
  const tokenOut = "0x503234F203fC7Eb888EEC8513210612a43Cf6115"; // LUSD
  const amountIn = "1000000000000000000";

  // Replace these with your actual values
  const privateKey = process.env.PRIVATE_KEY || '';
  const fromAddress = "0xb76f765a785eca438e1d95f594490088afaf9acc"; // The address corresponding to the private key
  const toAddress = "0x3F95eF3f2eAca871858dbE20A93c01daF6C2e923";
  
  // Construct the URL with query parameters
  const swapRouteUrl = `${apiUrl}routes?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}`;
  const swapRouteData = await axios.get(swapRouteUrl);

  console.log(swapRouteData.data.data.routeSummary);

  const swapSignatureUrl = `${apiUrl}route/build`;
  const body = { 
    routeSummary: swapRouteData.data.data.routeSummary,
    deadline: 0,
    slippageTolerance: 100,
    sender: fromAddress,
    recipient: fromAddress,
    source: "zerolend",
  };
  const swapSignature = await axios.post(swapSignatureUrl, body);

  const value = 0;
  const data = swapSignature.data.data.data;

  const gasPrice = await web3.eth.getGasPrice();
  const nonce = await web3.eth.getTransactionCount(fromAddress);

  const gasEstimate = await web3.eth.estimateGas({
    from: fromAddress,
    to: toAddress,
    value: value,
    data: data,
  });

  console.log('nonce', nonce)
  console.log('estimated gas', gasEstimate)

  const gasLimit = Math.max(Number(gasEstimate) * 2, 44676);
  const transaction = {
    from: fromAddress,
    to: toAddress,
    value: value,
    gasLimit: web3.utils.toHex(gasLimit), // Increased gas limit
    gasPrice: gasPrice, // Example gas price
    nonce: nonce,
    data: data,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    transaction,
    privateKey
  );

  // Send the raw transaction
  const transactionResponse = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );

  console.log("Transaction sent:", transactionResponse.transactionHash);
};

main();
