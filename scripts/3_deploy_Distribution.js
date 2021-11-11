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

  // We get the contract to deploy
  const tokenContract = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const PrivateDistribution = await hre.ethers.getContractFactory("TGEPrivateDistribution");
  const distribution = await PrivateDistribution.deploy(tokenContract);
  const initialTimestamp = Date.now()

  await distribution.deployed();
  await distribution.setInitialTimestamp(initialTimestamp)
  const isInitialized = await distribution.isInitialized()

  console.log("Private Distribution deployed to:", distribution.address, "\n initial timestamp is setup to be: ", initialTimestamp);
  console.log("Contract is initialized? ", isInitialized)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
