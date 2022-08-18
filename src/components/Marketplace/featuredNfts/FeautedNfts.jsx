import React, { useContext, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import classes from "./FeautedNfts.module.css";
import "react-loading-skeleton/dist/skeleton.css";
import CollectionsCard from "../collectionsCard/collectionsCard";
import { GenContext } from "../../../gen-state/gen.context";
import NotFound from "../../not-found/notFound";
import GenadropCarouselScreen from "../../Genadrop-Carousel-Screen/GenadropCarouselScreen";
import ChainDropdown from "../Chain-dropdown/chainDropdown";
import bannerImg from "../../../assets/sub-explore-banner.svg";

const FeautedNfts = () => {
  const { auroraCollections, algoCollections, polygonCollections, celoCollections } = useContext(GenContext);
  const algoCollectionsArr = algoCollections
    ? Object.values(algoCollections).sort(
        (collection_a, collection_b) => collection_a.createdAt["seconds"] - collection_b.createdAt["seconds"]
      )
    : [];

  const [state, setState] = useState({
    filteredCollection: [],
    nearCollection: null,
    allChains: null,
    init: false,
    filter: {
      chain: "All Chains",
    },
  });

  const { nearCollection, filter, filteredCollection, init } = state;

  const handleSetState = (payload) => {
    setState((states) => ({ ...states, ...payload }));
  };

  const getCollectionByChain = (network = filter.chain) => {
    switch (network.toLowerCase().replace(/ /g, "")) {
      case "allchains":
        return !algoCollectionsArr && !polygonCollections && !celoCollections && !nearCollection && !auroraCollections
          ? null
          : [
              ...(algoCollectionsArr || []),
              ...(polygonCollections || []),
              ...(celoCollections || []),
              ...(auroraCollections || []),
              ...(nearCollection || []),
            ];
      case "algorand":
        return algoCollectionsArr;
      case "polygon":
        return polygonCollections;
      case "celo":
        return celoCollections;
      case "near":
        return nearCollection;
      case "aurora":
        return auroraCollections;
      default:
        break;
    }
    return null;
  };

  const chainChange = (value) => {
    handleSetState({ filter: { ...filter, chain: value } });
    const collection = getCollectionByChain(value.toLowerCase().replace(/ /g, ""));
    if (collection) {
      handleSetState({ filteredCollection: collection });
    } else {
      handleSetState({ filteredCollection: null });
    }
    handleSetState({ init: !init });
  };

  useEffect(() => {
    const collection = getCollectionByChain(filter.chain);
    if (collection) {
      handleSetState({ filteredCollection: collection });
    } else {
      handleSetState({ filteredCollection: null });
    }
  }, [algoCollections, polygonCollections, celoCollections, auroraCollections]);

  useEffect(() => {
    window.localStorage.activeCollection = null;
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.heading}>
        <h3>Featured NFTs </h3>
        {/* <ChainDropdown onChainFilter={chainChange} /> */}
      </div>

      <GenadropCarouselScreen cardWidth={16 * 20} gap={16} init={init}>
        {filteredCollection?.length ? (
          filteredCollection.map((collection, idx) => (
            <CollectionsCard useWidth="20em" key={idx} collection={collection} />
          ))
        ) : !filteredCollection ? (
          <NotFound />
        ) : (
          [...new Array(4)].map((_, idx) => (
            <div className={classes.skeleton} useWidth="20em" key={idx}>
              <Skeleton count={1} height={250} />
              <br />
              <Skeleton count={1} height={30} />
              <br />
              <Skeleton count={1} height={30} />
            </div>
          ))
        )}
      </GenadropCarouselScreen>
      <div>
        <span className={classes.blueBox}>Feeds</span>
        <img src="" alt="" />
        <span>#215 Minority X H.E.R</span>
        sold [<span>0x694c…7489</span> To <span>Onallee.algo</span> ]<span className={classes.time}>3 Minutes ago</span>
      </div>
    </div>
  );
};

export default FeautedNfts;
