// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.12;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/// @author Rike Exner
contract EthereumColors {
    function generateEthereumColors(
        bytes32 blockHash
    ) external returns (string[8] memory) {
        string[8] memory ethereumColors;
        string memory blockHashString = bytes32ToLiteralString(blockHash);
        for (uint256 i = 0; i < ethereumColors.length; i++) {
            string memory color;
            // i * 6, i * 6 + 6
            if (i == 0) {
                color = substring(blockHashString, 1, 7);
            } else if (i == 1) {
                color = substring(blockHashString, 7, 13);
            } else if (i == 2) {
                color = substring(blockHashString, 13, 19);
            } else if (i == 3) {
                color = substring(blockHashString, 19, 25);
            } else if (i == 4) {
                color = substring(blockHashString, 25, 31);
            } else if (i == 5) {
                color = substring(blockHashString, 31, 37);
            } else if (i == 6) {
                color = substring(blockHashString, 37, 43);
            } else if (i == 7) {
                color = substring(blockHashString, 43, 49);
            } else {}

            ethereumColors[i] = string.concat("#", color);
        }
        return ethereumColors;
    }

    function bytes32ToLiteralString(
        bytes32 data
    ) public pure returns (string memory result) {
        bytes memory temp = new bytes(65);
        uint256 count;

        for (uint256 i = 0; i < 32; i++) {
            bytes1 currentByte = bytes1(data << (i * 8));

            uint8 c1 = uint8(bytes1((currentByte << 4) >> 4));

            uint8 c2 = uint8(bytes1((currentByte >> 4)));

            if (c2 >= 0 && c2 <= 9) temp[++count] = bytes1(c2 + 48);
            else temp[++count] = bytes1(c2 + 87);

            if (c1 >= 0 && c1 <= 9) temp[++count] = bytes1(c1 + 48);
            else temp[++count] = bytes1(c1 + 87);
        }

        result = string(temp);
    }

    function substring(
        string memory str,
        uint startIndex,
        uint endIndex
    ) public view returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);

        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
