import { deployments } from "hardhat";

import { expect } from "./utils";

describe("LiquidityManager", function() {
  this.timeout(360_000);
  it("should deploy without error", async () => {
    await expect(deployments.fixture()).to.be.ok;
  });
});
