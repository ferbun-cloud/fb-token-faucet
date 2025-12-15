import express from "express";
import cors from "cors";
import { ethers } from "ethers";

const app = express();
app.use(cors());
app.use(express.json());

// ENV VARIABLEN (kommen von Render)
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const RPC_URL = process.env.BSC_RPC_URL;

const TOKEN_ADDRESS = "0x998c146D1543eC3783549068D9E2024C84d29DAe";
const TOKEN_DECIMALS = 8;

const ABI = [
  "function transfer(address to, uint256 amount) returns (bool)"
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(TOKEN_ADDRESS, ABI, wallet);

app.post("/claim", async (req, res) => {
  try {
    const { address } = req.body;

    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ error: "Ungültige Adresse" });
    }

    const amount = ethers.utils.parseUnits("100", TOKEN_DECIMALS);
    const tx = await contract.transfer(address, amount);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Faucet läuft auf Port 3000");
});
