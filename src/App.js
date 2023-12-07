import React, { useState } from "react";
import { ethers } from "ethers";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [signature, setSignature] = useState(null);
  const message = "600"; // Message representing 6% Profit

  // Function to connect to MetaMask
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setSigner(signer);
        setIsConnected(true);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      console.log("MetaMask is not installed!");
    }
  };

  // Function for EIP-712 signing
  const signDataEip721 = async () => {
    if (!signer) {
      console.error("Signer is not set");
      return;
    }

    // Define the domain and types for EIP-712
    const domain = {
      name: "IncognitoInsight",
      version: "0.0.1",
      chainId: 11155111,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
    };

    const types = {
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
      solverNickname: "SolverNickname",
    };

    try {
      const signature = await signer._signTypedData(domain, types, value);
      setSignature(signature);
      console.log("Signature:", signature);
    } catch (error) {
      console.error("Error signing data (EIP-712):", error);
    }
  };

  // Function to sign a simple message
  const signDataSimple = async () => {
    if (!signer) {
      console.error("Signer is not set");
      return;
    }

    try {
      const signature = await signer.signMessage(message);
      setSignature(signature);
      console.log("Signature:", signature);
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  // Function to get signature information
  const logSignatureInfo = async () => {
    if (!signer) {
      console.error("Signer is not set");
      return;
    }

    try {
      const {
        messageDigestBytes,
        publicKeyXBytes,
        publicKeyYBytes,
        signatureBytes,
      } = await getSignatureInfo(message, signature);

      // Create log string
      const logData = `
      Message Hash (Bytes): ${messageDigestBytes}
      Public Key X (Bytes): ${publicKeyXBytes}
      Public Key Y (Bytes): ${publicKeyYBytes}
      Signature (Bytes): ${signatureBytes}
    `;

      // Log data to console
      console.log(logData);

      // Create a blob from the log data
      const blob = new Blob([logData], { type: "text/plain" });

      // Create a link element to download the file
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "signatureInfo.txt";

      // Append the link to the body and click it to trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Clean up: remove the link element
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error logging signature info:", error);
    }
  };

  // Function to get signature information
  const getSignatureInfo = async (message, signature) => {
    // Compute the message's digest
    const messageDigest = ethers.utils.hashMessage(message);
    const messageDigestBytes = ethers.utils.arrayify(messageDigest);

    // Recover the public key
    const publicKey = ethers.utils.recoverPublicKey(messageDigest, signature);

    // Remove the '0x04' prefix from the uncompressed public key
    const publicKeyNoPrefix = publicKey.slice(4);

    // Extract X and Y coordinates (each coordinate is 64 characters long in hex)
    const publicKeyX = publicKeyNoPrefix.substring(0, 64);
    const publicKeyXBytes = ethers.utils.arrayify("0x" + publicKeyX);
    const publicKeyY = publicKeyNoPrefix.substring(64);
    const publicKeyYBytes = ethers.utils.arrayify("0x" + publicKeyY);

    // Split the signature into r, s, and v components
    const r = signature.slice(0, 66); // First 32 bytes
    const s = "0x" + signature.slice(66, 130); // Next 32 bytes

    // Convert r and s to byte arrays
    const rBytes = ethers.utils.arrayify(r);
    const sBytes = ethers.utils.arrayify(s);

    // Concatenate r and s to get a 64-byte array
    const signatureBytes = new Uint8Array([...rBytes, ...sBytes]);

    return {
      messageDigestBytes,
      publicKeyXBytes,
      publicKeyYBytes,
      signatureBytes,
    };
  };

  return (
    <div className="App">
      <header className="App-header">
        {!isConnected && (
          <button onClick={connectMetaMask}>Connect to MetaMask</button>
        )}
        {isConnected && <button onClick={signDataSimple}>Sign Message</button>}
        {isConnected && signature && (
          <button onClick={logSignatureInfo}>Get PubKey</button>
        )}
      </header>
    </div>
  );
}

export default App;
