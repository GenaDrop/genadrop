import React, { useContext, useEffect, useState } from "react";
import { setupWalletSelector } from "@near-wallet-selector/core";
import SenderIconUrl from "@near-wallet-selector/sender/assets/sender-icon.png";
import NearIconUrl from "@near-wallet-selector/near-wallet/assets/near-wallet-icon.png";
import { setupModal } from "@near-wallet-selector/modal-ui";
import MyNearIconUrl from "@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import "@near-wallet-selector/modal-ui/styles.css";
import { setupSender } from "@near-wallet-selector/sender";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { async } from "regenerator-runtime";
import Web3 from "web3";
import { Magic } from "magic-sdk";
import { ConnectExtension } from "@magic-ext/connect";
import classes from "./walletPopup.module.css";
import {
  setProposedChain,
  setToggleWalletPopup,
  setAccount,
  setChainId,
  setConnector,
} from "../../gen-state/gen.actions";
import supportedChains from "../../utils/supportedChains";
import getConfig from "./nearConfig";
import { ReactComponent as CloseIcon } from "../../assets/icon-close.svg";
import metamaskIcon from "../../assets/icon-metamask.svg";
import walletConnectIcon from "../../assets/icon-wallet-connect.svg";
import magicLinkIcon from "../../assets/icon-magic-link.svg";
import { GenContext } from "../../gen-state/gen.context";

const WalletPopup = ({ handleSetState }) => {
  const magic = new Magic("pk_live_051193EF8469FA65", {
    network: "goerli",
    locale: "en_US",
    extensions: [new ConnectExtension()],
  });

  const { dispatch, mainnet, connectFromMint, connector } = useContext(GenContext);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showConnectionMethods, setConnectionMethods] = useState(false);
  const [activeChain, setActiveChain] = useState(null);
  const [showMetamask, setMetamask] = useState(true);

  const connectOptions = [];
  for (const key in supportedChains) {
    if (key !== "4160") {
      connectOptions.push(supportedChains[key]);
    }
  }
  connectOptions.unshift(supportedChains[4160]);

  const handleProposedChain = async () => {
    dispatch(setProposedChain(activeChain));
    dispatch(setToggleWalletPopup(false));
    setConnectionMethods(false);
  };

  const handleChain = async (chainId, isComingSoon = undefined) => {
    if (isComingSoon) return;
    if (chainId === 4160 || supportedChains[chainId]?.chain === "Near") {
      setMetamask(false);
    } else {
      setMetamask(true);
      window.localStorage.removeItem("near_wallet");
    }
    if (supportedChains[chainId]?.chain === "Near") {
      // NEAR Connect
      const network = process.env.REACT_APP_ENV_STAGING === "true" ? "testnet" : "mainnet";
      const nearConfig = getConfig(`${network}`);
      const connectedToNearMainnet = {};
      if (process.env.REACT_APP_ENV_STAGING === "true") {
        connectedToNearMainnet.modules = [
          setupMyNearWallet({ walletUrl: "https://testnet.mynearwallet.com", iconUrl: MyNearIconUrl }),
          setupNearWallet({ iconUrl: NearIconUrl }),
        ];
      } else {
        connectedToNearMainnet.modules = [
          setupMyNearWallet({ walletUrl: "https://app.mynearwallet.com", iconUrl: MyNearIconUrl }),
          setupNearWallet({ iconUrl: NearIconUrl }),
          setupSender({ iconUrl: SenderIconUrl }),
        ];
      }
      const walletSelector = await setupWalletSelector({
        network: nearConfig,
        ...connectedToNearMainnet,
      });
      const description = "Please select a wallet to sign in..";
      const contract =
        process.env.REACT_APP_ENV_STAGING === "true" ? "genadrop-test.mpadev.testnet" : "genadrop-contract.nftgen.near";

      const modal = setupModal(walletSelector, { contractId: contract, description });
      modal.show();

      const isSignedIn = walletSelector.isSignedIn();
      window.selector = walletSelector;
      if (isSignedIn) {
        window.localStorage.setItem("near_wallet", "connected_to_near");
        dispatch(setChainId(chainId));
        dispatch(setAccount(walletSelector.store.getState().accounts[0].accountId));
        dispatch(setProposedChain(chainId));
        dispatch(setConnector(walletSelector.wallet()));
      }

      dispatch(setToggleWalletPopup(false));
      handleProposedChain();

      return;
    }
    if (window.selector) {
      const nearLogout = await window.selector.wallet();
      nearLogout.signOut();
    }

    setActiveChain(chainId);
    setConnectionMethods(true);
  };

  const handleMetamask = async () => {
    handleSetState({ connectionMethod: "metamask" });
    // initializeConnection({ dispatch, handleSetState, activeChain, mainnet });
    handleProposedChain();
  };

  const handleWalletConnect = async () => {
    handleSetState({ connectionMethod: "walletConnect" });
    handleProposedChain();
  };

  const handleMagicLink = async () => {
    handleSetState({ connectionMethod: "magicLink" });
    handleProposedChain();
  };
  useEffect(() => {
    setShowMoreOptions(false);
    setConnectionMethods(false);
  }, []);

  useEffect(() => {
    if (!connectFromMint.chainId) return;
    dispatch(setToggleWalletPopup(true));
    handleChain(connectFromMint.chainId, connectFromMint.isComingSoon);
  }, [connectFromMint]);

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <div className={classes.iconContainer}>
          <CloseIcon
            onClick={() => {
              dispatch(setToggleWalletPopup(false));
              setShowMoreOptions(false);
              setConnectionMethods(false);
            }}
            className={classes.closeIcon}
          />
        </div>

        <div className={classes.heading}>
          <h3>{showConnectionMethods ? "Connect Wallets" : "Link Wallets"}</h3>
          <p className={classes.description}>
            {showConnectionMethods
              ? "Connect with one of our available wallet providers."
              : "Select any of our supported blockchain to connect your wallet."}{" "}
          </p>
          {!showConnectionMethods && (
            <div className={classes.networkSwitch}>
              You&apos;re viewing data from the {mainnet ? "main" : "test"} network.
              <br /> Go to{" "}
              <a
                href={mainnet ? "https://genadrop-testnet.vercel.app/" : "https://www.genadrop.com/"}
                target="_blank"
                rel="noreferrer"
              >
                {mainnet ? "genadrop-testnet.vercel.app" : "genadrop.com"}
              </a>{" "}
              to switch to {!mainnet ? "main" : "test"} network
            </div>
          )}
        </div>

        <div className={classes.wrapper}>
          <div className={`${classes.chains} ${showConnectionMethods && classes.active}`}>
            {connectOptions
              .filter((chain) => mainnet === chain.isMainnet)
              .sort((a) => (a.comingSoon === true ? 1 : -1))
              .filter((_, idx) => showMoreOptions || idx <= 4)
              .map((chain, idx) => (
                <div
                  onClick={async () => {
                    await handleChain(chain.networkId, chain.comingSoon);
                  }}
                  key={idx}
                  className={`${classes.chain} ${chain.comingSoon && classes.comingSoon}`}
                >
                  <img src={chain.icon} alt="" />
                  <div className={classes.name}>
                    <h4>
                      {chain.label} {chain.comingSoon ? <span>Coming soon</span> : ""}
                    </h4>
                    <p className={classes.action}>connect to your {chain.name} wallet</p>
                  </div>
                </div>
              ))}
            <div className={classes.viewBtnContainer}>
              <div className={classes.viewBtn} onClick={() => setShowMoreOptions(!showMoreOptions)}>
                View {showMoreOptions ? "less" : "more"} options
              </div>
            </div>
          </div>
          <div className={`${classes.connectionMethods} ${showConnectionMethods && classes.active}`}>
            {window.ethereum !== undefined && (
              <div
                onClick={handleMetamask}
                className={`${classes.connectionMethod} ${classes.metamask} ${showMetamask && classes.active}`}
              >
                <img src={metamaskIcon} alt="" />
                <h3>MetaMask</h3>
                <p>Connect to you MetaMask Wallet</p>
              </div>
            )}
            <div onClick={handleWalletConnect} className={classes.connectionMethod}>
              <img src={walletConnectIcon} alt="" />
              <h3>WalletConnect</h3>
              <p>Scan with WalletConnect to connect</p>
            </div>
            <div onClick={handleMagicLink} className={classes.connectionMethod}>
              <img src={magicLinkIcon} alt="" />
              <h3>Magic Connect</h3>
              <p>Connect using Magic Connect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPopup;
