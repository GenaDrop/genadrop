import React, { useLayoutEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import classes from "./Fallback.module.css";
import notFound from "../../assets/404.svg";
import home from "../../assets/home-svg.svg";
import homeWhite from "../../assets/home-white.svg";
import { ReactComponent as GobackArrow } from "../../assets/icon-goback-arrow.svg";

const Fallback = () => {
  const [changeImage, setChangeImage] = useState(homeWhite);
  const history = useHistory();

  useLayoutEffect(() => {
    const hideFooter = document.getElementById("hide-footer");
    if (hideFooter) {
      hideFooter.style.display = "none";
    }
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes["not-found"]}>
        <img src={notFound} alt="" />
        <h1>Oh No! Page Not Found.</h1>
        <div className={classes.text}>
          <span>The page you are looking for does not exist. Proceed with one of the actions below.</span>
        </div>
      </div>
      <div className={classes["button-container"]}>
        <div onClick={() => history.goBack()} className={classes["go-back"]}>
          <GobackArrow />
          Go Back
        </div>
        <div
          onFocus
          onBlur
          onMouseOver={(e) => setChangeImage((e.currentTarget.src = home))}
          onMouseOut={(e) => setChangeImage((e.currentTarget.src = homeWhite))}
          onClick={() => history.push("/")}
          className={classes.home}
        >
          <img src={changeImage} alt="" />
          Take Me Home
        </div>
      </div>
    </div>
  );
};

export default Fallback;
