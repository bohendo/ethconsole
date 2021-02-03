import { Signer } from "@ethersproject/abstract-signer";
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
  let allocations: string[];
  let liqManager: Contract;
  let pairs: string[];
  let signer: Signer;
  let weth: Contract;
  let tokenNames: string[];
  let ethAllocations: BigNumber[];
  let tokenMins: string[];

  beforeEach(async () => {
    await deployments.fixture();
    signer = await (ethers as any).getSigner(bob.address),
    weth = await (ethers as any).getContract("WETH", bob.address);
    const factory = await (ethers as any).getContract("UniswapFactory", bob.address);
    const aave = await (ethers as any).getContract("FakeAAVE", bob.address);
    const comp = await (ethers as any).getContract("FakeCOMP", bob.address);
    const mkr = await (ethers as any).getContract("FakeMKR", bob.address);
    const uni = await (ethers as any).getContract("FakeUNI", bob.address);
    liqManager = await ContractFactory
      .fromSolidity(artifacts["LiquidityManager"])
      .connect(signer)
      .deploy(weth.address);
    log.info(`Deployed LiquidityManager to ${liqManager.address}`);
    pairs = [
      await factory.getPair(weth.address, aave.address),
      await factory.getPair(weth.address, comp.address),
      await factory.getPair(weth.address, mkr.address),
      await factory.getPair(weth.address, uni.address),
    ];
    allocations = ["10", "20", "30", "40"];
    tokenNames = await getTokenNames(weth.address, pairs, ethers.provider);
    tokenMins = await getTokenSafeMinimums(
      weth.address,
      amount,
      pairs,
      allocations,
      ethers.provider,
    );
    ethAllocations = [];
    for (const allocation of allocations) {
      ethAllocations.push(parseEther(amount).mul(allocation).div(100));
    }
  });

  it("should be deployed without error", async () => {
    expect(liqManager).to.be.ok;
    expect(liqManager.address).to.be.a("string");
    expect(liqManager.address).to.not.equal(AddressZero);
  });

  it("should properly allocate deposits", async () => {
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
    log.info(`AAVE balance: ${formatEther(await liqManager.getBalance(pairs[0]))} ${EtherSymbol}`);
    log.info(`COMP balance: ${formatEther(await liqManager.getBalance(pairs[1]))} ${EtherSymbol}`);
    log.info(`MKR balance: ${formatEther(await liqManager.getBalance(pairs[2]))} ${EtherSymbol}`);
    log.info(`UNI balance: ${formatEther(await liqManager.getBalance(pairs[3]))} ${EtherSymbol}`);
    log.info(`Total balance: ${formatEther(await liqManager.getBalances(pairs))} ${EtherSymbol}`);
  });

});

