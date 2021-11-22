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

    // Inititate Investors and alottments
    const investors = [account1.address, account2.address, account3.address, account4.address, account5.address];
    const tokensAllotment = [ethers.utils.parseEther("500000"), ethers.utils.parseEther("1000000"), ethers.utils.parseEther("400000"), ethers.utils.parseEther("1100000"), ethers.utils.parseEther("3000000")]

    // Deploying Token Eth
    const TokenEth = await hre.ethers.getContractFactory("TokenEth");
    const tokenEth = await TokenEth.connect(tokenOwner).deploy();

    await tokenEth.deployed();
    console.log("TokenEth deployed to:", tokenEth.address, "from address: ", tokenOwner.address);
    

    // Deploy the SeedDistribution
    const tokenContract = tokenEth.address;
    const Distribution = await hre.ethers.getContractFactory("StrategicDistribution");
    const distribution = await Distribution.deploy(tokenContract);
    const initialTimestamp = parseInt(Date.now()/1000)

    await distribution.deployed();
    await distribution.setInitialTimestamp(initialTimestamp)
    const isInitialized = await distribution.isInitialized()

    // Transfering balance to the contract address
    const totalTokenBalance = await tokenEth.balanceOf(tokenOwner.address);
    console.log("the token contract is defined with tokens: ", parseInt(totalTokenBalance.toString()) / (10 ** 18))
    await tokenEth.connect(tokenOwner).transfer(distribution.address, ethers.utils.parseEther("6000000"))
    const contractBalance = await tokenEth.balanceOf(distribution.address)
    console.log("token transfered to the distribution contract owner: ", contractBalance.toString() / (10 ** 18))

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