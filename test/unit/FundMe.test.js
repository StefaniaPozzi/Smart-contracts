const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { getFunctionDocumentation } = require("typechain");

const valueToSend = ethers.utils.parseEther("1"); //or 1000000000000000000

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let deployer;
      let fundMe;
      let mockV3Aggregator;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer); //recent deployment!
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });
      describe("Fund", async function () {
        it("Fails if you dont send enough eths", async function () {
          await expect(fundMe.fund()).to.be.revertedWith("Minimum 1 eth");
        });
        it("Updates the founders to ledger data structure", async function () {
          await fundMe.fund({ value: valueToSend });
          const response = await fundMe.getAddressToAmount(deployer);
          assert.equal(response.toString(), valueToSend.toString());
        });
        it("Add s_funders to ledger data structure", async function () {
          await fundMe.fund({ value: valueToSend });
          const founder = await fundMe.getFounders(0);
          assert.equal(founder, deployer);
        });
      });
      describe("Withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: valueToSend });
        });
        it("withdraw ETH from a single founder", async function () {
          //Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // //Act
          const txResponse = await fundMe.withdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          //Assert
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it("withdraw with multiple founders", async function () {
          const accounts = await ethers.getSigners();
          //Arrange
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: valueToSend });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Act
          const txResponse = await fundMe.withdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          await expect(fundMe.getFounders(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            const amount = await fundMe.getAddressToAmount(accounts[i].address);
            assert.equal(amount.toString(), 0);
          }
        });
        it("only owner", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[2];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        });
      });
    });
