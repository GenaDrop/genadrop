import { Link, useRouteMatch } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import classes from "./NftCard.module.css";

const NftCard = ({ nft, list, extend }) => {
  const { Id, collection_name, name, price, image_url } = nft;
  const match = useRouteMatch();

  const [state, setState] = useState({ algoPrice: 0 });
  const { algoPrice } = state;

  const handleSetState = (payload) => {
    setState((state) => ({ ...state, ...payload }));
  };

  useEffect(() => {
    axios
      .get("https://api.coinbase.com/v2/prices/ALGO-USD/spot")
      .then((res) => {
        handleSetState({ algoPrice: res.data.data.amount * price });
      });
  }, []);

  return (
    <Link to={`${match.url}${extend ? `${extend}/` : "/"}${Id}`}>
      <div className={classes.card}>
        <div className={classes.imageContainer}>
          <img src={image_url} alt="" />
        </div>
        <div className={classes.cardBody}>
          <div className={classes.collectionName}>{collection_name}</div>
          <div className={classes.name}>{name}</div>
          <div className={classes.chainLogo} />
          <div className={classes.wrapper}>
            <div className={classes.listPrice}>
              <div className={classes.list}>LISTPRICE</div>
              <div className={classes.price}>
                {price} <span className={classes.chain}>Algo</span>{" "}
                <span className={classes.usdPrice}>
                  ({algoPrice.toFixed(2)} USD)
                </span>{" "}
              </div>
            </div>
            <button className={classes.button}>{list ? "List" : "Buy"}</button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NftCard;
