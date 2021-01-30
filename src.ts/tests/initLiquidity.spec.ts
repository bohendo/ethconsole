import { BigNumber } from "@ethersproject/bignumber";
import { Zero, AddressZero } from "@ethersproject/constants";
import { parseEther } from "@ethersproject/units";
import { Contract } from "ethers";
import { ethers, deployments, run } from "hardhat";

import { alice, bob, defaultLogLevel, logger } from "../constants";

import { expect } from "./utils";
import { sqrt } from "../utils";

describe("Initialize Liquidity", function() {
  const log = logger.child({ module: "TestInitLiq" });
  const signerAddress = bob.address;
  const investAmount = "1.5";
  const investPortfolio = {
    "FakeAAVE": "30",
    "FakeCOMP": "30",
    "FakeWBTC": "10",
    "FakeYFI": "30"
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
    for (const [name, allocation] of [
      ["FakeAAVE", "30"],
      ["FakeCOMP", "30"],
      ["FakeMKR",  "0"],
      ["FakeUNI",  "0"],
      ["FakeWBTC", "10"],
      ["FakeYFI",  "30"],
    ]) {
      if (parseEther(allocation).lte(Zero)) {
        continue
      }
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);
      pairs.push(pairAddress);
      allocations.push(allocation);
    }
  });

  const initLiquidity = async (minTokens?: string[]): Promise<string> => {
    return await run("init-liquidity", {
      signerAddress: bob.address,
      amount: investAmount,
      pairs,
      allocations,
      minTokens: minTokens || [],
      logLevel: defaultLogLevel,
    });
  };

  it("should run without error", async () => {
    const liqManagerAddress = await initLiquidity();
    log.info(`Got liqManagerAddress = ${liqManagerAddress}`);
    expect(liqManagerAddress).not.equals(AddressZero);
  });

  it("should have zero balance leftover for all tokens", async () => {
    const liqManagerAddress = await initLiquidity();

    for (const name of [ ...Object.keys(investPortfolio), "WETH"]) {
      const token = await (ethers as any).getContract(name, signerAddress);
      let tokenBalance = await token.balanceOf(liqManagerAddress);
      log.info(`Balance ${name}: ${tokenBalance.toString()}`);
      expect(tokenBalance.eq(Zero)).to.be.true;
    };
  });

  it("should give liquidity tokens to msg.sender", async () => {
    const liqManagerAddress = await initLiquidity();

    for (const name of Object.keys(investPortfolio)) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);

      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);
      let liquidityTokenBalance = await pair.balanceOf(signerAddress);

      console.log(`Balance ${name}-WETH Uniswap Pair: ${liquidityTokenBalance.toString()}`);
      expect(liquidityTokenBalance.gt(Zero)).to.be.true;
    }

  });

  it.only("should revert if swap returns too few tokens", async () => {
    const router = await (ethers as any).getContract("UniswapRouter", alice.address);

    const intermediateSwapAmount = (
      wethInvestment: BigNumber,
      wethReserve: BigNumber,
    ): BigNumber => {
        const b = wethReserve.mul(1997);
        const c = wethReserve.mul(3988000).mul(wethInvestment);
        const a = wethReserve.mul(wethReserve).mul(3988009);
        return ((sqrt(a.add(c))).sub(b)).div(1994);
    };

    // First, determine the safe token minimums given the current chain state
    const tokenMinimums = [] as string[];
    for (let i = 0; i < pairs.length; i++) {
      const pairAddress = pairs[i]
      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);
      const token0 = await pair.token0();
      let wethReserves;
      let tokenReserves;
      let token;
      if (token0 === weth.address) {
        [wethReserves, tokenReserves,] = await pair.getReserves();
        token = await (ethers as any).getContractAt(
          "FakeToken",
          await pair.token1(),
          signerAddress,
        );
      } else {
        [tokenReserves, wethReserves,] = await pair.getReserves();
        token = await (ethers as any).getContractAt(
          "FakeToken",
          token0,
          signerAddress,
        );
      }
      const amountOut = await router.getAmountOut(
        intermediateSwapAmount(parseEther(allocations[i]), wethReserves),
        wethReserves,
        tokenReserves,
      );
      tokenMinimums.push(amountOut.mul(995).div(1000).toString());
    }

    // Second, change the chain state to make swaps unsafe
    router.swapExactETHForTokens(
      Zero,
      [pairs[0]],
      alice.address,
      Date.now() + 60000,
      { value: parseEther("10") }
    )

    // Third, execute liquidity initialization
    const liqManagerAddress = await run("init-liquidity", {
      signerAddress: bob.address,
      amount: "1.5",
      pairs,
      allocations,
      minTokens: tokenMinimums,
      logLevel: defaultLogLevel,
    });
  });

  it("should have same token reserve before and after", async () => {

    const initialReserves = {};

    for (const name of Object.keys(investPortfolio)) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);

      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);

      let token0 = await pair.token0();

      if (token0 === weth.address){
        initialReserves[name] = (await pair.getReserves())[1];
      } else {
        initialReserves[name] = (await pair.getReserves())[0];
      }
    }

    const liqManagerAddress = await initLiquidity();

    for (const name of Object.keys(investPortfolio)) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);
      let finalReserve;

      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);

      let token0 = await pair.token0();

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

      let token0 = await pair.token0();

      if (token0 === weth.address){
        initialReserves[name] = (await pair.getReserves())[0];
      } else {
        initialReserves[name] = (await pair.getReserves())[1];
      }
    }

    const liqManagerAddress = await initLiquidity();

    for (const name of Object.keys(investPortfolio)) {
      const token = await (ethers as any).getContract(name, signerAddress);
      const pairAddress = await factory.getPair(weth.address, token.address);
      let finalReserve;

      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);

      let token0 = await pair.token0();

      if (token0 === weth.address){
        finalReserve = (await pair.getReserves())[0];
      } else {
        finalReserve = (await pair.getReserves())[1];
      }

      let expectedReserve = initialReserves[name].add(parseEther(investAmount).mul(investPortfolio[name]).div("100"));

      console.log(`${name}-WETH pool
       Initial WETH Reserve: ${initialReserves[name].toString()},
       Final WETH Reserve: ${finalReserve}
       Expected WETH Reserve: ${expectedReserve}`);

      expect(finalReserve.eq(expectedReserve)).to.be.true;
    }

  });

});
