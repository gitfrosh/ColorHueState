const { assert, expect } = require("chai");
const { accounts } = require("../scripts/helpers/utils");
// const truffleAssert = require("truffle-assertions");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

// const ColorHueState = artifacts.require("ColorHueState");
// ColorHueState.numberFormat = "BigNumber";


describe("ColorHueState", function () {
  let DUDE;

  describe("Contract", () => {
    it("should deploy", async () => {
      const [OWNER] = await ethers.getSigners();

      const Contract = await ethers.getContractFactory("ColorHueState");
      const contractDeployed = await Contract.deploy();

      contractDeployed.toggleSale();
      await mine(8746179);
      contractDeployed.mint(8746179, { value: 1000000000000000, gasLimit: 10000000 });

    });
  });


  // describe("Transfers", function () {
  //   it("Should transfer the funds to the owner", async function () {
  //     const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //       deployOneYearLockFixture
  //     );

  //     await time.increaseTo(unlockTime);

  //     await expect(lock.withdraw()).to.changeEtherBalances(
  //       [owner, lock],
  //       [lockedAmount, -lockedAmount]
  //     );
  //   });
  // });
});

