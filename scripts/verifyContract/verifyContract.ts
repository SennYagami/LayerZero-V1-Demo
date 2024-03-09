import { ethers } from "ethers";
import { readContractAddress, verifyContract } from "../utils/utils";

async function main() {
  // await verifyContract("0xFF11c73eC90875910760Cea75b8c0D64295c2A00", []);
  // await verifyContract("0x71f64c5b2af5fc243ff5bc90c923427f7071e0bc", []);
  await verifyContract("0x797f2E0b572B3cA1a31978EBE7eb465249Ad2CAc", [
    BigInt(10000000000) * BigInt(10 ** 18),
  ]);
}

main();
