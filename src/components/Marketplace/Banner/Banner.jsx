import classes from "./Banner.module.css";
import bannerImg from "../../../assets/marketplace-banner.png";
import Search from "../../Search/Search";
import { useHistory } from "react-router-dom";
import Chains from "../Chains/Chains";

const Banner = () => {
  const history = useHistory();
  return (
    <div style={{ backgroundImage: `url(${bannerImg})` }} className={classes.container}>
      <div className={classes.wrapper}>
        <div className={classes.heading}>
          <div className={classes.title}>
            Find, Buy and Sell NFTs across <br /> blockchains
          </div>
          <div className={classes.searchContainer}>
            <Search />
          </div>
          <div className={classes.category}>
            <span onClick={() => history.push("/marketplace/1of1")}>1 of 1s</span>
            <span onClick={() => history.push("/marketplace/collections")}>Collections</span>
            <span onClick={() => {}}>Photographs</span>
            <span onClick={() => {}}>Creators</span>
          </div>
        </div>
        <Chains />
      </div>
    </div>
  );
};

export default Banner;
