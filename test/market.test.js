const { expect } = require("chai");
const { ethers } = require("hardhat");
// const { ethers } = require("hardhat");

describe("NFT", function () {
  let nft,market,deployer,addr1,addr2;
  beforeEach(async()=>{
    const NFT = await ethers.getContractFactory("NFT");
    const Market = await ethers.getContractFactory("Market");
    nft = await NFT.deploy();
    market = await Market.deploy(1);
    [deployer,addr1,addr2]=await ethers.getSigners();
  });
  describe("NFT Contract",()=>{
    it("Token Count",async()=>{
      expect(await nft.tokenCount()).to.equal("0");
    });
    it("Nft Name",async()=>{
      expect(await nft.name()).to.equal("NFTMarket");
    });
    it("Nft Symbol",async()=>{
      expect(await nft.symbol()).to.equal("NM");
    });
    it("Minting Function",async()=>{
      await nft.connect(addr1).mintNFT("akshay");
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal("akshay");
    });
  });
  describe("Market Contract",()=>{
    it("Fee account and fee",async()=>{
      expect(await market.fee()).to.equal(1);
      expect(await market.marketAccount()).to.equal(deployer.address);
    });
  });
  describe("Make Item",()=>{
    beforeEach(async()=>{
    await nft.connect(addr1).mintNFT("akshayBhende");
    await nft.connect(addr1).setApprovalForAll(market.address,true);
    });
    it("make item call",async()=>{
      expect(await market.connect(addr1).makeItem(nft.address,(ethers.utils.parseEther('1')),1))
      .to.emit(market,"offer")
      .withArgs(1, nft.address, 1, ethers.utils.parseEther('1'), addr1.address)
      expect(await nft.ownerOf(1)).to.equal(market.address);
      expect(await market.count()).to.equal(1);
      const item = await market.items[1]
      expect(item.itemCount).to.equal(1)
    });
  });
  describe("Purchase Item",()=>{
    
    beforeEach(async()=>{
      await nft.connect(addr1).mintNFT("akshayBhende");
      await nft.connect(addr1).setApprovalForAll(market.address,true);
      await market.connect(addr1).makeItem(nft.address,(ethers.utils.parseEther('1')),1);
    });
    it("sold item on market place",async()=>{
      const initBalanceSeller = await addr1.getBalance();
      const initBalanceMarketAccount= await deployer.getBalance();
      const totalPrice = await market.getTotalPrice(1);
      expect(await market.connect(addr2).purchaseItem(1, {value: totalPrice})).to.emit(market, "Bought")
        .withArgs(
          1,
          nft.address,
          1,
          ethers.utils.parseEther('1'),
          addr1.address,
          addr2.address
        )
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      const sellerFinalEthBal = await addr1.getBalance();
      const feeAccountFinalEthBal = await deployer.getBalance(); 
      expect(await market.items[1].sold).to.equal(true);
      expect(sellerFinalEthBal).to.equal(market.items[1].price+initBalanceSeller);
      expect(feeAccountFinalEthBal).to.equal(((1/100)*market.items[1].price)+initBalanceMarketAccount);
    });    
  });
});
