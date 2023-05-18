import Head from "next/head";
import { watchBlockNumber } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useAccount, useProvider, useNetwork } from "wagmi";
import { get_stage, render_circles } from "../utils";
import { Gallery } from "@/components/Gallery";

export default function Home() {
  const { address } = useAccount();
  const [blockData, setBlockData] = useState<any>();
  const [caughtBlock, catchBlock] = useState<any>();
  const provider = useProvider();
  const [svg, setSVG] = useState<string>();
  const { chain: activeChain } = useNetwork();
  const [stage, setStage] = useState<string>();

  useEffect(() => {
    setStage(get_stage());
  }, [process]);

  const isCorrectChain =
    (stage === "production" && activeChain?.id === 1) ||
    (stage !== "production" && activeChain?.id === 5);
  const etherscanUrl =
    stage === "production"
      ? "https://etherscan.io"
      : "https://goerli.etherscan.io";
  console.log(etherscanUrl);

  useEffect(() => {
    const svg = render_circles(blockData?.hash);
    setSVG(svg);
  }, [blockData]);

  useEffect(() => {
    console.log("stage", stage);
    console.log("isProduction", stage === "production");
  }, []);

  const getBlockData = async (blockNumber: number) => {
    try {
      const data = await provider.getBlock(blockNumber);
      setBlockData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const download = () => {
    const currentSvg = render_circles(blockData?.hash);
    const element = document.createElement("a");
    const file = new Blob([currentSvg as BlobPart], { type: "image/svg+xml" });
    element.href = URL.createObjectURL(file);
    element.download = `${blockData?.number}.svg`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };
  useEffect(() => {
    watchBlockNumber(
      {
        chainId: stage === "production" ? 1 : 5,
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
          <button
            onClick={() => download()}
            className="ml-4 p-2 border border-white"
          >
            <span className="text-white font-bold">Download</span>
          </button>{" "}
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
        {blockData && (
          <section className="mb-10 ml-16 mr-16 h-12 bg-black text-white">
            <div className="h-16 bg-black text-white flex items-center justify-between">
              <div className="">
                <a
                  target="_blank"
                  href={`${`${etherscanUrl}/block/`}${blockData?.number}`}
                >
                  <span className="text-white font-bold mr-5">
                    #{blockData?.number}
                  </span>
                </a>
              </div>
              <div className="">
                {address && isCorrectChain && (
                  <button
                    onClick={() => {
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
