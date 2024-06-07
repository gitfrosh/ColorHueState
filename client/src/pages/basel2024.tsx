import Head from "next/head";
import { watchBlockNumber } from "@wagmi/core";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { get_stage, render_circles } from "../utils";
import { GetBlockParameters } from "viem";

export default function Home() {
  const [blockData, setBlockData] = useState<any>();
  const provider = usePublicClient();
  const [svg, setSVG] = useState<string>();
  const [stage, setStage] = useState<string>();

  useEffect(() => {
    setStage(get_stage());
  }, [process]);

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

  useEffect(() => {
    watchBlockNumber(
      {
        chainId: stage === "production" ? 1 : 11155111, //sepolia
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
        <section className="svg-wrapper">
          {blockData ? (
            <div
              className="svg-container-basel"
              dangerouslySetInnerHTML={{ __html: svg || "" }}
            />
          ) : (
            <div className="pl-12 mt-24 text-white">Loading...</div>
          )}
        </section>
      </div>
    </>
  );
}
