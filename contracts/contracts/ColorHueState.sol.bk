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
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

/// @author Rike Exner
contract ColorHueState is Ownable, ERC165Storage, ERC721Enumerable, IERC2981 {
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;

    using Strings for uint256;

    // Adding blockNumber mapping to track minted blockNumbers
    mapping(uint256 => bool) private _mintedBlockNumbers;

    // Mint price
    uint96 public price = 0.001 ether;

    // Royalties
    uint256 private constant BASIS_POINTS = 300;
    address private _royaltyReceiver;
    uint96 private _royaltyPercentage;

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
        _registerInterface(type(IERC2981).interfaceId); // Register ERC2981 interface
    }

    function contractURI() external pure returns (string memory) {
        string memory json = string(
            abi.encodePacked(
                "{",
                '"name": "ColorHueState",',
                '"description": "ColorHueState is a captivating digital art project that generates ever-changing chromatic circles from the latest Ethereum block hash, creating a mesmerizing visual symphony embodying the beauty of blockchain technology.",',
                '"seller_fee_basis_points": 300,',
                '"fee_recipient": "0x4a7D0d9D2EE22BB6EfE1847CfF07Da4C5F2e3f22"', // Jurgen
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

    // Implementing ERC2981 royalties
    function royaltyInfo(
        uint256,
        uint256 value
    ) external view returns (address, uint256) {
        return (_royaltyReceiver, (value * _royaltyPercentage) / BASIS_POINTS);
    }

    function setDefaultRoyalty(
        address receiver,
        uint96 percentage
    ) external onlyOwner {
        require(percentage <= BASIS_POINTS, "Invalid percentage");
        _royaltyReceiver = receiver;
        _royaltyPercentage = percentage;
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
        require(!_mintedBlockNumbers[blockNumber], "BlockNumber has already been minted.");
        _tokenIdCounter += 1;
        uint256 newItemId = _tokenIdCounter;
        require(saleActive, "Sale not active.");
        require(msg.value >= price, "Not enough Ether sent.");
        _mintedBlockNumbers[blockNumber] = true;

        _mint(msg.sender, newItemId);
        _tokenURIs[newItemId] = _constructTokenURI(newItemId, blockNumber);

        emit ColorHueStateCreated(newItemId++);
    }

    function _constructTokenURI(
        uint256 tokenId,
        uint256 blockNumber
    ) internal view returns (string memory) {
        require(_exists(tokenId), "Nonexistent token.");
        bytes32 blockHash = getBlockHash(blockNumber);
        string[8] memory colors = generateEthereumColors(blockHash);

        string memory svg = generateSVG(colors);
        return generateTokenURI(tokenId, svg, blockNumber);
    }

    function generateTokenURI(
        uint256 tokenId,
        string memory svg,
        uint256 blockNumber
    ) internal view returns (string memory) {
        bytes memory svgBytes = abi.encodePacked(svg);
        string memory svgBase64 = Base64.encode(svgBytes);

        string memory json = packJSONString(
            tokenId,
            svgBase64,
            blockNumber,
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
        uint256 blockNumber,
        string memory _baseUrl
    ) public pure returns (string memory) {
        string memory style = "hey";

        string memory name = string(
            abi.encodePacked("ColorHueState Block #", blockNumber.toString())
        );
        string memory description = string(
            abi.encodePacked(
                "ColorHueState Block #",
                blockNumber.toString(),
                ". ColorHueState is a captivating digital art project that generates ever-changing chromatic circles from the latest Ethereum block hash, creating a mesmerizing visual symphony embodying the beauty of blockchain technology.",
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

    function generateEthereumColors(
        bytes32 blockHash
    ) public pure returns (string[8] memory) {
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

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, ERC165Storage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
