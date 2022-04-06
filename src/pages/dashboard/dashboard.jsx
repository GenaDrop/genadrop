import React, { useContext, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useRouteMatch } from "react-router-dom";
import Copy from "../../components/copy/copy";
import CollectionsCard from "../../components/Marketplace/collectionsCard/collectionsCard";
import NftCard from "../../components/Marketplace/NftCard/NftCard";
import { GenContext } from "../../gen-state/gen.context";
import { getNftCollections, getUserNftCollection } from "../../utils";
import {
  fetchAllNfts,
  fetchUserCollections,
  fetchUserNfts,
} from "../../utils/firebase";
import classes from "./dashboard.module.css";
import avatar from "../../assets/avatar.png";
import SearchBar from "../../components/Marketplace/Search-bar/searchBar.component";
import PriceDropdown from "../../components/Marketplace/Price-dropdown/priceDropdown";

const Dashboard = () => {
  const [state, setState] = useState({
    togglePriceFilter: false,
    filter: {
      searchValue: "",
      price: "high",
    },
    activeDetail: "created",
    collectedNfts: 0,
    createdNfts: 0,
    myCollections: null,
    filteredCollection: null,
  });

  const {
    filter,
    togglePriceFilter,
    activeDetail,
    myCollections,
    createdNfts,
    collectedNfts,
    filteredCollection,
  } = state;
  const { account, mainnet } = useContext(GenContext);

  const handleSetState = (payload) => {
    setState((state) => ({ ...state, ...payload }));
  };

  const breakAddress = (address = "", width = 6) =>
    `${address.slice(0, width)}...${address.slice(-width)}`;

  useEffect(() => {
    if (!account) return;

    (async function readAllSingle() {
      const userCollections = await fetchUserCollections(account);
      const myCollections = await getNftCollections(userCollections, mainnet);
      console.log("===>", myCollections);
      handleSetState({ myCollections });
    })();

    (async function getCollections() {
      const userNftCollections = await fetchUserNfts(account);
      const createdNfts = await getUserNftCollection(
        userNftCollections,
        mainnet
      );
      console.log("===>", createdNfts);

      handleSetState({ createdNfts });
    })();

    (async function getCollections() {
      const userNftCollections = await fetchAllNfts(account);
      const result = await getUserNftCollection(userNftCollections, mainnet);
    })();
  }, [account]);

  const getCollectionToFilter = () => {
    switch (activeDetail) {
      case "collected":
        return collectedNfts;
      case "created":
        return createdNfts;
      case "collections":
        return myCollections;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!account) return;
    if (!filteredCollection) return;
    const filtered = getCollectionToFilter().filter((col) =>
      col.name.toLowerCase().includes(filter.searchValue.toLowerCase())
    );
    handleSetState({ filteredCollection: filtered });
  }, [filter.searchValue]);

  useEffect(() => {
    if (!account) return;
    if (!filteredCollection) return;
    let filtered = null;
    if (filter.price === "low") {
      filtered = getCollectionToFilter().sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    } else {
      filtered = getCollectionToFilter().sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    }
    handleSetState({ filteredCollection: filtered });
  }, [filter.price]);

  useEffect(() => {
    if (!account) return;
    const filteredCollection = getCollectionToFilter();
    // if (!filteredCollection) return;
    handleSetState({ filteredCollection });
  }, [activeDetail, createdNfts, collectedNfts, myCollections]);

  const { url } = useRouteMatch();

  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        <section className={classes.header}>
          <div className={classes.imageContainer}>
            <img src={avatar} alt="" />
          </div>

          <div className={classes.address}>
            <Copy message={account} placeholder={breakAddress(account)} />
          </div>

          <div className={classes.details}>
            <div
              onClick={() => handleSetState({ activeDetail: "created" })}
              className={`${classes.detail} ${
                activeDetail === "created" && classes.active
              }`}
            >
              <p>Created NFT</p>
              <span>{createdNfts && createdNfts.length}</span>
            </div>
            <div
              onClick={() => handleSetState({ activeDetail: "collected" })}
              className={`${classes.detail} ${
                activeDetail === "collected" && classes.active
              }`}
            >
              <p>Collected NFTs</p>
              <span>{collectedNfts && collectedNfts.length}</span>
            </div>
            <div
              onClick={() => handleSetState({ activeDetail: "collections" })}
              className={`${classes.detail} ${
                activeDetail === "collections" && classes.active
              }`}
            >
              <p>My Collections</p>
              <span>{myCollections && myCollections.length}</span>
            </div>
          </div>
        </section>

        <section className={classes.main}>
          <div className={classes.searchAndFilter}>
            <SearchBar
              onSearch={(value) =>
                handleSetState({ filter: { ...filter, searchValue: value } })
              }
            />
            <PriceDropdown
              onPriceFilter={(value) =>
                handleSetState({ filter: { ...filter, price: value } })
              }
            />
          </div>

          {filteredCollection && activeDetail === "collections" ? (
            <div className={classes.overview}>
              {filteredCollection.map((collection, idx) => (
                <CollectionsCard key={idx} collection={collection} />
              ))}
            </div>
          ) : filteredCollection && activeDetail === "created" ? (
            <div className={classes.overview}>
              {filteredCollection.map((nft, idx) => (
                <NftCard key={idx} nft={nft} list />
              ))}
            </div>
          ) : filteredCollection && activeDetail === "collected" ? (
            <div className={classes.overview}>
              {filteredCollection.map((nft, idx) => (
                <NftCard key={idx} nft={nft} list />
              ))}
            </div>
          ) : (
            <div className={classes.skeleton}>
              {Array(5)
                .fill(null)
                .map((_, idx) => (
                  <div key={idx}>
                    <Skeleton count={1} height={300} />
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
