import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BaseContract, ContractTransactionResponse } from "ethers";
import { ethers, run, upgrades } from "hardhat";
const fs = require("fs");
const path = require("path");

export async function contractAt(
  name: string,
  address: string,
  provider: HardhatEthersProvider | HardhatEthersSigner,
  options?: any
) {
  let contractFactory = await ethers.getContractFactory(name, options);
  if (provider) {
    contractFactory = contractFactory.connect(provider);
  }
  return await contractFactory.attach(address);
}

const contractAddressesFilepath = path.join(
  __dirname,
  "..",
  "..",
  "contractAddress",
  `contract-addresses-${process.env.HARDHAT_NETWORK || "local"}.json`
);

export async function readContractAddress() {
  if (fs.existsSync(contractAddressesFilepath)) {
    return JSON.parse(fs.readFileSync(contractAddressesFilepath));
  }
  return {};
}

export async function sendTxn(txnPromise: any, label?: string) {
  const txn = await txnPromise;
  console.info(`Sending ${label}...`);
  await txn.wait(1);
  console.info(`... Sent! ${txn.hash}`);
  return txn;
}

export async function verifyContract(
  contractAddress: string,
  args: any[],
  specificVerifyContract: any
) {
  specificVerifyContract
    ? await callWithRetries(run, [
        "verify:verify",
        {
          address: contractAddress,
          constructorArguments: args,
          contract: specificVerifyContract,
        },
      ])
    : await callWithRetries(run, [
        "verify:verify",
        {
          address: contractAddress,
          constructorArguments: args,
        },
      ]);
}

async function callWithRetries(func: any, args: any[], retriesCount = 3) {
  let i = 0;
  while (true) {
    i++;
    try {
      return await func(...args);
    } catch (ex: any) {
      if (i === retriesCount) {
        console.error("call failed %s times. throwing error", retriesCount);
        throw ex;
      }
      console.error("call i=%s failed. retrying....", i);
      console.error(ex.message);
    }
  }
}

function readTmpAddresses() {
  if (fs.existsSync(contractAddressesFilepath)) {
    return JSON.parse(fs.readFileSync(contractAddressesFilepath));
  }
  return {};
}

function writeTmpAddresses(json: any) {
  const currentAddresses = readTmpAddresses();
  const ks = Object.keys(json);
  for (let i = 0; i < ks.length; i++) {
    if (currentAddresses[ks[i]]) {
      // use red color to indicate error
      console.log("\x1b[31m%s\x1b[0m", "Error: key existed, exit process");
      process.exit();
    }
  }

  const tmpAddresses = Object.assign(currentAddresses, json);
  fs.writeFileSync(contractAddressesFilepath, JSON.stringify(tmpAddresses));
}

export async function deployContract({
  name,
  args,
  label,
  options,
  factoryOptions,
  specificVerifyContract,
  isProxy,
}: {
  name: string;
  args: any[];
  label?: string;
  options?: any;
  factoryOptions?: any;
  specificVerifyContract?: string;
  isProxy?: boolean;
}) {
  // construct info
  let info = name;
  if (label) {
    info = name + ":" + label;
  }

  // get contract factory
  const contractFactory = factoryOptions
    ? await ethers.getContractFactory(name, factoryOptions)
    : await ethers.getContractFactory(name);

  // add deployment options if exists, and deploy contract
  let contract: BaseContract;
  let maxPriorityFeePerGasSetting = {
    maxPriorityFeePerGas: 100000,
    gasLimit: 18000000,
  };

  options = options
    ? Object.assign({}, options, maxPriorityFeePerGasSetting)
    : maxPriorityFeePerGasSetting;

  if (isProxy) {
    contract = await upgrades.deployProxy(contractFactory, args, { initializer: "initialize" });
  } else {
    contract = await contractFactory.deploy(...args, options);
  }

  // log
  const contract_addr = await contract.getAddress();
  const argStr = args.map((i) => `"${i}"`).join(" ");
  console.info(`Deploying ${info} ${contract_addr} ${argStr}`);

  // save contract address
  writeTmpAddresses({ [`${info}`]: contract_addr });

  // wait deployment
  await (contract.deploymentTransaction() as ContractTransactionResponse).wait();

  // verify contract
  if (process.env.VerifyContract == "true") {
    if (isProxy) {
      await verifyProxyImplementation([[contract_addr, args, specificVerifyContract]]);
    } else {
      await verifyContract(contract_addr, args, specificVerifyContract);
    }
  }
  console.info("... Completed!");
  return contract;
}

async function getTransparentProxyImplementationAddress(
  proxyAddress: string,
  provider: HardhatEthersProvider
) {
  let proxy_slot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

  const data = await provider.getStorage(proxyAddress, proxy_slot);

  if (!data) {
    throw "no implementation found";
  }

  const addr = "0x" + data.slice(data.length - 40);
  return addr;
}

async function verifyProxyImplementation(contract_info: [string, any[], any][]) {
  const provider = ethers.provider;

  const implementationAddressLs = await Promise.all(
    contract_info.map((data) => getTransparentProxyImplementationAddress(data[0], provider))
  );

  await Promise.all(
    implementationAddressLs.map((addr, i) => {
      console.log(`verifying ${contract_info[i][0]}...`);
      verifyContract(addr, contract_info[i][1], contract_info[i][2]);
    })
  );
}
