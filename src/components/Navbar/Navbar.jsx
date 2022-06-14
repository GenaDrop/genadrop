import React, { useEffect, useState } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import WalletConnect from "../Wallet-Connect/WalletConnect";
import classes from "./Navbar.module.css";
import logo from "../../assets/genadrop-logo.svg";
import drop from "../../assets/drop.svg";
import closeIcon from "../../assets/icon-close.svg";
import hamburgerIcon from "../../assets/icon-hamburger.svg";

const Navbar = () => {
  const [state, setState] = useState({
    dropdown: false,
  });
  const { dropdown } = state;
  const handleSetState = (payload) => {
    setState((states) => ({ ...states, ...payload }));
  };

  const { pathname } = useLocation();
  const history = useHistory();

  useEffect(() => {
    window.sessionStorage.showWelcomeScreen = true;
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.logoContainer}>
        <img className={classes.drop} src={drop} alt="" />
        <img onClick={() => history.push("/")} className={classes.logoDesktop} src={logo} alt="" />
        <img onClick={() => history.push("/")} className={classes.logoMobile} src={logo} alt="" />
      </div>
      <nav className={`${classes.navContainer} ${dropdown ? classes.active : classes.inactive}`}>
        <br />
        <ul className={classes.navList}>
          <Link onClick={() => handleSetState({ dropdown: false })} to="/create">
            <div className={`${classes.navItem} ${pathname.includes("/create") && classes.active}`}>
              <li>create</li>
              <div className={classes.line} />
            </div>
          </Link>
          <Link onClick={() => handleSetState({ dropdown: false })} to="/mint">
            <div className={`${classes.navItem} ${pathname.includes("/mint") && classes.active}`}>
              <li>mint</li>
              <div className={classes.line} />
            </div>
          </Link>
          <Link onClick={() => handleSetState({ dropdown: false })} to="/marketplace">
            <div className={`${classes.navItem} ${pathname.includes("/marketplace") && classes.active}`}>
              <li>explore</li>
              <div className={classes.line} />
            </div>
          </Link>
        </ul>
        <div className={classes.wallet}>
          <WalletConnect setToggleNav={(states) => handleSetState({ dropdown: states })} />
        </div>
      </nav>
      {dropdown ? (
        <img
          onClick={() => handleSetState({ dropdown: !dropdown })}
          className={classes.iconClose}
          src={closeIcon}
          alt=""
        />
      ) : (
        <img
          onClick={() => handleSetState({ dropdown: !dropdown })}
          className={classes.iconOpen}
          src={hamburgerIcon}
          alt=""
        />
      )}
    </div>
  );
};

export default Navbar;
