import { Contract } from "ethers";
import { ethers, deployments, run } from "hardhat";

import { alice, defaultLogLevel } from "../constants";

import { expect } from "./utils";

describe("Initialize Liquidity", function() {

  beforeEach(async () => {
    await deployments.fixture();
  });

  it("should deploy without error", async () => {

    await run("init-liquidity", {
      signerAddress: alice.address,
      amount: "1.5",
      pairs: [],
      allocations: [],
      logLevel: defaultLogLevel,
    });

    // expect(liqManager.address).to.be.a("string");
  });

});
