// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;
import "./PriceConverter.sol";

error FundMe__NotOwner();

/** @title A contract for crow funding
 * @author Stefania
 * @notice
 * @dev implements price feeds as a library
 */
contract FundMe {
    //Type declaration
    using PriceConverter for uint256;

    //State variables
    uint256 public constant MINIMUM_USD = 0.001 * 1e18;

    address private immutable i_owner;
    address[] private s_founders;
    mapping(address => uint256) private s_addressToAmount;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        //require(msg.sender == owner, "Sender is not owner");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender; // owner == who is deploying!
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Minimum 1 eth"
        );
        s_addressToAmount[msg.sender] = msg.value;
        s_founders.push(msg.sender);
    }

    function withdraw() public {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_founders.length;
            funderIndex++
        ) {
            address funder = s_founders[funderIndex];
            s_addressToAmount[funder] = 0;
        }

        s_founders = new address[](0);

        (bool responseCall, ) = i_owner.call{value: address(this).balance}("");
        require(responseCall, "Send failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory founders = s_founders; //mappings cant be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < founders.length;
            funderIndex++
        ) {
            address funder = founders[funderIndex];
            s_addressToAmount[funder] = 0;
        }

        s_founders = new address[](0);
        (bool responseCall, ) = i_owner.call{value: address(this).balance}("");
        require(responseCall, "Send failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFounders(uint256 index) public view returns (address) {
        return s_founders[index];
    }

    function getAddressToAmount(address funder) public view returns (uint256) {
        return s_addressToAmount[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
