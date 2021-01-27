import { Contract } from "ethers";
import { ethers, deployments } from "hardhat";

import { alice } from "../constants";

import { expect } from "./utils";

describe("LiquidityManager", function() {
  let liqManager: Contract;

  beforeEach(async () => {
    await deployments.fixture(); // Start w fresh deployments
    liqManager = await (ethers as any).getContract("LiquidityManager", alice);
  });

  it("should deploy without error", async () => {
    expect(liqManager.address).to.be.a("string");
  });

});
