import { ethers } from "hardhat";
import { verifyContract } from "../utils/utils";
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { ZeroAddress } from "ethers";

async function getTransparentProxyImplementationAddress(
  proxyAddress: string,
  provider: HardhatEthersProvider
) {
  const data = await provider.getStorage(
    proxyAddress,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
  );

  const addr = "0x" + data.slice(data.length - 40);
  return addr;
}

async function verifyProxyImplementation(contract_info: [string, any[]][]) {
  const provider = ethers.provider;

  const implementationAddressLs = await Promise.all(
    contract_info.map((data) => getTransparentProxyImplementationAddress(data[0], provider))
  );

  console.log({ implementationAddressLs });

  await Promise.all(
    implementationAddressLs.map((addr, i) => {
      console.log(`verifying ${contract_info[i][0]}...`);
      verifyContract(addr, contract_info[i][1]);
    })
  );
}

verifyProxyImplementation([
  // [
  //   "0x62963Eff58a94AaC1c327C95647c41724Cb69Dd7",
  //   [
  //     "Staker_1",
  //     "STR_1",
  //     "0x797f2E0b572B3cA1a31978EBE7eb465249Ad2CAc",
  //     "0xB685e6A44800972D26453FF87FEfC64cdCEcBb08",
  //     "0x939d220cEb3cd6933FE6d71aBc088b5Bbfbeb57e",
  //     ZeroAddress,
  //   ],
  // ],
]);
