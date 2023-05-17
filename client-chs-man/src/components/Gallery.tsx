import React, { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { constants } from "../constants";
import { useWindowSize } from "../hooks";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { get_stage } from "@/utils";

const config = {
  apiKey:
    get_stage() === "production"
      ? process.env.ALCHEMY_ID_MAINNET
      : process.env.ALCHEMY_ID,
  network:
    get_stage() === "production" ? Network.ETH_MAINNET : Network.ETH_GOERLI,
};

const alchemy = new Alchemy(config);

export function Gallery() {
  const { width } = useWindowSize();

  const [nfts, setNfts] = useState<any>();
  useEffect(() => {
    fetchCollection();
  }, [width]);
  const fetchCollection = async () => {
    const { nfts } = await alchemy.nft.getNftsForContract(
      constants.NFT_ADDRESS,
      {
        omitMetadata: false,
      }
    );
    setNfts(nfts.slice(0, 12));
  };

  var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 2,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 0,
        },
      },
    ],
  };
  return (
    <Slider {...settings}>
      {nfts?.map((nft: any, i: number) => (
        <div key={i} className="relative bg-black">
          <a
            title={nft?.rawMetadata?.name}
            target="_blank"
            href={`${
              get_stage() === "production"
                ? "https://opensea.io"
                : "https://testnets.opensea.io"
            }/de-DE/assets/${
              get_stage() === "production" ? "ethereum" : "goerli"
            }/${constants.NFT_ADDRESS}/${nft?.tokenId}`}
          >
            <img alt={nft?.rawMetadata?.name} src={nft.media[0]?.thumbnail} />
          </a>
        </div>
      ))}
    </Slider>
  );
}
