import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { watchBlockNumber } from "@wagmi/core";
import { useEffect, useMemo, useState } from "react";
import { constants } from "../constants";
import {
  useAccount,
  usePublicClient,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
} from "wagmi";
import Link from "next/link";
import { get_stage, render_circles } from "../utils";
import { Gallery } from "@/components/Gallery";
import { AiFillGithub } from "react-icons/ai";
import { GetBlockParameters } from "viem";

export default function Home() {
  const { address } = useAccount();
  const [blockData, setBlockData] = useState<any>();
  const [caughtBlock, catchBlock] = useState<any>();
  const provider = usePublicClient();
  const [isMinted, setMinted] = useState<any>(false);
  const [svg, setSVG] = useState<string>();
  const [isMinting, toggleMinting] = useState(false);
  const { chain: activeChain } = useNetwork();
  const [stage, setStage] = useState<string>();
  const contractConfig = useMemo(() => {
    return {
      address:
        stage === "production"
          ? (constants.NFT_ADDRESS as any)
          : constants.NFT_ADDRESS_GOERLI,
      abi: constants.NFT_ABI,
    };
  }, [stage]);
  const { data: tokenId } = useContractRead({
    ...contractConfig,
    functionName: "totalSupply",
    args: [],
    watch: true,
  });
  const { config } = usePrepareContractWrite({
    ...contractConfig,
    functionName: "mint",
    args: [caughtBlock?.number],
    chainId: activeChain?.id,
  });
  const { data, write } = useContractWrite(config);
  useEffect(() => {
    setStage(get_stage());
  }, [process]);
  useWaitForTransaction({
    hash: data?.hash,
    chainId: activeChain?.id,
    enabled: !!data?.hash,
    onSuccess(receipt) {
      console.log("Success", receipt);
      setMinted({
        txnhash: data?.hash,
        // tokenId: data?.events[0]?.args?.tokenId as any,
      });
      toggleMinting(false);
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },

    onError(receipt) {
      console.error("Error", receipt);
      toggleMinting(false);
    },
  });
  const isCorrectChain =
    (stage === "production" && activeChain?.id === 1) ||
    (stage !== "production" && activeChain?.id === 5);
  const etherscanUrl =
    stage === "production"
      ? "https://etherscan.io"
      : "https://goerli.etherscan.io";

  useEffect(() => {
    const svg = render_circles(blockData?.hash);
    setSVG(svg);
  }, [blockData]);

  useEffect(() => {
    console.log("stage", stage);
    console.log("isProduction", stage === "production");
  }, []);

  const getBlockData = async (blockNumber: bigint) => {
    try {
      const data = await provider.getBlock(blockNumber as GetBlockParameters);
      setBlockData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const mint = async () => {
    toggleMinting(true);
    write?.();
  };

  useEffect(() => {
    watchBlockNumber(
      {
        chainId: stage === "production" ? 1 : 5,
        listen: true,
      },
      (blockNumber) => {
        console.log(blockNumber);
        getBlockData(blockNumber);
      }
    );
  }, []);
  return (
    <>
      <Head>
        <title>ColorHueState</title>
        <meta
          name="description"
          content="ColorHueState (CHS) is an on-chain image machine rendering the heartbeat of the Ethereum blockchain."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen">
        <header className="h-16 p-10 bg-black flex items-center justify-between">
          <Link className="ml-4" scroll={false} href="#about">
            <span className="text-white font-bold">About</span>
          </Link>

          <span className="mr-4">
            <ConnectButton showBalance={false} />
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
            className="absolute p-6 w-[250px] bottom-[0px] -right-[62px] transform -translate-x-1/2 -translate-y-1/2
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
              <div
                style={{
                  marginTop: "10px",
                  width: 100,
                  height: 100,
                  position: "relative",
                }}
                dangerouslySetInnerHTML={{ __html: caughtBlock?.svg || "" }}
              />
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
                <span>
                  Congratulations!
                  <br />
                  <a
                    target={"_blank"}
                    href={`${
                      stage === "production"
                        ? "https://etherscan.io/tx/"
                        : "https://goerli.etherscan.io/tx/"
                    }${isMinted?.txnhash}`}
                  >
                    .. view transaction
                  </a>{" "}
                  /{" "}
                  <a
                    target={"_blank"}
                    href={`${
                      stage === "production"
                        ? "https://opensea.io"
                        : "https://testnets.opensea.io"
                    }/de-DE/assets/${
                      stage === "production" ? "ethereum" : "goerli"
                    }/${
                      stage === "production"
                        ? constants.NFT_ADDRESS
                        : constants.NFT_ADDRESS_GOERLI
                    }/${tokenId?.toString()}`}
                  >
                    view on Opensea
                  </a>
                </span>
              )}
            </div>
          </div>
        )}
        {blockData && (
          <section className="mb-10 ml-16 mr-16 h-12 bg-black text-white">
            <div className="h-16 bg-black text-white flex items-center justify-between">
              <div className="">
                <a
                  target="_blank"
                  href={`${`${etherscanUrl}/block/`}${blockData?.number}`}
                >
                  <span className="text-white font-bold mr-5">
                    #{blockData?.number?.toString()}
                  </span>
                </a>
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
                {address && isCorrectChain && (
                  <button
                    onClick={() => {
                      setMinted(undefined);
                      catchBlock({
                        number: blockData?.number,
                        svg: render_circles(blockData?.hash),
                      });
                    }}
                    className="bg-transparent hover:bg-white text-white font-bold hover:text-black py-2 px-4 border border-white hover:border-transparent rounded"
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
          <Gallery stage={stage} />
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
                <span className="font-bold"> About </span>
                <br />
                ColorHueState (CHS) is an on-chain image machine rendering the
                heartbeat of the Ethereum blockchain. Each hash of the current
                block height is materialized into a chromatic composition of
                four concentric rings encompassing the RGB color space. CHS is
                connected to the incessant cadences in decentralized
                technologies – a continuous present of irrevocable time pockets
                with the opportunity for anyone to catch the visual glimpse of
                such unique moments. ColorHueState is a memento token of a
                quarter of a minute of permanence.
              </p>
              <p className="mb-3">
                <span className="font-bold">Minting</span>
                <br />
                Drawing from the average Ethereum block time of 15 seconds a new
                CHS composition is generated four times per minute circa. Each
                block hash is unique and can be captured as an NFT (ERC-721)
                only once, by a single entity. Minting incurs no cost except
                network fees. Heads up minters, permanence is ephemeral!
              </p>
              <p className="mb-3">
                <span className="font-bold"> Attributes</span>
                <br />
                The four rings of a CHS are composed of outer ring A, followed
                by ring B, then ring C, ending with inner ring D. Each ring
                starts and ends with a six-character Hex color code eventually
                making up the first 48 characters of a block hash. The
                hexadecimal RGB color space encompasses a total of 16,777,216
                distinct alphanumeric color values of which 46,656 are
                permutations of only letters and 1,000,000 of only numbers.
              </p>
            </div>
          </div>
          <div>
            <div className="text-white p-2">
              <p className="mb-3">
                <span className="font-bold"> Artist</span>
                <br />
                Jurgen Ostarhild is a Berlin-based visual artist and
                photographer who uses light and code as his canvas. He creates
                image automata, installations, multiples and printed artifacts.
              </p>
              <p className="mb-3">
                <span className="font-bold"> Smart contract</span>
                <br />
                <a
                  target="_blank"
                  href={`${etherscanUrl}/address/${constants.NFT_ADDRESS}`}
                >
                  {constants.NFT_ADDRESS}
                </a>
              </p>
              <p className="mb-3">
                <span className="font-bold">License</span>
                <br />
                <span>
                  <a
                    target="_blank"
                    href="https://github.com/gitfrosh/ColorHueState"
                  >
                    <AiFillGithub />
                  </a>{" "}
                  <a
                    href="https://creativecommons.org/licenses/by-nc/4.0/"
                    target="_blank"
                  >
                    CC BY-NC 4.0
                  </a>
                </span>
              </p>
              <p className="mb-3">
                <span className="font-bold">Credits</span>
                <br />A heartfelt shout-out to{" "}
                <a target="_blank" href="https://rike.dev">
                  Rike
                </a>
                , Roman, Timo and Armin without whom this project would not have
                been possible.
              </p>
              <p className="mb-3">
                <a href="mailto:studio@jurgenostarhild.eu">
                  <span className="font-bold">Contact</span>
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="h-16 bg-gray-900 text-white flex items-center justify-center">
        © {new Date().getFullYear()}{" "}
        <a
          className="ml-1"
          target="_blank"
          href="https://www.jurgenostarhild.eu/"
        >
          Jurgen Ostarhild
        </a>
      </footer>
    </>
  );
}
