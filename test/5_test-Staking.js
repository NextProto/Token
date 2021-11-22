const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("Duration Distribution", function () {

    let owner;
    let distribution;
    let tokenEth;
    let address1;
    let address2;


    beforeEach(async function () {
        const TokenEth = await ethers.getContractFactory("TokenEth");
        tokenEth = await TokenEth.deploy();
        await tokenEth.deployed();
        const Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy( "0xb81bE6f200De9CF5bFe5a6361073e6a8Bb8D1f0D" ,tokenEth.address);
        await staking.deployed();

        [owner, address1, address2] = await ethers.getSigners();
    })
    it("Should successfully deploy", async function () {
        const contractOwner = await staking.owner()
        expect(contractOwner).to.equal(owner.address)
        console.log("deployed successfully to test localhost, with account: ", owner.address);
    });
    it("Should be able to set _rewardDistribution address", async function () {
        const settingRewardDistribution = await staking.setRewardDistribution(owner.address)
        const rewardDistribution = await staking.rewardDistribution()
        expect(rewardDistribution).to.equal(owner.address)
    });
    it("Should be able to set reward amount", async function () {
        console.log(owner.address)
        const settingRewardDistribution = await staking.setRewardDistribution(owner.address)
        const notifyRewardAmount = await staking.connect(owner).notifyRewardAmount(ethers.utils.parseEther("30000"))
        const rewardRate = await staking.rewardRate()
        const lastUpdateTime = await staking.lastUpdateTime()
        const periodFinish = await staking.periodFinish()
        // console.log(rewardRate.toString(), lastUpdateTime.toString(), parseInt(periodFinish.toString()) - (parseInt(Date.now() / 1000)+(86400 * 61)))
    });
});