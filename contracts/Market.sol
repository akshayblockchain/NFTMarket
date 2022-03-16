//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Market {
    address payable public immutable marketAccount;
    uint256 public immutable fee;
    uint256 public count;

    struct Item {
        uint256 itemCount;
        IERC721 nft;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool sold;
    }
    event offer(
        uint256 count,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller
    );
    event bought(
        uint256 count,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );
    mapping(uint256 => Item) items;

    constructor(uint256 _fee) {
        fee = _fee;
        marketAccount = payable(msg.sender);
    }

    function makeItem(
        IERC721 _nft,
        uint256 _price,
        uint256 _tokenId
    ) external {
        require(_price > 0, "Price must be greater then Zero");
        count++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        items[count] = Item(
            count,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );
        emit offer(count, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint256 _tokenId) external payable {
        uint256 totalPrice = getTotalPrice(_tokenId);
        Item storage item = items[_tokenId];
        require(_tokenId > 0 && _tokenId <= count, "item does not exist!");
        require(msg.value >= totalPrice, "Not enough amount to Buy!");
        require(!item.sold);
        item.seller.transfer(item.price);
        marketAccount.transfer(totalPrice - item.price);
        item.sold = true;
        item.nft.transferFrom(address(this), msg.sender, _tokenId);
        emit bought(
            count,
            address(item.nft),
            _tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function getTotalPrice(uint256 _tokenId) public view returns (uint256) {
        return ((items[_tokenId].price * (100 + fee)) / 100);
    }
}
