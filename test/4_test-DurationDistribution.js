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
        const Distribution = await ethers.getContractFactory("DurationPrivateDistribution");
        distribution = await Distribution.deploy(tokenEth.address);
        await distribution.deployed();

        [owner, address1, address2] = await ethers.getSigners();
    })
    it("Should successfully deploy", async function () {
        const contractOwner = await distribution.owner()
        expect(contractOwner).to.equal(owner.address)
        console.log("deployed successfully to test localhost, with account: ", owner.address);
    });
    it("Should be initialized", async function () {
        const initialTimestamp = parseInt(Date.now() / 1000)
        const setInitialTimestamp = await distribution.setInitialTimestamp(initialTimestamp)
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        expect(initialTimestamp).to.equal(parseInt(getInitalTimestamp._hex, 16))
        const isInitialized = await distribution.isInitialized()
        const isFinalized = await distribution.isFinalized()
        expect(isInitialized).to.equal(true)
        expect(isFinalized).to.equal(false)
    })

    it("Should be able to add and fetch investors", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address, address2.address], [ethers.utils.parseEther("1100"), ethers.utils.parseEther("900")])
        const investor1 = await distribution.investorsInfo(address1.address)
        const investor2 = await distribution.investorsInfo(address2.address)
        expect(investor1.exists).to.equal(true)
        expect(investor1.withdrawnTokens).to.equal(0)
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("1100"))
        expect(investor2.exists).to.equal(true)
        expect(investor2.withdrawnTokens).to.equal(0)
        expect(investor2.tokensAllotment).to.equal(ethers.utils.parseEther("900"))
        console.log("information of investors, Investor 1", `exists: ${investor1.exists}`, ` withdrawnTokens: ${investor1.withdrawnTokens} `, ` tokensAllotment: ${investor1.tokensAllotment} `)
        console.log("information of investors, Investor 2", `exists: ${investor2.exists}`, ` withdrawnTokens: ${investor2.withdrawnTokens} `, ` tokensAllotment: ${investor2.tokensAllotment} `)
    });

    it("Contract owner should not be able to withdraw tokens", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000))
        const addInvestors = await distribution.addInvestors([address1.address, address2.address], [ethers.utils.parseEther("1100"), ethers.utils.parseEther("900")])
        await expect(
            distribution.withdrawTokens()
        ).to.be.revertedWith("Only investors allowed");
    });

    it("Investor Can withdraw tokens", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000))
        const addInvestors = await distribution.addInvestors([address1.address, address2.address], [ethers.utils.parseEther("1100"), ethers.utils.parseEther("900")])
        const withdrawableTokens = await distribution.withdrawableTokens(address1.address)
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("1500"))
        let tokenBalance = await tokenEth.balanceOf(distribution.address)
        await distribution.connect(address1).withdrawTokens()
        tokenBalance = await tokenEth.balanceOf(address1.address)
        const tokenBalanceForAdd1 = parseInt(tokenBalance.toString()) / (10 ** 18)
        expect(tokenBalanceForAdd1).to.equal(110)
    });

    it("checks if the funds are released after 1 days", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - 86400);
        const addInvestors = await distribution.addInvestors([address1.address, address2.address], [ethers.utils.parseEther("1100"), ethers.utils.parseEther("900")])
        const withdrawableTokens = await distribution.withdrawableTokens(address1.address)
        expect(withdrawableTokens).to.equal(ethers.utils.parseEther("110.000000000000000000"))
    })
    it("Should be able to add and fetch investors after withdrawl", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - (86400 * 90))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address, address2.address], [ethers.utils.parseEther("1100"), ethers.utils.parseEther("900")])
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("1500"))
        await distribution.connect(address1).withdrawTokens()
        await distribution.connect(address2).withdrawTokens()
        const investor1 = await distribution.investorsInfo(address1.address)
        const investor2 = await distribution.investorsInfo(address2.address)
        expect(investor1.exists).to.equal(true)
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("275.00000000000000"))
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("1100"))
        expect(investor2.exists).to.equal(true)
        expect(investor2.withdrawnTokens).to.equal(ethers.utils.parseEther("225.00000000000000"))
        expect(investor2.tokensAllotment).to.equal(ethers.utils.parseEther("900"))
        console.log("information of investors, Investor 1", `exists: ${investor1.exists}`, ` withdrawnTokens: ${investor1.withdrawnTokens} `, ` tokensAllotment: ${investor1.tokensAllotment} `)
        console.log("information of investors, Investor 2", `exists: ${investor2.exists}`, ` withdrawnTokens: ${investor2.withdrawnTokens} `, ` tokensAllotment: ${investor2.tokensAllotment} `)
    });
});