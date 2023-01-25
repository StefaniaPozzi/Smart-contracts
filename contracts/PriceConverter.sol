// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        //8 decimals
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeedAddress
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeedAddress);
        uint256 ethUsd = (ethPrice * ethAmount) / 1e18; //otherwise you get value.00000...18 times s
        return ethUsd;
    }
}
