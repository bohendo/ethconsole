import { Zero, AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";
import { ethers, deployments } from "hardhat";

import { alice, bob, logger } from "../constants";
import { getTokenSafeMinimums } from "../utils";
import { initLiq } from "../initLiq";

import { expect } from "./utils";

describe("Init Liquidity", function() {
  const log = logger.child({ module: "TestInitLiq" });
  const signerAddress = bob.address;
  const investAmount = "1.5";
  const investPortfolio = {
    "FakeAAVE": "30",
    "FakeCOMP": "30",
    "FakeWBTC": "10",
    "FakeYFI": "30",
  };
  let factory: Contract;
  let weth: Contract;
  let pairs: string[];
  let allocations: string[];

  beforeEach(async () => {
    await deployments.fixture();
    factory = await (ethers as any).getContract("UniswapFactory", signerAddress);
    weth = await (ethers as any).getContract("WETH", signerAddress);
    pairs = [];
    allocations = [];
    for (const [name, allocation] of Object.entries(investPortfolio)) {
      if (parseEther(allocation).lte(Zero)) {
        continue;
      }
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);
      pairs.push(pairAddress);
      allocations.push(allocation);
    }
  });

  const initLiqTask = async (minTokens?: string[]): Promise<string> => {
    const initLiqRes = await initLiq(
      weth.address,
      investAmount,
      pairs,
      allocations,
      await (ethers as any).getSigner(bob.address),
      minTokens || [],
    );
    return initLiqRes.address;
  };

  it("should run without error", async () => {
    const liqManagerAddress = await initLiqTask();
    log.info(`Got liqManagerAddress = ${liqManagerAddress}`);
    expect(liqManagerAddress).not.equals(AddressZero);
  });

  it("should have zero balance leftover for all tokens", async () => {
    const liqManagerAddress = await initLiqTask();
    for (const name of [ ...Object.keys(investPortfolio), "WETH"]) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const tokenBalance = await token.balanceOf(liqManagerAddress);
      log.info(`Balance ${name}: ${tokenBalance.toString()}`);
      expect(tokenBalance.eq(Zero)).to.be.true;
    };
  });

  it("should give liquidity tokens to msg.sender", async () => {
    await initLiqTask();
    for (const name of Object.keys(investPortfolio)) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);
      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);
      const liquidityTokenBalance = await pair.balanceOf(signerAddress);
      console.log(`Balance ${name}-WETH Uniswap Pair: ${liquidityTokenBalance.toString()}`);
      expect(liquidityTokenBalance.gt(Zero)).to.be.true;
    }
  });

  it("should revert if swap returns too few tokens", async () => {
    const router = await (ethers as any).getContract("UniswapRouter", alice.address);
    // First, determine the safe token minimums given the current chain state
    log.info(`Getting token minimums..`);
    const tokenMinimums = await getTokenSafeMinimums(
      weth.address,
      investAmount,
      pairs,
      allocations,
      ethers.provider,
    );
    // Second, change the chain state to make swaps unsafe
    const pair0 = await (ethers as any).getContractAt("UniswapPair", pairs[0]);
    const token0 = await pair0.token0();
    let tokenAddress: string;
    if (token0 === weth.address) {
      tokenAddress = await pair0.token1();
    } else {
      tokenAddress = token0;
    }
    log.info(`Swapping some shit`);
    router.swapExactETHForTokens(
      Zero,
      [weth.address, tokenAddress],
      alice.address,
      Date.now() + 60000,
      { value: parseEther("100") },
    );
    // Third, execute liquidity initialization
    log.info(`TEST tokenMinimums: ${tokenMinimums}`);
    await expect(initLiq(
      weth.address,
      investAmount,
      pairs,
      allocations,
      await (ethers as any).getSigner(bob.address),
      tokenMinimums,
    )).to.be.revertedWith("Liquidity Manager: TOO_FEW_TOKENS");
  });

  it("should have same token reserve before and after", async () => {
    const initialReserves = {};
    for (const name of Object.keys(investPortfolio)) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);
      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);
      const token0 = await pair.token0();
      if (token0 === weth.address){
        initialReserves[name] = (await pair.getReserves())[1];
      } else {
        initialReserves[name] = (await pair.getReserves())[0];
      }
    }
    await initLiqTask();
    for (const name of Object.keys(investPortfolio)) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);
      let finalReserve;
      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);
      const token0 = await pair.token0();
      if (token0 === weth.address){
        finalReserve = (await pair.getReserves())[1];
      } else {
        finalReserve = (await pair.getReserves())[0];
      }
      console.log(`${name} Initial Reserve: ${initialReserves[name].toString()}, Final Reserve: ${finalReserve}`);
      expect(finalReserve.eq(initialReserves[name])).to.be.true;
    }
  });

  it("should have WETH reserves increase proportional to allocation ratio", async () => {
    const initialReserves = {};
    for (const name of Object.keys(investPortfolio)) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);
      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);
      const token0 = await pair.token0();
      if (token0 === weth.address){
        initialReserves[name] = (await pair.getReserves())[0];
      } else {
        initialReserves[name] = (await pair.getReserves())[1];
      }
    }
    await initLiqTask();
    for (const name of Object.keys(investPortfolio)) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);
      let finalReserve;
      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);
      const token0 = await pair.token0();
      if (token0 === weth.address){
        finalReserve = (await pair.getReserves())[0];
      } else {
        finalReserve = (await pair.getReserves())[1];
      }
      const expectedReserve = initialReserves[name].add(parseEther(investAmount).mul(investPortfolio[name]).div("100"));
      console.log(`${name}-WETH pool
       Initial WETH Reserve: ${initialReserves[name].toString()},
       Final WETH Reserve: ${finalReserve}
       Expected WETH Reserve: ${expectedReserve}`);
      expect(finalReserve.eq(expectedReserve)).to.be.true;
    }
  });

  it("should not deploy any code to the contract address", async () => {
    const liqManagerAddress = await initLiqTask();
    const code = await ethers.provider.getCode(liqManagerAddress);
    log.info(`Got liqManagerAddress with ${code.length/2-1} bytes of code: ${code}`);
    expect(code.replace(/^0x/, "")).to.equal("");
  });

});
