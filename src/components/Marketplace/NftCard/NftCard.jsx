import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useRouteMatch } from "react-router-dom";
import classes from "./NftCard.module.css";
import supportedChains from "../../../utils/supportedChains";
import Copy from "../../copy/copy";
import { GenContext } from "../../../gen-state/gen.context";
import { ReactComponent as Avatar } from "../../../assets/avatar.svg";

const NftCard = ({ nft, listed, chinPrice, useWidth, fromDashboard }) => {
  const { Id, collection_name, name, price, image_url, chain } = nft;
  const match = useRouteMatch();
  const breakAddress = (address = "", width = 6) => {
    return address && `${address.slice(0, width)}...${address.slice(-width)}`;
  };
  const { account } = useContext(GenContext);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!chinPrice) {
      axios
        .get(`https://api.coingecko.com/api/v3/simple/price?ids=${supportedChains[chain].id}&vs_currencies=usd`)
        .then((res) => {
          const value = Object.values(res.data)[0].usd;
          setTotalPrice(value * price);
        });
    }
  }, []);

  return (
    <Link
      to={
        fromDashboard && !listed
          ? nft.collection_name
            ? `${match.url}/${Id}`
            : chain
            ? `/marketplace/single-mint/preview/${chain}/${Id}`
            : `/marketplace/single-mint/preview/${Id}`
          : nft.collection_name
          ? `${match.url}/${Id}`
          : chain
          ? `/marketplace/single-mint/${chain}/${Id}`
          : `/marketplace/single-mint/${Id}`
      }
    >
      <div style={useWidth ? { width: useWidth } : {}} className={classes.card}>
        <div className={classes.imageContainer}>
          <img
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = image_url;
            }}
            src={image_url}
            alt=""
          />
        </div>
        <div className={classes.cardBody}>
          <div className={classes.collectionName}>{collection_name}</div>
          <div className={classes.name}>{name}</div>
          <div className={classes.chainLogo} />
          <div className={classes.creator}>
            <Avatar alt="" />
            {!fromDashboard ? (
              <div className={classes.creatorAddress}>
                <div className={classes.createdBy}>Owned By</div>
                <div className={classes.address}>{breakAddress(nft.owner)}</div>
              </div>
            ) : (
              <div className={classes.createdBy}>Owned by you</div>
            )}
          </div>
          <div className={classes.wrapper}>
            <div className={classes.listPrice}>
              <div className={classes.list}>LIST PRICE</div>
              <div className={classes.price}>
                <img src={supportedChains[chain].icon} alt="" />
                {parseInt(price).toFixed(2)} <span className={classes.chain}>{supportedChains[chain].sybmol}</span>
                <span className={classes.usdPrice}>
                  ({chinPrice ? (chinPrice * price).toFixed(2) : totalPrice.toFixed(2)} USD)
                </span>
              </div>
            </div>
            {listed ? (
              <button type="button" className={`${classes.button} ${nft.sold ? classes.buttonSold : ""}`}>
                {nft.sold ? "Sold" : "Buy"}
              </button>
            ) : (
              <button type="button" className={`${classes.button} ${nft.sold ? classes.buttonSold : ""}`}>
                {nft.sold ? "List" : "Buy"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NftCard;
