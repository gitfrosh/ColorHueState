// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Base64.sol";

contract EthereumColors {
    function generateEthereumColors(
        bytes32 blockHash
    ) external pure returns (string[8] memory) {
        string[8] memory ethereumColors;
        string memory blockHashString = bytes32ToLiteralString(blockHash);
        for (uint256 i = 0; i < ethereumColors.length; i++) {
            uint256 start = i * 6 + 1;
            uint256 end = start + 6;
            string memory color = substring(blockHashString, start, end);
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
        uint256 startIndex,
        uint256 endIndex
    ) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
