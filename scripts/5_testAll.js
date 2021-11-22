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

    // Deploying Token Eth
    const TokenEth = await hre.ethers.getContractFactory("TokenEth");
    const tokenEth = await TokenEth.connect(tokenOwner).deploy();
    await tokenEth.deployed();
    const tokenContract = tokenEth.address;
    const totalTokenBalance = await tokenEth.balanceOf(tokenOwner.address);
    console.log("the token contract is defined with tokens: ", parseInt(totalTokenBalance.toString()) / (10 ** 18))
    console.log("TokenEth deployed to:", tokenContract);

    // **************************** Initial Timestamp *****************************

    const initialTimestamp = parseInt(Date.now()/1000)

    // ************************** Get the contract factory ***********************
    // Seed Distribution
    const SeedDistribution = await hre.ethers.getContractFactory("SeedDistribution");
    const seedDistribution = await SeedDistribution.deploy(tokenContract);
    // Public Distribution
    const PublicDistribution = await hre.ethers.getContractFactory("PublicDistribution");
    const publicDistribution = await PublicDistribution.deploy(tokenContract);
    // Strategic Distribution
    const StrategicDistribution = await hre.ethers.getContractFactory("StrategicDistribution");
    const strategicDistribution = await StrategicDistribution.deploy(tokenContract);
    // Team Distribution
    const TeamDistribution = await hre.ethers.getContractFactory("TeamDistribution");
    const teamDistribution = await TeamDistribution.deploy(tokenContract);
    

    // *********************** Deploy the Contracts and initialized them *********
    // seed distribution
    await seedDistribution.deployed();
    await seedDistribution.setInitialTimestamp(initialTimestamp)
    const isSeedInitialized = await seedDistribution.isInitialized()
    // public distribution
    await publicDistribution.deployed();
    await publicDistribution.setInitialTimestamp(initialTimestamp)
    const isPublicInitialized = await publicDistribution.isInitialized()
    // Strategic distribution
    await strategicDistribution.deployed();
    await strategicDistribution.setInitialTimestamp(initialTimestamp)
    const isStrategicInitialized = await strategicDistribution.isInitialized()
    // Team distribution
    await teamDistribution.deployed();
    await teamDistribution.setInitialTimestamp(initialTimestamp)
    const isTeamInitialized = await teamDistribution.isInitialized()

    // ********************* Checking If the Contract is initialized **************
    console.log("SeedContract is initialized? ", isSeedInitialized)
    console.log("PublicContract is initialized? ", isPublicInitialized)
    console.log("Strategic is initialized? ", isStrategicInitialized)
    console.log("Strategic is initialized? ", isTeamInitialized)

    // ********************* Confirm deployment *****************************
    console.log("seedDistribution deployed to:", seedDistribution.address, "\n initial timestamp is setup to be: ", initialTimestamp, "with address : ", owner.address);
    console.log("PublicDistribution deployed to:", publicDistribution.address, "\n initial timestamp is setup to be: ", initialTimestamp, "with address : ", owner.address);
    console.log("StrategicDistribution deployed to:", strategicDistribution.address, "\n initial timestamp is setup to be: ", initialTimestamp, "with address : ", owner.address);
    console.log("TeamDistribution deployed to:", teamDistribution.address, "\n initial timestamp is setup to be: ", initialTimestamp, "with address : ", owner.address);

    // ********************* Transfering balance to the contract address ***********
    // seed
    await tokenEth.connect(tokenOwner).transfer(seedDistribution.address, ethers.utils.parseEther("3000000"))
    const seedContractBalance = await tokenEth.balanceOf(seedDistribution.address)
    console.log("token transfered to the seedDistribution contract owner: ", seedContractBalance.toString() / (10 ** 18))
    // public 
    await tokenEth.connect(tokenOwner).transfer(publicDistribution.address, ethers.utils.parseEther("2000000"))
    const publicContractBalance = await tokenEth.balanceOf(publicDistribution.address)
    console.log("token transfered to the PublicDistribution contract owner: ", publicContractBalance.toString() / (10 ** 18))
    // Strategic 
    await tokenEth.connect(tokenOwner).transfer(strategicDistribution.address, ethers.utils.parseEther("6000000"))
    const strategicContractBalance = await tokenEth.balanceOf(strategicDistribution.address)
    console.log("token transfered to the StrategicDistribution contract owner: ", strategicContractBalance.toString() / (10 ** 18))
    // Team 
    await tokenEth.connect(tokenOwner).transfer(teamDistribution.address, ethers.utils.parseEther("15000000"))
    const teamContractBalance = await tokenEth.balanceOf(teamDistribution.address)
    console.log("token transfered to the StrategicDistribution contract owner: ", teamContractBalance.toString() / (10 ** 18))

    
    
    // *********************** Add Investors and tokens ******************************
    // Seed
    await seedDistribution.addInvestors(
        [account1.address, account2.address, account3.address, account4.address, account5.address], 
        [ethers.utils.parseEther("250000"), ethers.utils.parseEther("500000"), ethers.utils.parseEther("200000"), ethers.utils.parseEther("550000"), ethers.utils.parseEther("1500000")]
    );
    // Public
    await publicDistribution.addInvestors(
        [account1.address, account2.address, account3.address, account4.address, account5.address], 
        [ethers.utils.parseEther("1000000"), ethers.utils.parseEther("400000"), ethers.utils.parseEther("100000"), ethers.utils.parseEther("200000"), ethers.utils.parseEther("300000")]
    );
    // Strategic
    await strategicDistribution.addInvestors(
        [account1.address, account2.address, account3.address, account4.address, account5.address], 
        [ethers.utils.parseEther("500000"), ethers.utils.parseEther("1000000"), ethers.utils.parseEther("400000"), ethers.utils.parseEther("1100000"), ethers.utils.parseEther("3000000")]
    );
    // Team
    await teamDistribution.addInvestors(
        [account1.address, account2.address, account3.address, account4.address, account5.address], 
        [ethers.utils.parseEther("5000000"), ethers.utils.parseEther("4000000"), ethers.utils.parseEther("1000000"), ethers.utils.parseEther("2000000"), ethers.utils.parseEther("3000000")]
    );
    console.log("Investors and amount added to seed contract")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });