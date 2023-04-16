import React, { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { constants } from "../constants";
import { useWindowSize } from "../hooks";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const config = {
  apiKey: process.env.ALCHEMY_ID,
  network:
    process.env.NODE_ENV === "development"
      ? Network.ETH_GOERLI
      : Network.ETH_MAINNET,
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
      // {
      //   breakpoint: 1024,
      //   settings: {
      //     slidesToShow: 3,
      //     slidesToScroll: 2,
      //     initialSlide: 0,
      //     infinite: true,
      //     dots: true,
      //   },
      // },
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
          <a href="">
            <img src={nft.media[0]?.thumbnail} />
          </a>
        </div>
      ))}
    </Slider>
    // <div className={`grid grid-cols-${width < 481 ? "2" : "6"} gap-4`}>
    //   {nfts?.map((nft: any, i: number) => (
    //     <div key={i} className="relative bg-black">
    //       <a href="">
    //         <img src={nft.media[0]?.thumbnail} />
    //       </a>
    //     </div>
    //   ))}
    // </div>
  );
}
