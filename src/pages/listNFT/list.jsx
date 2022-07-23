import React, { useContext, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useRouteMatch, Link, useHistory } from "react-router-dom";
import { GenContext } from "../../gen-state/gen.context";
import { getUserBoughtNftCollection, getUserGraphNft } from "../../utils";
import classes from "./list.module.css";
import { fetchUserBoughtNfts, listNft, writeNft } from "../../utils/firebase";
import { GET_USER_NFT } from "../../graphql/querries/getCollections";
import { polygonClient } from "../../utils/graphqlClient";
import { ethers } from "ethers";
import { listPolygonNft } from "../../utils/arc_ipfs";
//import { ReactComponent as PriceTage } from "../../assets/price-tage.svg";

const List = () => {
  const { account, mainnet, chainId, connector, dispatch } = useContext(GenContext);

  const {
    params: { nftId },
  } = useRouteMatch();
  const match = useRouteMatch();
  const history = useHistory();

  const [state, setState] = useState({
    nftDetails: null,
    isLoading: true,
    chain: "Algo",
    price: "",
    image_url: "",
  });
  const { nftDetails, isLoading, price, chain, image_url } = state;

  const handleSetState = (payload) => {
    setState((states) => ({ ...states, ...payload }));
  };
  const handlePrice = (event) => {
    handleSetState({ price: event.target.value });
  };

  const listNFT = async () => {
    // eslint-disable-next-line no-alert
    if (!price) return alert("price can't be empty");
    const listProps = {
      dispatch,
      account,
      connector,
      nftContract: nftDetails.contractAddress,
      mainnet,
      price,
      id: nftDetails.tokenID,
    };

    if (chainId === 80001) {
      console.log("RES: ", await listPolygonNft(listProps));
      history.push(`${match.url}/listed`);
    } else {
      console.log("RES: ", await listNft(nftDetails.Id, price, account));
      history.push(`${match.url}/listed`);
    }
  };

  useEffect(() => {
    (async function getUserCollection() {
      const userNftCollections = await fetchUserBoughtNfts(account);
      if (chainId === 80001) {
        const address = ethers.utils.hexlify(account);
        const { data, error } = await polygonClient.query(GET_USER_NFT, { id: address }).toPromise();
        if (error) {
          return dispatch(
            setNotification({
              message: error.message,
              type: "warning",
            })
          );
        } else {
          const polygonBoughtNft = await getUserGraphNft(data?.user?.nfts, address);
          const nft = polygonBoughtNft.filter((NFT) => NFT.tokenID === nftId)[0];
          if (!nft) history.goBack();
          else {
            handleSetState({
              nftDetails: nft,
              isLoading: false,
              image_url: nft?.ipfs_data?.image,
            });
          }
        }
      } else {
        const result = await getUserBoughtNftCollection(mainnet, userNftCollections);
        const nft = result.filter((NFT) => String(NFT.Id) === nftId)[0];
        if (!nft) history.goBack();
        else {
          handleSetState({
            nftDetails: nft,
            isLoading: false,
            image_url: nft.image_url,
          });
        }
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className={classes.menu}>
        <div className={classes.left}>
          <Skeleton count={1} height={200} />
          <br />
          <Skeleton count={1} height={40} />
          <br />
          <Skeleton count={1} height={40} />
        </div>

        <div className={classes.right}>
          <Skeleton count={1} height={200} />
          <br />
          <Skeleton count={1} height={40} />
          <br />
          <Skeleton count={1} height={40} />
        </div>

        <div className={classes.fullLegnth}>
          <Skeleton count={1} height={200} />
          <br />
          <Skeleton count={1} height={200} />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.section1}>
        <div className={classes.v_subsection1}>
          <img className={classes.nft} src={nftDetails.image_url} alt="" />
        </div>
        <div className={classes.v_subsection2}>
          <div className={classes.feature}>
            <div className={classes.mainDetails}>
              <div className={classes.collectionHeader}>
                <div className={classes.nftId}>Sell Method</div>
              </div>
            </div>

            <div className={classes.btns}>
              <button type="button" className={classes.buy} onClick={listNFT}>
                <div>
                  <PriceTage alt="" />
                  SET PRICE
                </div>
                <span>Sell the NFT at a fixed price</span>
              </button>
            </div>
          </div>
          {/* PRICE HISTORY */}
          <div className={classes.feature}>
            <div className={classes.mainDetails}>
              <div className={classes.collectionHeader}>
                <div className={classes.nftId}>Price</div>
              </div>
            </div>
            <section className={classes.mintOptions}>
              <div className={classes.priceDescription}>
                Check the
                <a href="#" target="_blank">
                  Collection Floor price
                </a>
                to give you an idea of the average price of the NFT at the moment
              </div>
              <div className={classes.chain}>
                <div className={classes.inputWrapper}>
                  <select value={chain} onChange={(event) => handleSetState({ chain: event.target.value })}>
                    <option value="Algo">Algo</option>
                    <option value="Celo">Celo</option>
                    <option value="Polygon">Polygon</option>
                  </select>
                </div>
                <div className={classes.inputWrapper}>
                  <input value={price} onChange={handlePrice} placeholder="E.g. 10" type="number" min="1" step="1" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      {price ? (
        <div className={classes.feature}>
          <div className={classes.mainDetails}>
            <div className={classes.collectionHeader}>
              <div className={classes.nftId}>Fees</div>
            </div>
          </div>

          <div className={classes.detailContent}>
            <div className={classes.priceDescription}>
              Listing is Free! At the time of sale, the following fees will be deducted
            </div>
            <div className={classes.row}>
              Genadrop <span>10%</span>
            </div>
            <div className={classes.row}>
              {nftDetails.name ? nftDetails.name : ""} <span>7%</span>
            </div>
            <div className={classes.row}>
              Total <span>17%</span>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default List;
