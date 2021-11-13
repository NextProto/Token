const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("Token on BSC", function () {

  let owner;
  let tokenBsc;
  let address1;
  let address2;

  beforeEach(async function () {
    const TokenBsc = await ethers.getContractFactory("TokenBsc");
    tokenBsc = await TokenBsc.deploy();
    await tokenBsc.deployed();

    [owner, address1, address2] = await ethers.getSigners();
  })
  it("Should successfully deploy", async function () {
    console.log("deployed successfully to test localhost, with account: ", owner.address);
  });
  it("should be deployed with 1m of the tokens for the owner of the contract.", async function () {
    const decimals = await tokenBsc.decimals();
    const ownerBalance = ethers.utils.formatEther(await tokenBsc.balanceOf(owner.address));
    expect(await tokenBsc.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("5000"))
  })
  it("Should let you lend tokens to another account", async function () {
    await tokenBsc.transfer(address1.address, ethers.utils.parseEther("100"))
    expect(await tokenBsc.balanceOf(address1.address)).to.equal(ethers.utils.parseEther("100"))
  });
  it("Should give you permission to another account to send on your behalf", async function () {
    await tokenBsc.connect(address1).approve(owner.address, ethers.utils.parseEther("1000"))
    await tokenBsc.transfer(address1.address, ethers.utils.parseEther("1000"))
    await tokenBsc.transferFrom(address1.address, address2.address, ethers.utils.parseEther("1000"))
    expect(await tokenBsc.balanceOf(address2.address)).to.equal(ethers.utils.parseEther("1000"))
    expect(await tokenBsc.balanceOf(address1.address)).to.equal(ethers.utils.parseEther("0"))
  })
});

describe("Token on Eth", function () {

  let owner;
  let tokenEth;
  let address1;
  let address2;

  beforeEach(async function () {
    const TokenEth = await ethers.getContractFactory("TokenEth");
    tokenEth = await TokenEth.deploy();
    await tokenEth.deployed();

    [owner, address1, address2] = await ethers.getSigners();
  })
  it("Should successfully deploy", async function () {
    console.log("deployed successfully to test localhost, with account: ", owner.address);
  });
  it("should be deployed with 1m of the tokens for the owner of the contract.", async function () {
    const decimals = await tokenEth.decimals();
    const ownerBalance = ethers.utils.formatEther(await tokenEth.balanceOf(owner.address));
    console.log(ownerBalance)
    expect(await tokenEth.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("2000"))
  })
  it("Should let you lend tokens to another account", async function () {
    await tokenEth.transfer(address1.address, ethers.utils.parseEther("100"))
    expect(await tokenEth.balanceOf(address1.address)).to.equal(ethers.utils.parseEther("100"))
  });
  it("Should give you permission to another account to send on your behalf", async function () {
    await tokenEth.connect(address1).approve(owner.address, ethers.utils.parseEther("1000"))
    await tokenEth.transfer(address1.address, ethers.utils.parseEther("1000"))
    await tokenEth.transferFrom(address1.address, address2.address, ethers.utils.parseEther("1000"))
    expect(await tokenEth.balanceOf(address2.address)).to.equal(ethers.utils.parseEther("1000"))
    expect(await tokenEth.balanceOf(address1.address)).to.equal(ethers.utils.parseEther("0"))
  })
});