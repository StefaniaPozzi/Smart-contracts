const { assert } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let deployer;
      let fundMe;
      let valueToSend = ethers.utils.parseEther("0.2");
      beforeEach(async function () {
        deployer = await getNamedAccounts().deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });
      it("1s. Allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: valueToSend });
        await fundMe.withdraw();
        const finalBalance = await fundMe.provider.getBalance(fundMe.address);
        assert(finalBalance.toString(), 0);
      });
    });
