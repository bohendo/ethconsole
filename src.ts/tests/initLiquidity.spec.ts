import { Zero } from "@ethersproject/constants";
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

  it("should deploy without error", async () => {

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

    await run("init-liquidity", {
      signerAddress: alice.address,
      amount: "1.5",
      pairs,
      allocations,
      logLevel: defaultLogLevel,
    });
    // expect(liqManager.address).to.be.a("string");
  });

});
