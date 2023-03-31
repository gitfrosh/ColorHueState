import React, { useEffect, useState } from "react";
import { useAccount, useProvider, useSigner } from "wagmi";
import { Alchemy, Network } from "alchemy-sdk";
import { constants } from "../constants";

const config = {
  apiKey: process.env.ALCHEMY_ID,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(config);

export function Gallery() {
  const [nfts, setNfts] = useState<any>();
  useEffect(() => {
    fetchCollection();
  }, []);
  const fetchCollection = async () => {
    const { nfts } = await alchemy.nft.getNftsForContract(
      constants.NFT_ADDRESS,
      {
        omitMetadata: false,
      }
    );
    console.log(nfts);
    setNfts(nfts.slice(0, 3));
  };

  return (
    <div className="border grid grid-cols-4 gap-4">
      {nfts?.map((nft: any) => (
        <div className="relative bg-black">
          <a href="">
            <img src={nft.media[0]?.thumbnail} />
          </a>
        </div>
      ))}
    </div>
  );
}
