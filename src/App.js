import React, { useState } from "react";
import { ethers } from "ethers";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);

  // Function to connect to MetaMask
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log("Provider:", provider);
        setSigner(provider.getSigner());
        console.log("Signer:", provider.getSigner());
        setIsConnected(true);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("MetaMask is not installed!");
    }
  };

  // EIP-712 signing function
  const signData = async () => {
    if (!signer) return;

    // All properties on a domain are optional
    const domain = {
      name: "IncognitoInsight",
      version: "0.0.1",
      chainId: 11155111,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
    };

    // The named list of all type definitions
    let types = {
      Challenge: [
        { name: "challengerAddress", type: "address" },
        { name: "platform", type: "address" },
        { name: "holdings", type: "Holdings" },
        { name: "expectedProfitPercentage", type: "uint256" },
        { name: "actualProfitPercentage", type: "uint256" },
        { name: "solverAddress", type: "address" },
        { name: "solverNickname", type: "string" },
      ],
      Holdings: [
        { name: "tokenHeld1", type: "address" },
        { name: "tokenHeld2", type: "address" },
        { name: "tokenHeld3", type: "address" },
        { name: "tokenHeld4", type: "address" },
        { name: "tokenHeld5", type: "address" },
      ],
    };

    // The data to sign
    const value = {
      challengerAddress: "0x0000000000000000000000000000000000000000",
      platform: "0x0000000000000000000000000000000000000000",
      holdings: {
        tokenHeld1: "0x0000000000000000000000000000000000000000",
        tokenHeld2: "0x0000000000000000000000000000000000000000",
        tokenHeld3: "0x0000000000000000000000000000000000000000",
        tokenHeld4: "0x0000000000000000000000000000000000000000",
        tokenHeld5: "0x0000000000000000000000000000000000000000",
      },
      expectedProfitPercentage: 500,
      actualProfitPercentage: 600,
      solverAddress: "0x0000000000000000000000000000000000000000",
      solverNickname: "############################test",
    };

    try {
      const signature = await signer._signTypedData(domain, types, value);
      console.log("Signature:", signature);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {!isConnected && (
          <button onClick={connectMetaMask}>Connect to MetaMask</button>
        )}
        {isConnected && <button onClick={signData}>Sign Message</button>}
      </header>
    </div>
  );
}

export default App;
