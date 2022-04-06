import { useHistory, useRouteMatch } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import classes from "./collectionsCard.module.css";

const CollectionsCard = ({ collection }) => {
  const { name, price, description, owner, number_of_nfts, image_url } =
    collection;
  const history = useHistory();
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
    <div
      onClick={() => history.push(`/marketplace/collections/${name}`)}
      className={classes.card}
    >
      <div
        style={{ backgroundImage: `url(${image_url})` }}
        className={classes.imageContainer}
      />
      <div className={classes.body}>
        <div className={classes.thumbnail}>
          <img src={image_url} alt="" />
        </div>
        <div className={classes.name}>{name}</div>
        <div className={classes.description}>
          {description.length < 100
            ? description
            : `${description.substring(0, 100)}...`}
        </div>
        <div className={classes.wrapper}>
          <div className={classes.floorPrice}>
            <div className={classes.floor}>FLOORPRICE</div>
            <div className={classes.price}>
              {price} <span className={classes.chain}>Algo</span>{" "}
              <span className={classes.usdPrice}>
                ({algoPrice.toFixed(2)} USD)
              </span>
            </div>
          </div>
          <div className={classes.nOfNfts}>{number_of_nfts} NFTs</div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsCard;
