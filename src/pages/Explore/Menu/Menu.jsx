import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import NftCard from "../../../components/Marketplace/NftCard/NftCard";
import classes from "./Menu.module.css";
import supportedChains from "../../../utils/supportedChains";

const Menu = ({ NFTCollection, loadedChain, toggleFilter, chain }) => {
  const [chinPrice, setChainPrice] = useState(0);
  useEffect(() => {
    console.log("COL", NFTCollection);
    if (chain) {
      axios
        .get(`https://api.coingecko.com/api/v3/simple/price?ids=${supportedChains[chain].id}&vs_currencies=usd`)
        .then((res) => {
          const value = Object.values(res.data)[0].usd;
          setChainPrice(value);
        });
    }
  }, [chain]);

  return (
    <div className={`${classes.menu} ${toggleFilter && classes.resize}`}>
      {NFTCollection
        ? NFTCollection.map((nft, idx) => (
            <NftCard
              chinPrice={chinPrice}
              key={nft.Id}
              nft={nft}
              listed
              index={idx}
              loadedChain={loadedChain}
              collectionName={nft.collection_name}
            />
          ))
        : [...new Array(8)]
            .map((_, idx) => idx)
            .map((id) => (
              <div className={classes.loader} key={id}>
                <Skeleton count={1} height={200} />
                <br />
                <Skeleton count={1} height={40} />
              </div>
            ))}
    </div>
  );
};

export default Menu;
