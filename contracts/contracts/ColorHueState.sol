/**

     *** ***     
  *          *   
 *            *  
*              * 
 *            *  
  *          *   
     *** ***   

ColorHueState, 2023
Jurgen Ostarhild
https://www.colorhuestate.xyz

"ColorHueState is a captivating digital art project that generates ever-changing chromatic circles from the latest Ethereum block hash, creating a mesmerizing visual symphony embodying the beauty of blockchain technology." - 2023
*/
// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.12;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "hardhat/console.sol";

/// @author Rike Exner
contract ColorHueState is Ownable, ERC721Enumerable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;

    using Strings for uint256;

    // Adding blockNumber mapping to track minted blockNumbers
    mapping(uint256 => bool) private _mintedBlockNumbers;

    // Mint price
    uint96 public price = 0.001 ether;

    // Base `external_url` in attributes
    string public baseUrl;

    // Sale status. Toggle to enable minting.
    bool public saleActive = false;

    // Internal tokenId tracker
    uint256 private _currentId;

    constructor() ERC721("ColorHueState", "CHS") {
        baseUrl = "http://www.colorhuestate.xyz/?blockNumber=";
    }

    function contractURI() external pure returns (string memory) {
        string memory json = string(
            abi.encodePacked(
                "{",
                '"name": "ColorHueState",',
                '"description": "ColorHueState is a captivating digital art project that generates ever-changing chromatic circles from the latest Ethereum block hash, creating a mesmerizing visual symphony embodying the beauty of blockchain technology.",',
                "}"
            )
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    function withdrawAll() external {
        uint256 amount = address(this).balance;
        require(payable(owner()).send(amount));
    }

    function updateBaseUrl(string calldata _baseUrl) external onlyOwner {
        baseUrl = _baseUrl;
    }

    function toggleSale() external onlyOwner {
        saleActive = !saleActive;
    }

    function mint(uint256 blockNumber) external payable {
        require(!_mintedBlockNumbers[blockNumber], "BlockNumber has already been minted.");
        _tokenIdCounter += 1;
        uint256 newItemId = _tokenIdCounter;
        require(saleActive, "Sale not active.");
        require(msg.value >= price, "Not enough Ether sent.");
        _mintedBlockNumbers[blockNumber] = true;

        _mint(msg.sender, newItemId);
        _tokenURIs[newItemId] = _constructTokenURI(newItemId, blockNumber);
    }

    function _constructTokenURI(
        uint256 tokenId,
        uint256 blockNumber
    ) internal view returns (string memory) {
        require(_exists(tokenId), "Nonexistent token.");
        bytes32 blockHash = getBlockHash(blockNumber);
   (
            string[8] memory colors,
            string[8] memory attributes
        ) = generateEthereumColors(blockHash);
        string memory svg = generateSVG(colors);
        return generateTokenURI(colors, attributes, svg, blockNumber);
    }

    function generateTokenURI(
        string[8] memory colors,
        string[8] memory attributes,
        string memory svg,
        uint256 blockNumber
    ) internal view returns (string memory) {
        bytes memory svgBytes = abi.encodePacked(svg);
        string memory svgBase64 = Base64.encode(svgBytes);
        string memory ringAttributes = generateRingAttributes(attributes);
        string memory rings = generateRings(colors);



        string memory json = packJSONString(
            svgBase64,
            blockNumber,
            ringAttributes,
            rings
        );
        string memory finalUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        console.log(finalUri);
        return finalUri;
    }

        function generateRingAttributes(
        string[8] memory attributes
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '", "attributes":[',
                    generateAttributePair("A", attributes[0], attributes[1]),
                    ",",
                    generateAttributePair("B", attributes[2], attributes[3]),
                    ",",
                    generateAttributePair("C", attributes[4], attributes[5]),
                    ",",
                    generateAttributePair("D", attributes[6], attributes[7]),
                    "]"
                )
            );
    }

        function generateAttributePair(
        string memory traitType,
        string memory attr1,
        string memory attr2
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '{"trait_type":"',
                    traitType,
                    '","value":"',
                    attr1,
                    "-",
                    attr2,
                    '"}'
                )
            );
    }

        function generateRings(
        string[8] memory colors
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "Ring A: ",
                    colors[0],
                    "-",
                    colors[1],
                    " Ring B: ",
                    colors[2],
                    "-",
                    colors[3],
                    " Ring C: ",
                    colors[4],
                    "-",
                    colors[5],
                    " Ring D: ",
                    colors[6],
                    "-",
                    colors[7]
                )
            );
    }



    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721) returns (string memory) {
        require(_exists(tokenId), "ERC721: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function packJSONString(
        string memory encodedSVG,
        uint256 blockNumber,
        string memory ringAttributes,
                string memory rings
    ) public view returns (string memory) {
        console.log(rings);
        string memory name = string(
            abi.encodePacked("ColorHueState Block No. ", blockNumber.toString())
        );
        string memory description = string(
            abi.encodePacked(
                "ColorHueState Block No. ",
                blockNumber.toString(),
                " ", rings)
        );
        return
            Base64.encode(
                bytes(
                    string(
                        abi.encodePacked(
                            '{"name":"',
                            name,
                            '", "description":"',
                            description,
                            '", "image":"data:image/svg+xml;base64,',
                            encodedSVG,
                            ringAttributes,
                            bytes(baseUrl).length > 0
                                ? string(
                                    abi.encodePacked(
                                        ', "external_url":"',
                                        baseUrl,
                                        blockNumber.toString(),
                                        '"'
                                    )
                                )
                                : "",
                            " }"
                        )
                    )
                )
            );
    }

    function generateSVG(
        string[8] memory colors
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

        string
            memory html = '<svg xmlns="http://www.w3.org/2000/svg" height="800" width="800">';

        for (uint8 i = 0; i < 4; i++) {
            string memory start = colors[i * 2];
            string memory end = colors[i * 2 + 1];

            temp1 = uint64((D * rs[i]) / 200);
            temp2 = temp1 * 2;
            temp3 = temp2 / 3;

            html = string(
                abi.encodePacked(
                    html,
                    '<defs><radialGradient id="grad',
                    Strings.toString(i),
                    '" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="',
                    Strings.toString(ps[i]),
                    '%" style="stop-color:',
                    start,
                    ';stop-opacity:1"></stop><stop offset="100%" style="stop-color:',
                    end,
                    ';stop-opacity:1"></stop></radialGradient></defs><circle cx="400" cy="400" rx="',
                    Strings.toString(temp3),
                    '" r="',
                    Strings.toString(temp3),
                    '" fill="url(#grad',
                    Strings.toString(i),
                    ')" />'
                )
            );
        }

        html = string(abi.encodePacked(html, "</svg>"));

        return html;
    }


    function isNumeric(string memory input) public pure returns (bool) {
        bytes memory inputBytes = bytes(input);

        for (uint i = 0; i < inputBytes.length; i++) {
            bytes1 char = inputBytes[i];
            // Check if the character is a number (0-9)
            if (char < 0x30 || char > 0x39) {
                return false;
            }
        }
        return inputBytes.length > 0;
    }

    function isAlpha(string memory input) public pure returns (bool) {
        bytes memory inputBytes = bytes(input);

        for (uint i = 0; i < inputBytes.length; i++) {
            bytes1 char = inputBytes[i];

            // Check if the character is a letter (A-Z or a-z)
            if (
                !((char >= 0x41 && char <= 0x5A) ||
                    (char >= 0x61 && char <= 0x7A))
            ) {
                return false;
            }
        }

        return inputBytes.length > 0;
    }


    function generateEthereumColors(
        bytes32 blockHash
    ) public pure returns (string[8] memory, string[8] memory) {
        string[8] memory ethereumColors;
        string[8] memory attributes;

        string memory blockHashString = bytes32ToLiteralString(blockHash);
        for (uint256 i = 0; i < ethereumColors.length; i++) {
            uint256 start = i * 6 + 1;
            uint256 end = start + 6;
            string memory color = substring(blockHashString, start, end);
            if (isAlpha(color)) {
                attributes[i] = "nondigit";
            } else if (isNumeric(color)) {
                attributes[i] = "digit";
            } else {
                attributes[i] = "mixed";
            }
            ethereumColors[i] = string.concat("#", color);
        }
        return (ethereumColors, attributes);
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

    function getBlockHash(uint256 blockNumber) public view returns (bytes32) {
        if (blockNumber == block.number) {
            return blockhash(block.number - 1);
        } else if (
            blockNumber < block.number && blockNumber >= block.number - 256
        ) {
            return bytes32(blockhash(blockNumber));
        } else {
            return bytes32(0);
        }
    }
}