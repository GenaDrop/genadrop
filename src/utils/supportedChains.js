import algoIcon from "../assets/icon-algo.svg";
import auroraIcon from "../assets/icon-aurora.svg";
import celoIcon from "../assets/icon-celo.svg";
import polygonIcon from "../assets/icon-polygon.svg";
import { addChain, switchChain } from "./chainConnect";

export const supportedChains = {
  4160: {
    label: "Algorand",
    icon: algoIcon,
    sybmol: "ALGO",
    networkId: 4160,
    add: null,
    switch: null,
  },
  1313161554: {
    label: "Aurora",
    icon: auroraIcon,
    sybmol: "AURORA",
    networkId: 1313161554,
    add: addChain,
    switch: switchChain,
    coinGeckoLabel: "aurora-near",
  },
  137: {
    label: "Polygon",
    icon: polygonIcon,
    sybmol: "MATIC",
    networkId: 137,
    add: addChain,
    switch: switchChain,
    coinGeckoLabel: "matic",
  },
  42220: {
    label: "Celo",
    icon: celoIcon,
    sybmol: "CGLD",
    networkId: 42220,
    add: addChain,
    switch: switchChain,
    coinGeckoLabel: "celo",
  },
  80001: {
    label: "Polygon Testnet",
    icon: polygonIcon,
    sybmol: "MATIC",
    networkId: 80001,
    add: addChain,
    switch: switchChain,
    coinGeckoLabel: "matic",
  },
  44787: {
    label: "Celo Alfajores",
    icon: celoIcon,
    sybmol: "CGLD",
    networkId: 44787,
    add: addChain,
    switch: switchChain,
    coinGeckoLabel: "celo",
  },
  62320: {
    label: "Celo Baklava",
    icon: celoIcon,
    sybmol: "CGLD",
    networkId: 62320,
    add: addChain,
    switch: switchChain,
    coinGeckoLabel: "celo",
  },
  1313161555: {
    label: "Aurora Testnet",
    icon: auroraIcon,
    sybmol: "AOA",
    networkId: 1313161555,
    add: addChain,
    switch: switchChain,
    coinGeckoLabel: "aurora-near",
  },
};