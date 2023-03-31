// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.12;
import "@openzeppelin/contracts/utils/Strings.sol";

/// @author Rike Exner
contract SvgGenerator {
    function generateSVG(
        string[8] memory ethereumColors
    ) public pure returns (string memory) {
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

        string memory html = string.concat(('<?xml version="1.0" encoding="ISO-8859-1"?><svg xmlns="http://www.w3.org/2000/svg" height="800" width="800">')
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
                    "<defs>",
                    '<radialGradient id="grad',
                    Strings.toString(i),
                    '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">',
                    ' <stop offset="',
                    Strings.toString(ps[i]),
                    '%" style="stop-color:',
                    start,
                    ';stop-opacity:1"></stop>',
                    ' <stop offset="100%" style="stop-color:',
                    end,
                    ';stop-opacity:1"></stop>',
                    "</radialGradient>",
                    "</defs>",
                    '<circle cx="400" cy="400" rx="',
                    rx,
                    '" r="',
                    ry,
                    '" fill="url(#grad',
                    Strings.toString(i),
                    ')" ></circle>'
                )
            );
        }

        html = string.concat(html, "</svg>");

        return html;
    }
}
