// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.12;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./SvgGenerator.sol";
import "hardhat/console.sol";


contract ColorHueState is Ownable, ERC721Enumerable {
    SvgGenerator svgGenerator = new SvgGenerator();

    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;

    using Strings for uint256;

    // Mint price
    uint256 public price = 0.001 ether;

    // ColorHueState data
    string[256] public svgData;

    // Base `external_url` in attributes
    string public baseUrl;

    // Toggle to permanently disable metadata updates
    bool public metadataFrozen;

    // Sale status. Toggle to enable minting.
    bool public saleActive = false;

    // SVG elements
    string private svgPart1 =
        '<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px"><rect width="100%" height="100%" fill="silver"/><path fill="none" stroke="#444" d="';
    string private svgPart2 = '"/><path fill="none" stroke="#FFF" d="';
    string private svgPart3 = '"/></svg>';

    // Internal tokenId tracker
    uint256 private _currentId;

    address private devAddress;

    string private placeholderSvg =
        '<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="296" height="296" style="fill:#DEDEDE;stroke:#555555;stroke-width:2"/><text x="50%" y="50%" font-size="18" text-anchor="middle" alignment-baseline="middle" font-family="monospace, sans-serif" fill="#555555">300&#215;300</text></svg>';

    event ColorHueStateCreated(uint256 indexed tokenId);
    event TokenUpdated(uint256 tokenId);

    modifier onlyOwnerOrDev() {
        require(
            owner() == msg.sender || devAddress == msg.sender,
            "Caller is not owner or dev."
        );
        _;
    }

    constructor() ERC721("ColorHueState", "CHS") {
        baseUrl = "http://www.colorhuestate.xyz/?tokenid=";
        devAddress = 0x0EEb237e58824fa2c0836d4793aa835f99373bB7;
    }

    function updateToken(
        uint256 tokenId,
        string calldata _svgData
    ) external onlyOwnerOrDev {
        require(!metadataFrozen, "Metadata permanently frozen.");

        svgData[tokenId] = _svgData;
        emit TokenUpdated(tokenId);
    }

    function permanentlyFreezeMetadata() external onlyOwnerOrDev {
        metadataFrozen = true;
    }

    function withdrawAll() external {
        uint256 amount = address(this).balance;
        require(payable(owner()).send(amount));
    }

    function updateBaseUrl(string calldata _baseUrl) external onlyOwnerOrDev {
        baseUrl = _baseUrl;
    }

    function toggleSale() external onlyOwnerOrDev {
        saleActive = !saleActive;
    }

    function mint(uint256 blockNumber) external payable {
        _tokenIdCounter += 1;
        uint256 newItemId = _tokenIdCounter;

        require(saleActive, "Sale not active.");
        require(msg.value >= price, "Not enough Ether sent.");

        _mint(msg.sender, newItemId);
        _tokenURIs[newItemId] = _constructTokenURI(newItemId, blockNumber);

        emit ColorHueStateCreated(newItemId++);
    }

    function _constructTokenURI(
        uint256 tokenId,
        uint256 blockNumber
    ) internal returns (string memory) {
        require(_exists(tokenId), "Nonexistent token.");

        bytes32 blockHash = getBlockHash(blockNumber);
        console.logBytes32(blockHash);
        string[8] memory ethereumColors = generateEthereumColors(blockHash);
        console.log(ethereumColors[0]);
        console.log(ethereumColors[1]);
        console.log(ethereumColors[2]);
        console.log(ethereumColors[3]);
        console.log(ethereumColors[4]);
        console.log(ethereumColors[5]);
        console.log(ethereumColors[6]);
    
        string memory svg = svgGenerator.generateSVG(ethereumColors);
        console.log(svg);
        return generateTokenURI(tokenId, svg, blockNumber);
    }

    function generateEthereumColors(
        bytes32 blockHash
    ) internal returns (string[8] memory) {
        string[8] memory ethereumColors;
        string memory blockHashString = bytes32ToLiteralString(blockHash);
        console.log(blockHashString);
        for (uint256 i = 0; i < ethereumColors.length; i++) {
            console.log(i * 6);
            string memory color;
            if (i == 0) {
              color = getFirstSixCharacters(blockHashString);
            } else if (i == 1) {
               color = substring(blockHashString, 7, 13);      
            } else  {
              color = substring(blockHashString, i * 7 - 1, i * 7 + 5);
            }
            
            console.log(color);
            ethereumColors[i] = string(abi.encodePacked("#", color));
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


    function generateTokenURI(
        uint256 tokenId,
        string memory svg,
        uint256 blockNumber
    ) internal returns (string memory) {
        string memory style = Strings.toString(blockNumber);
        string memory lightness = "heylightness";
        bytes memory svgBytes = abi.encodePacked(svg);
        string memory svgBase64 = Base64.encode(svgBytes);
        console.log(svgBase64);

        string memory json = packJSONString(
            tokenId,
            svg,
            style,
            lightness,
            baseUrl
        );
        // Create final tokenUri and return
        string memory finalUri = string(abi.encodePacked("data:application/json;base64,", json));
        console.log(finalUri);
        return finalUri;
    
    }

    function burn(uint256 tokenId) external onlyOwnerOrDev {
        _burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721) returns (string memory) {
        require(_exists(tokenId), "ERC721: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function packJSONString(
        uint256 tokenId,
        string memory encodedSVG,
        string memory style,
        string memory lightness,
        string memory _baseUrl
    ) public view returns (string memory) {
        string memory color = "#000000";
        string memory name = string(
            abi.encodePacked("ColorHueState Block #", tokenId.toString())
        );
        string memory description = string(
            abi.encodePacked(
                "ColorHueState Block #",
                block.number.toString(),
                ". ColorHueState ...",
                tokenId.toString()
            )
        );

        return
            Base64.encode( bytes(
            string(
                abi.encodePacked(
                    '{"name":"',
                    name,
                    '", "description":"',
                    description,
                    '", "image_data":"',
                    encodedSVG,
                    '","attributes":[{"trait_type":"Style","value":"',
                    style,
                    '"}]',
                    bytes(_baseUrl).length > 0
                        ? string(
                            abi.encodePacked(
                                ', "external_url":"',
                                _baseUrl,
                                tokenId.toString(),
                                '"'
                            )
                        )
                        : "",
                    " }"
                )))
            );
    }

    function updateDevAddress(address _address) external onlyOwnerOrDev {
        devAddress = _address;
    }

    function getFirstSixCharacters(string memory str) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        uint length = strBytes.length < 7 ? strBytes.length :7;
        
        bytes memory result = new bytes(length);
        for (uint i = 0; i < length; i++) {
            result[i] = strBytes[i];
        }
        return string(result);
    }


function substring(string memory str, uint startIndex, uint endIndex) public view returns (string memory) {
    bytes memory strBytes = bytes(str);
    bytes memory result = new bytes(endIndex-startIndex);

    for(uint i = startIndex; i < endIndex; i++) {
        result[i-startIndex] = strBytes[i];
    }
    return string(result);
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
