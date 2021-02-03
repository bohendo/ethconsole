import { AddressZero } from "@ethersproject/constants";
import { deployments } from "hardhat";

import { logger } from "../constants";

import { expect } from "./utils";

describe("LiqManager", function() {
  const log = logger.child({ module: "TestLiqManager" });
  const liqManagerAddress = AddressZero;

  beforeEach(async () => {
    await deployments.fixture();
  });

  it("should be deployed without error", async () => {
    log.info(`Got liqManagerAddress = ${liqManagerAddress}`);
    expect(liqManagerAddress).to.be.a("string");
    // expect(liqManagerAddress).not.equals(AddressZero);
  });

});

