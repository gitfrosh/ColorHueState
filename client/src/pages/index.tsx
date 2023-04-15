import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { watchBlockNumber } from "@wagmi/core";
import { useEffect, useState } from "react";
import { ethers, Signer } from "ethers";
import { constants } from "../constants";
import { useAccount, useProvider, useSigner } from "wagmi";
import Link from "next/link";
import { render_circles } from "../utils";
import { Gallery } from "@/components/Gallery";

export default function Home() {
  const { address } = useAccount();
  const [blockData, setBlockData] = useState<any>();
  const [caughtBlock, catchBlock] = useState<any>();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const [isMinted, setMinted] = useState<boolean | string | undefined>(false);
  const [svg, setSVG] = useState<string>();
  const [isMinting, toggleMinting] = useState(false);
  const contract = new ethers.Contract(
    constants.NFT_ADDRESS,
    constants.NFT_ABI
  );

  useEffect(() => {
    const svg = render_circles(blockData?.hash);
    setSVG(svg);
  }, [blockData]);

  useEffect(() => {
    console.log(process.env.NODE_ENV);
  }, []);

  const getBlockData = async (blockNumber: number) => {
    try {
      const data = await provider.getBlock(blockNumber);
      setBlockData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const mint = async () => {
    toggleMinting(true);

    try {
      const tx = await contract
        .connect(signer as Signer)
        .mint(caughtBlock?.number);
      const result = await tx.wait();
      if (result?.transactionHash) {
        setMinted(result?.transactionHash);
      }
      toggleMinting(false);
    } catch (error) {
      console.log("ERROR: ", error);
      toggleMinting(false);
    }
  };

  useEffect(() => {
    watchBlockNumber(
      {
        chainId: process.env.NODE_ENV === "development" ? 5 : 1,
        listen: true,
      },
      (blockNumber) => {
        getBlockData(blockNumber);
      }
    );
  }, []);
  return (
    <>
      <Head>
        <title>Color Hue State</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen">
        <header className="h-16 p-10 bg-black flex items-center justify-between">
          <a
            target="_blank"
            href={`${
              process.env.NODE_ENV === "development"
                ? "https://goerli.etherscan.io/block/"
                : "https://etherscan.io/block/"
            }${blockData?.number}`}
          >
            <span className="text-white mr-5">Block #{blockData?.number}</span>
          </a>
          <span className="mr-4">
            <ConnectButton showBalance={false} chainStatus="none" />
          </span>
        </header>
        <section className="flex-grow">
          {blockData ? (
            <div
              className="svg-container"
              dangerouslySetInnerHTML={{ __html: svg || "" }}
            />
          ) : (
            <div className="pl-12 mt-24 text-white">Loading...</div>
          )}
        </section>
        {!!caughtBlock && (
          <div
            className="absolute p-6 top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          h-300 bg-black text-white border border-white rounded"
          >
            <button
              onClick={() => {
                catchBlock(undefined);
                setMinted(undefined);
              }}
            >
              <svg
                className="mx-auto w-5 h-5 text-white cursor-pointer absolute top-2 right-2"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 10.586l4.95-4.95 1.414 1.415-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636l4.95 4.95z"></path>
              </svg>
            </button>
            <div className="relative">
              {`You chose Block #${caughtBlock?.number}`!}

              <br />
              {!isMinted && <p>Ready to mint? (only gas fees)</p>}
              <br />
              {!isMinted && (
                <button
                  disabled={isMinting}
                  onClick={() => {
                    mint();
                  }}
                  className={`${
                    isMinting && "cursor-not-allowed"
                  } bg-transparent hover:bg-white text-white font-semibold hover:text-black py-2 px-4 border border-white hover:border-transparent rounded`}
                >
                  {isMinting && !isMinted ? "Loading.." : "Mint"}
                </button>
              )}
              {isMinted && !isMinting && (
                <a
                  target={"_blank"}
                  href={`${
                    process.env.NODE_ENV === "development"
                      ? "https://goerli.etherscan.io/tx/"
                      : "https://etherscan.io/tx/"
                  }${isMinted}`}
                >
                  .. View transaction
                </a>
              )}
            </div>
          </div>
        )}
        {blockData && (
          <section className="mb-10 ml-16 mr-16 h-12 bg-black text-white">
            <div className="h-16 bg-black text-white flex items-center justify-between">
              <div className="">
                <Link className="ml-4" scroll={false} href="#about">
                  <span className="text-white">about</span>
                </Link>
                {/* <p>
                  Hash #{" "}
                  <span>
                    {blockDataHash?.substring(0, 6)}
                    <br />
                    {blockDataHash?.substring(6, 12)}
                    <br />
                    {blockDataHash?.substring(12, 18)}
                    <br />
                    {blockDataHash?.substring(18, 24)}
                    <br />
                    {blockDataHash?.substring(24, 30)}
                    <br />
                    {blockDataHash?.substring(30, 36)}
                    <br />
                    {blockDataHash?.substring(36, 42)}
                    <br />
                    {blockDataHash?.substring(42, 48)}
                    <br />
                    {blockDataHash?.substring(48, 54)}
                    <br />
                    {blockDataHash?.substring(54, 60)}
                    <br />
                    {blockDataHash?.substring(60, 64)}
                  </span>
                </p>
                <p>
                  Time # <span>{blockData?.timestamp}</span>
                </p> */}
              </div>
              <div className="">
                {address && (
                  <button
                    onClick={() => {
                      const svgCopy = `${svg}`;
                      catchBlock({
                        number: blockData?.number,
                        svg: svgCopy,
                      });
                    }}
                    className="bg-transparent hover:bg-white text-white font-semibold hover:text-black py-2 px-4 border border-white hover:border-transparent rounded"
                  >
                    {!caughtBlock ? "Mint!" : "Mint new one!"}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
      <div>
        <section className="h-30">
          <Gallery />
        </section>
      </div>
      <div className="flex flex-col">
        <section
          id="about"
          className="p-12 bg-black grid grid-cols-1 md:grid-cols-2"
        >
          <div>
            <div className="text-white p-2">
              <p className="mb-3">
                <em>
                  There isn’t any light that is artificial. It may be light that
                  we created, but you have to burn something to make light.
                </em>{" "}
                – James Turrell
              </p>
              <p className="mb-3">
                <span className="underline"> Intro </span>
                <br />
                ColorHueState (CHS) is an open-ended on-chain SVG-engraving of
                the heartbeat of the Ethereum blockchain. Each hash of the
                current block height is materialized into a chromatic
                composition of four concentric rings encompassing the RGB color
                space. CHS is connected to the incessant cadences in
                decentralized technologies – a continuous present of irrevocable
                time pockets with the opportunity for anyone to catch the visual
                glimpse of such unique moments. ColorHueState is a memento token
                of a quarter of a minute of permanence.
              </p>
              <p className="mb-3">
                <span className="underline">Minting</span>
                <br />
                Drawing from the average Ethereum block time of 15 seconds a new
                CHS composition is generated four times per minute circa. Each
                block hash is unique and can be captured as an NFT (ERC-721)
                only once, by a single entity. Minting incurs no cost except
                network fees. Heads up minters! permanence is ephemeral
              </p>
            </div>
          </div>
          <div>
            <div className="text-white p-2">
              <p className="mb-3">
                <span className="underline"> Attributes</span>
                <br />
                The four rings of a CHS are composed of outer ring A, followed
                by ring B, then ring C, ending with inner ring D. Each ring
                starts and ends with a six-character Hex color code eventually
                making up the first 48 characters of a block hash. The
                hexadecimal RGB color space encompasses a total of 16,777,216
                distinct alphanumeric color values of which 46,656 are
                permutations of only letters and 1,000,000 of only numbers.
              </p>
              <p className="mb-3">
                <span className="underline"> Artist</span>
                <br />
                Jurgen Ostarhild is a Berlin-based visual artist and
                photographer who uses light and code as his canvas. He creates
                image machines, installations, multiples and printed artifacts.
              </p>
              <p className="mb-3">
                <span className="underline"> Smart contract</span>
                <br />
                <a
                  href={`${
                    process.env.NODE_ENV === "development"
                      ? "https://goerli.etherscan.io/address/"
                      : "https://etherscan.io/address/"
                  }${constants.NFT_ADDRESS}`}
                >
                  {constants.NFT_ADDRESS}
                </a>
              </p>
              <p className="mb-3">
                <span className="underline">License</span>
                <br />
                CC BY-NC 4.0
              </p>
              <p className="mb-3">
                <span className="underline">Credits</span>
                <br />A heartfelt shout-out to Rike, Roman and Armin without
                whom this project would not have been possible.
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="h-16 bg-gray-900 text-white flex items-center justify-center">
        © {new Date().getFullYear()} Jurgen Ostarhild
      </footer>
    </>
  );
}
function useWindowSize(): { width: any } {
  throw new Error("Function not implemented.");
}
