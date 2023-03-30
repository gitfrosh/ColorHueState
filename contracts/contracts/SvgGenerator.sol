// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.12;
import "@openzeppelin/contracts/utils/Strings.sol";

contract SvgGenerator {
    function generateSVG(
        string[8] memory ethereumColors
    ) public pure returns (string memory) {
        // uint256 w = 500;
        // uint256 h = 500;
        uint256 D = 500;
        uint256[4] memory rs = [
            uint256(200),
            uint256(155),
            uint256(110),
            uint256(61)
        ];
        uint256[4] memory ps = [
            uint256(75),
            uint256(75),
            uint256(75),
            uint256(0)
        ];

        string memory html = string(
            abi.encodePacked(
                '<svg height="500" width="500">\n'
            )
        );

for (uint256 i = 0; i < 4; i++) {
        string memory start = ethereumColors[i * 2];
        string memory end = ethereumColors[i * 2 + 1];

        uint256 temp1 = (D * rs[i]) / 200;
        uint256 temp2 = temp1 * 2;
        uint256 temp3 = temp2 / 3;

        string memory rx = Strings.toString(temp3);
        string memory ry = Strings.toString(temp3);

        html = string(
            abi.encodePacked(
                html,
                "<defs>\n",
                '<radialGradient id="grad',
                Strings.toString(i),
                '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">\n',
                ' <stop offset="',
                Strings.toString(ps[i]),
                '%" style="stop-color:',
                start,
                ';stop-opacity:1" />\n',
                ' <stop offset="100%" style="stop-color:',
                end,
                ';stop-opacity:1" />\n',
                "</radialGradient>\n",
                "</defs>\n",
                '<ellipse cx="250" cy="250" rx="',
                rx,
                '" ry="',
                ry,
                '" fill="url(#grad',
                Strings.toString(i),
                ')" />\n'
            )
        );
    }
        html = string(abi.encodePacked(html, "</svg>\n"));

        return html;
    }

    function uintToString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
