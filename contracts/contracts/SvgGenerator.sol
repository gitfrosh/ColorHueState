// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.12;

contract SvgGenerator {
    function generateSVG(
        string[8] memory ethereumColors
    ) public pure returns (string memory) {
        uint256 w = 500;
        uint256 h = 500;
        uint256 D = 500;
        uint256[4] memory rs = [            uint256(200),            uint256(155),            uint256(110),            uint256(61)        ];
        uint256[4] memory ps = [            uint256(75),            uint256(75),            uint256(75),            uint256(0)        ];

        string memory html = string(
            abi.encodePacked(
                '<svg height="',
                uintToString(h),
                '" width="',
                uintToString(w),
                '">\n'
            )
        );

        uint256 wHalf = w / 2;
        uint256 hHalf = h / 2;

        for (uint256 i = 0; i < 5 - 1; i++) {
            string memory start = ethereumColors[i * 2];
            string memory end = ethereumColors[i * 2 + 1];

            uint256 value = (D * rs[i]) / 200 / 15;
            bytes memory valueStr;

            assembly {
                let ptr := mload(0x40)
                valueStr := ptr
                mstore(ptr, 0x20)
                mstore(add(ptr, 0x20), value)
                mstore(
                    0x40,
                    add(add(ptr, 0x20), div(add(31, mload(add(ptr, 0x20))), 32))
                )
            }

            string memory rxStr = string(valueStr);

            html = string(
                abi.encodePacked(
                    html,
                    '<defs>\n<radialGradient id="grad',
                    rxStr,
                    '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">\n <stop offset="',
                    uintToString(ps[i]),
                    '%" style="stop-color:',
                    start,
                    ';stop-opacity:1" />\n <stop offset="100%" style="stop-color:',
                    end,
                    ';stop-opacity:1" />\n</radialGradient>\n</defs>\n<ellipse cx="',
                    uintToString(wHalf),
                    '" cy="',
                    uintToString(hHalf),
                    '" rx="',
                    rxStr,
                    '" ry="',
                    rxStr,
                    '" fill="url(#grad',
                    uintToString(i),
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
