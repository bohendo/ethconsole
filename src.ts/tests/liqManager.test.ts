import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, EtherSymbol } from "@ethersproject/constants";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther, parseEther } from "@ethersproject/units";
import { deployments, ethers } from "hardhat";

import { artifacts } from "../artifacts";
import { bob, logger } from "../constants";
import { getTokenNames, getTokenSafeMinimums } from "../utils";

import { expect } from "./utils";

describe.only("LiqManager", function() {
  const amount = "10";
  const log = logger.child({ module: "TestLiqManager" });
  const signer = bob.connect(ethers.provider);
  let allocations: string[];
  let liqManager: Contract;
  let pairs: string[];

  let aave: Contract;
  let comp: Contract;
  let mkr: Contract;
  let uni: Contract;

  let aavePair: string;
  let compPair: string;
  let mkrPair: string;
  let uniPair: string;

  let weth: Contract;

  beforeEach(async () => {
    await deployments.fixture();
    weth = await (ethers as any).getContract("WETH", signer.address);
    const factory = await (ethers as any).getContract("UniswapFactory", signer.address);

    aave = await (ethers as any).getContract("FakeAAVE", signer.address);
    comp = await (ethers as any).getContract("FakeCOMP", signer.address);
    mkr = await (ethers as any).getContract("FakeMKR", signer.address);
    uni = await (ethers as any).getContract("FakeUNI", signer.address);

    aavePair = await factory.getPair(weth.address, aave.address);
    compPair = await factory.getPair(weth.address, comp.address);
    mkrPair = await factory.getPair(weth.address, mkr.address);
    uniPair = await factory.getPair(weth.address, uni.address);

    liqManager = await ContractFactory
      .fromSolidity(artifacts["LiquidityManager"])
      .connect(signer)
      .deploy(weth.address);
    log.info(`Deployed LiquidityManager to ${liqManager.address}`);
    pairs = [aavePair, compPair, mkrPair, uniPair];
    allocations = ["10", "20", "30", "40"];
  });

  it("should be deployed without error", async () => {
    expect(liqManager).to.be.ok;
    expect(liqManager.address).to.be.a("string");
    expect(liqManager.address).to.not.equal(AddressZero);
  });

  it("should properly allocate deposits", async () => {
    const tokenNames = await getTokenNames(weth.address, pairs, ethers.provider);
    const tokenMins = await getTokenSafeMinimums(
      weth.address,
      amount,
      pairs,
      allocations,
      ethers.provider,
    );
    const ethAllocations = [] as BigNumber[];
    for (const allocation of allocations) {
      ethAllocations.push(parseEther(amount).mul(allocation).div(100));
    }
    log.info(`Preparing to invest a total of ${amount} ${EtherSymbol}:`);
    for (let i = 0; i < pairs.length; i++) {
      log.info(`- ${formatEther(ethAllocations[i])} ${EtherSymbol} into pair ${
        pairs[i]
      } (via >=${formatEther(tokenMins[i])} ${tokenNames[i]})`);
    }
    const tx = await liqManager.deposit(
      pairs,
      allocations,
      tokenMins,
      { value: parseEther(amount) },
    );
    const receipt = await tx.wait();
    log.info(`Success! Spent ${receipt.gasUsed} gas worth ${
      formatEther(receipt.gasUsed.mul(tx.gasPrice))
    } ${EtherSymbol}`);
  });

});

