// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.12;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./SvgGenerator.sol";
import "./EthereumColors.sol";
import "hardhat/console.sol";

/// @author Rike Exner
contract ColorHueState is Ownable, ERC721Enumerable {
    SvgGenerator svgGenerator = new SvgGenerator();
    EthereumColors ethereumColors = new EthereumColors();

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

    // Internal tokenId tracker
    uint256 private _currentId;

    address private devAddress;

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
        devAddress = 0x4a7D0d9D2EE22BB6EfE1847CfF07Da4C5F2e3f22; // Rike
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
        string[8] memory ethereumColors = ethereumColors.generateEthereumColors(
            blockHash
        );

        string memory svg = svgGenerator.generateSVG(ethereumColors);
        return generateTokenURI(tokenId, svg, blockNumber);
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
            svgBase64,
            style,
            lightness,
            baseUrl
        );
        string memory finalUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
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
                            '", "attributes":[{"trait_type":"Style","value":"',
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
                        )
                    )
                )
            );
    }

    function updateDevAddress(address _address) external onlyOwnerOrDev {
        devAddress = _address;
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
