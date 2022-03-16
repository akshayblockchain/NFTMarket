async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Hardhat!");

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();

  const Market = await ethers.getContractFactory("Market");
  const market = await Market.deploy(2);

  await greeter.deployed();
  await nft.deployed();
  await market.deployed();

  console.log("Greeter deployed to:", greeter.address);
  console.log("NFT deployed to:", nft.address);
  console.log("Market deployed to:", market.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
