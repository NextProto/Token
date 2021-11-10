// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    [owner, tokenOwner, account1, account2, account3, account4, account5] = await ethers.getSigners();

    const investors = [account1.address, account2.address, account3.address, account4.address, account5.address];
    const tokensAllotment = [ethers.utils.parseEther("300"), ethers.utils.parseEther("250"), ethers.utils.parseEther("150"), ethers.utils.parseEther("500"), ethers.utils.parseEther("300")]

    const TokenEth = await hre.ethers.getContractFactory("TokenEth");
    const tokenEth = await TokenEth.connect(tokenOwner).deploy();

    await tokenEth.deployed();

    console.log("TokenEth deployed to:", tokenEth.address, "from address: ", tokenOwner.address);
    const totalTokenBalance = await tokenEth.balanceOf(tokenOwner.address);
    console.log("the token contract is defined with tokens: ", parseInt(totalTokenBalance.toString()) / (10 ** 18))
    await tokenEth.connect(tokenOwner).transfer(owner.address, ethers.utils.parseEther("1500"))
    const ownerBalance = await tokenEth.balanceOf(owner.address)
    console.log("token transfered to the distribution contract owner: ", ownerBalance.toString() / (10 ** 18))

    // We get the contract to deploy
    const tokenContract = tokenEth.address;
    const PrivateDistribution = await hre.ethers.getContractFactory("FMTPrivateDistribution");
    const distribution = await PrivateDistribution.deploy(tokenContract);
    const initialTimestamp = Date.now()

    await distribution.deployed();
    await distribution.setInitialTimestamp(initialTimestamp)
    const isInitialized = await distribution.isInitialized()

    console.log("Private Distribution deployed to:", distribution.address, "\n initial timestamp is setup to be: ", initialTimestamp, "with address : ", owner.address);
    console.log("Contract is initialized? ", isInitialized)

    const addInvestors = await distribution.addInvestors(investors, tokensAllotment);
    console.log("Investors and amount added")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });