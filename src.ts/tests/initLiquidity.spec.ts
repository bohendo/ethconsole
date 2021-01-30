import { Zero, AddressZero } from "@ethersproject/constants";
import { parseEther } from "@ethersproject/units";
import { Contract } from "ethers";
import { ethers, deployments, run } from "hardhat";

import { alice, defaultLogLevel } from "../constants";

import { expect } from "./utils";

describe("Initialize Liquidity", function() {
  const signerAddress = alice.address;
  let factory: Contract;
  let weth: Contract;

  beforeEach(async () => {
    await deployments.fixture();
    factory = await (ethers as any).getContract("UniswapFactory", signerAddress);
    weth = await (ethers as any).getContract("WETH", signerAddress);
  });

  const initLiquidity = async (): Promise<string> => {
    const pairs = [] as string[];
    const allocations = [] as string[];

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

    return await run("init-liquidity", {
      signerAddress: alice.address,
      amount: "1.5",
      pairs,
      allocations,
      logLevel: defaultLogLevel,
    });
  };

  it("should deploy without error", async function () {

    this.timeout(60000);
    const liqManagerAddress = await initLiquidity();
    console.log(`Got liqManagerAddress = ${liqManagerAddress}`);
    
    expect(liqManagerAddress).not.equals(AddressZero);
  });

  it("should have zero balance leftover for all tokens", async () => {
    const liqManagerAddress = await initLiquidity();

    for (const name of [
    "FakeAAVE",
    "FakeCOMP",
    "FakeMKR",
    "FakeUNI",
    "FakeWBTC",
    "FakeYFI",
    "WETH",
    ]) {
      
      const token = await (ethers as any).getContract(name, signerAddress);
      let tokenBalance = await token.balanceOf(liqManagerAddress);
      console.log(`Balance ${name}: ${tokenBalance.toString()}`);
      expect(tokenBalance.eq(Zero)).to.be.true;
    };

  });

  it("should give liquidity tokens to msg.sender", () => {});

  it("should revert if swap returns too few tokens", () => {});

  it("should have same token reserve before and after", () => {});

  it("should have WETH reserves increase proportional to allocation ratio", () => {});

});
