// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.12;
import "@openzeppelin/contracts/utils/Strings.sol";

contract SvgGenerator {
    function generateSVG(
        string[8] memory ethereumColors
    ) public pure returns (string memory) {
        uint128 D = 500;
        uint64 temp1;
        uint64 temp2;
        uint64 temp3;
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

        string memory html = '<svg xmlns="http://www.w3.org/2000/svg" height="800" width="800">';

        for (uint8 i = 0; i < 4; i++) {
            string memory start = ethereumColors[i * 2];
            string memory end = ethereumColors[i * 2 + 1];

            temp1 = uint64((D * rs[i]) / 200);
            temp2 = temp1 * 2;
            temp3 = temp2 / 3;

            html = string(
                abi.encodePacked(
                    html,
                    "<defs><radialGradient id=\"grad",
                    Strings.toString(i),
                    "\" cx=\"50%\" cy=\"50%\" r=\"50%\" fx=\"50%\" fy=\"50%\"><stop offset=\"",
                    Strings.toString(ps[i]),
                    "%\" style=\"stop-color:",
                    start,
                    ";stop-opacity:1\"></stop><stop offset=\"100%\" style=\"stop-color:",
                    end,
                    ";stop-opacity:1\"></stop></radialGradient></defs><circle cx=\"400\" cy=\"400\" rx=\"",
                    Strings.toString(temp3),
                    "\" r=\"",
                    Strings.toString(temp3),
                    "\" fill=\"url(#grad",
                    Strings.toString(i),
                    ")\" />"
                )
            );
        }

        html = string(abi.encodePacked(html, "</svg>"));

        return html;
    }
}
