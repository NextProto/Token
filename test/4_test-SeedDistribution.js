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
        const Distribution = await ethers.getContractFactory("SeedDistribution");
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
        expect(tokenBalanceForAdd1).to.equal(55)
    });

    it("checks if the funds are released after 1 days", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - 86400);
        const addInvestors = await distribution.addInvestors([address1.address, address2.address], [ethers.utils.parseEther("1100"), ethers.utils.parseEther("900")])
        const withdrawableTokens = await distribution.withdrawableTokens(address1.address)
        expect(withdrawableTokens).to.equal(ethers.utils.parseEther("55.000000000000000000"))
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
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("220.00000000000000"))
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("1100"))
        expect(investor2.exists).to.equal(true)
        expect(investor2.withdrawnTokens).to.equal(ethers.utils.parseEther("180.00000000000000"))
        expect(investor2.tokensAllotment).to.equal(ethers.utils.parseEther("900"))
        console.log("information of investors, Investor 1", `exists: ${investor1.exists}`, ` withdrawnTokens: ${investor1.withdrawnTokens} `, ` tokensAllotment: ${investor1.tokensAllotment} `)
        console.log("information of investors, Investor 2", `exists: ${investor2.exists}`, ` withdrawnTokens: ${investor2.withdrawnTokens} `, ` tokensAllotment: ${investor2.tokensAllotment} `)
    });
    it("Should unlock 150000 tokns at TGE", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address, address2.address], [ethers.utils.parseEther("1500000"), ethers.utils.parseEther("1500000")])
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("3000000"))
        await distribution.connect(address1).withdrawTokens()
        await distribution.connect(address2).withdrawTokens()
        const investor1 = await distribution.investorsInfo(address1.address)
        const investor2 = await distribution.investorsInfo(address2.address)
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("75000.00000000000"))
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("1500000"))
        expect(investor2.withdrawnTokens).to.equal(ethers.utils.parseEther("75000.00000000000"))
        expect(investor2.tokensAllotment).to.equal(ethers.utils.parseEther("1500000"))
        expect((parseInt(investor1.withdrawnTokens)+parseInt(investor2.withdrawnTokens)) / (10 ** 18)).to.equal(150000)
    });
    it("Should unlock 600000 tokns at 3 months from TGE", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - (86400 * 90))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address], [ethers.utils.parseEther("3000000")])
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("3000000"))
        await distribution.connect(address1).withdrawTokens()
        const investor1 = await distribution.investorsInfo(address1.address)
        expect(investor1.exists).to.equal(true)
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("600000.00000000000"))
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("3000000"))
    });
    it("Should unlock 1050000 tokns at 6 months from TGE", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - (86400 * 6 * 30))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address], [ethers.utils.parseEther("3000000")])
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("3000000"))
        await distribution.connect(address1).withdrawTokens()
        const investor1 = await distribution.investorsInfo(address1.address)
        expect(investor1.exists).to.equal(true)
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("1050000.00000000000"))
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("3000000"))
    });
    it("Should unlock 1500000 tokns at 9 months from TGE", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - (86400 * 9 * 30))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address], [ethers.utils.parseEther("3000000")])
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("3000000"))
        await distribution.connect(address1).withdrawTokens()
        const investor1 = await distribution.investorsInfo(address1.address)
        expect(investor1.exists).to.equal(true)
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("1500000.00000000000"))
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("3000000"))
    });
    it("Should unlock 1950000 tokns at 12 months from TGE", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - (86400 * 12 * 30))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address], [ethers.utils.parseEther("3000000")])
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("3000000"))
        await distribution.connect(address1).withdrawTokens()
        const investor1 = await distribution.investorsInfo(address1.address)
        expect(investor1.exists).to.equal(true)
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("1950000.00000000000"))
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("3000000"))
    });
    it("Should unlock 2400000 tokns at 15 months from TGE", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - (86400 * 15 * 30))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address, address2.address], [ethers.utils.parseEther("2000000"), ethers.utils.parseEther("1000000")])
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("3000000"))
        await distribution.connect(address1).withdrawTokens()
        await distribution.connect(address2).withdrawTokens()
        const investor1 = await distribution.investorsInfo(address1.address)
        const investor2 = await distribution.investorsInfo(address2.address)
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("1600000.00000000000"))
        expect(investor2.withdrawnTokens).to.equal(ethers.utils.parseEther("800000.00000000000"))
        expect((parseInt(investor1.withdrawnTokens)+parseInt(investor2.withdrawnTokens)) / (10 ** 18)).to.equal(2400000)
    });
    it("Should unlock 2850000 tokns at 18 months from TGE", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - (86400 * 18 * 30))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address], [ethers.utils.parseEther("3000000")])
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("3000000"))
        await distribution.connect(address1).withdrawTokens()
        const investor1 = await distribution.investorsInfo(address1.address)
        expect(investor1.exists).to.equal(true)
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("2850000.00000000000"))
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("3000000"))
    });
    it("Should unlock 3000000 tokns at 21 months from TGE", async function () {
        const setInitialTimestamp = await distribution.setInitialTimestamp(parseInt(Date.now() / 1000) - (86400 * 21 * 30))
        const getInitalTimestamp = await distribution.getInitialTimestamp()
        const addInvestors = await distribution.addInvestors([address1.address], [ethers.utils.parseEther("3000000")])
        await tokenEth.transfer(distribution.address, ethers.utils.parseEther("3000000"))
        await distribution.connect(address1).withdrawTokens()
        const investor1 = await distribution.investorsInfo(address1.address)
        expect(investor1.exists).to.equal(true)
        expect(investor1.withdrawnTokens).to.equal(ethers.utils.parseEther("3000000.00000000000"))
        expect(investor1.tokensAllotment).to.equal(ethers.utils.parseEther("3000000"))
    });
});