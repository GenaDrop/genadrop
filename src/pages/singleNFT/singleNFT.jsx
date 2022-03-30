import {
  useContext, useEffect, useState, useRef,
} from 'react';
import { useRouteMatch } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { CopyBlock, dracula } from 'react-code-blocks';
import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import { GenContext } from '../../gen-state/gen.context';
import { getSingleNftDetails } from '../../utils';
import classes from './singleNFT.module.css';
import Graph from '../../components/Nft-details/graph/graph';
import DropItem from '../../components/Nft-details/dropItem/dropItem';
import { PurchaseNft } from '../../utils/arc_ipfs';
import copiedIcon from '../../assets/copied.svg';
import copyIcon from '../../assets/copy-solid.svg';
import walletIcon from '../../assets/wallet-icon.png';
import twitterIcon from '../../assets/twitter.svg';
import facebookIcon from '../../assets/facebook.svg';
import instagramIcon from '../../assets/instagram.svg';
import descriptionIcon from '../../assets/description-icon.png';
import detailsIcon from '../../assets/details.png';
import { readAllSingleNft } from '../../utils/firebase';

const SingleNFT = () => {
  const { account, connector, mainnet } = useContext(GenContext);

  const {
    params: { nftId },
  } = useRouteMatch();
  const { url } = useRouteMatch();
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const [state, setState] = useState({
    nftDetails: null,
    dropdown: '',
    algoPrice: 0,
    isLoading: true,
    transactionHistory: null,
    showSocial: false,
    isCopied: false,
  });
  const {
    dropdown,
    nftDetails,
    algoPrice,
    isLoading,
    showSocial,
    isCopied,
  } = state;

  const handleSetState = (payload) => {
    setState((state) => ({ ...state, ...payload }));
  };

  useEffect(() => {
    console.log('running');
    (async function getNftDetails() {
      const singleNfts = await readAllSingleNft(mainnet);
      console.log(singleNfts);
      const nft = singleNfts.filter((nft) => String(nft.id) === nftId)[0];  
      const nftDetails = await getSingleNftDetails(nft, mainnet,);
      handleSetState({ nftDetails, isLoading: false });
    }());

    axios
      .get('https://api.coinbase.com/v2/prices/ALGO-USD/spot')
      .then((res) => {
        handleSetState({ algoPrice: res.data.data.amount });
      });

      document.documentElement.scrollTop = 0;
  }, [mainnet]);

  useEffect(() => {
    if (!nftDetails) return;
  }, [nftDetails]);

  function useOutsideAlerter(ref) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          handleSetState({ showSocial: false });
        }
      }

      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }

  const icons = [
    {
      icon: facebookIcon,
      link: 'https://www.facebook.com',
    },
    {
      icon: instagramIcon,
      link: 'https://www.instagram.com',
    },
    {
      icon: twitterIcon,
      link: 'https://www.twitter.com/mpa',
    },
  ];

  const onCopyText = () => {
    handleSetState({ isCopied: true });
    setTimeout(() => {
      handleSetState({ isCopied: false });
    }, 1000);
  };

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

  const description = {
    icon: detailsIcon,
    title: 'Description',
    content: `${nftDetails.description}`,
  };

  const graph = {
    icon: detailsIcon,
    title: 'Price History',
    content: <Graph />,
  };

  const attributeContent = () => (
    <div className={classes.attributesContainer}>
      {nftDetails.properties.map((attribute, idx) => (
        <div key={idx} className={classes.attribute}>
          <span className={classes.title}>{attribute.trait_type}</span>
          <span className={classes.description}>{attribute.value}</span>
        </div>
      ))}
    </div>
  );

  const attributesItem = {
    icon: descriptionIcon,
    title: 'Attributes',
    content: attributeContent(),
  };

  const buyNft = async () => {
    const res = await PurchaseNft(nftDetails, account, connector, mainnet);
    alert(res);
  };

  return (
    <div className={classes.container}>
      <div className={classes.section1}>
        <div className={classes.v_subsection1}>
          <img className={classes.nft} src={nftDetails.image_url} alt="" />

          <div className={classes.feature}>
            <DropItem
              key={1}
              item={attributesItem}
              id={1}
              dropdown={dropdown}
              handleSetState={handleSetState}
            />
          </div>
        </div>
        <div className={classes.v_subsection2}>
          <div className={classes.feature}>
            <div className={classes.mainDetails}>
              <div className={classes.collectionHeader}>
                <div className={classes.nftId}>{nftDetails.name}</div>
              </div>

              <div className={classes.icons}>
                <svg
                  className={`${classes.icon} ${classes.refresh}`}
                  width="17"
                  height="18"
                  viewBox="0 0 17 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.6719 3.32812L16.0156 0.984375V8.01562H8.98438L12.2188 4.78125C11.0312 3.59375 9.625 3 8 3C6.34375 3 4.92188 3.59375 3.73438 4.78125C2.57812 5.9375 2 7.34375 2 9C2 10.6562 2.57812 12.0781 3.73438 13.2656C4.92188 14.4219 6.34375 15 8 15C9.15625 15 10.2812 14.6094 11.375 13.8281C12.5 13.0469 13.2656 12.1094 13.6719 11.0156H15.7344C15.2969 12.7656 14.3594 14.2031 12.9219 15.3281C11.4844 16.4531 9.84375 17.0156 8 17.0156C5.8125 17.0156 3.9375 16.2344 2.375 14.6719C0.8125 13.1094 0.03125 11.2188 0.03125 9C0.03125 6.78125 0.8125 4.89062 2.375 3.32812C3.9375 1.76562 5.8125 0.984375 8 0.984375C8.9375 0.984375 9.95312 1.21875 11.0469 1.6875C12.1719 2.125 13.0469 2.67188 13.6719 3.32812Z"
                    fill="#707A83"
                  />
                </svg>
                <svg
                  onClick={() => {
                    handleSetState({ showSocial: true });
                  }}
                  className={`${classes.icon}`}
                  width="18"
                  height="20"
                  viewBox="0 0 18 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 14.0781C15.8125 14.0781 16.5 14.375 17.0625 14.9688C17.625 15.5312 17.9062 16.2031 17.9062 16.9844C17.9062 17.7969 17.6094 18.5 17.0156 19.0938C16.4531 19.6562 15.7812 19.9375 15 19.9375C14.2188 19.9375 13.5312 19.6562 12.9375 19.0938C12.375 18.5 12.0938 17.7969 12.0938 16.9844C12.0938 16.6719 12.1094 16.4531 12.1406 16.3281L5.0625 12.2031C4.46875 12.7344 3.78125 13 3 13C2.1875 13 1.48438 12.7031 0.890625 12.1094C0.296875 11.5156 0 10.8125 0 10C0 9.1875 0.296875 8.48438 0.890625 7.89062C1.48438 7.29688 2.1875 7 3 7C3.78125 7 4.46875 7.26562 5.0625 7.79688L12.0938 3.71875C12.0312 3.40625 12 3.17188 12 3.01562C12 2.20312 12.2969 1.5 12.8906 0.90625C13.4844 0.3125 14.1875 0.015625 15 0.015625C15.8125 0.015625 16.5156 0.3125 17.1094 0.90625C17.7031 1.5 18 2.20312 18 3.01562C18 3.82812 17.7031 4.53125 17.1094 5.125C16.5156 5.71875 15.8125 6.01562 15 6.01562C14.25 6.01562 13.5625 5.73438 12.9375 5.17188L5.90625 9.29688C5.96875 9.60938 6 9.84375 6 10C6 10.1562 5.96875 10.3906 5.90625 10.7031L13.0312 14.8281C13.5938 14.3281 14.25 14.0781 15 14.0781Z"
                    fill="#707A83"
                  />
                </svg>

                <svg
                  className={`${classes.icon} ${classes.dots}`}
                  width="6"
                  height="18"
                  viewBox="0 0 6 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.59375 13.5938C2 13.1875 2.46875 12.9844 3 12.9844C3.53125 12.9844 4 13.1875 4.40625 13.5938C4.8125 14 5.01562 14.4688 5.01562 15C5.01562 15.5312 4.8125 16 4.40625 16.4062C4 16.8125 3.53125 17.0156 3 17.0156C2.46875 17.0156 2 16.8125 1.59375 16.4062C1.1875 16 0.984375 15.5312 0.984375 15C0.984375 14.4688 1.1875 14 1.59375 13.5938ZM1.59375 7.59375C2 7.1875 2.46875 6.98438 3 6.98438C3.53125 6.98438 4 7.1875 4.40625 7.59375C4.8125 8 5.01562 8.46875 5.01562 9C5.01562 9.53125 4.8125 10 4.40625 10.4062C4 10.8125 3.53125 11.0156 3 11.0156C2.46875 11.0156 2 10.8125 1.59375 10.4062C1.1875 10 0.984375 9.53125 0.984375 9C0.984375 8.46875 1.1875 8 1.59375 7.59375ZM4.40625 4.40625C4 4.8125 3.53125 5.01562 3 5.01562C2.46875 5.01562 2 4.8125 1.59375 4.40625C1.1875 4 0.984375 3.53125 0.984375 3C0.984375 2.46875 1.1875 2 1.59375 1.59375C2 1.1875 2.46875 0.984375 3 0.984375C3.53125 0.984375 4 1.1875 4.40625 1.59375C4.8125 2 5.01562 2.46875 5.01562 3C5.01562 3.53125 4.8125 4 4.40625 4.40625Z"
                    fill="#707A83"
                  />
                </svg>
              </div>
            </div>
            <div className={classes.priceSection}>
              <span className={classes.title}>Current price</span>
              <span className={classes.price}>
                <img src="/assets/algo-logo.png" alt="" />
                <p className={classes.tokenValue}>{nftDetails.price}</p>
                <span className={classes.usdValue}>
                  ($
                  {(nftDetails.price * algoPrice).toFixed(2)}
                  )
                </span>
              </span>
            </div>

            <div className={classes.btns}>
              {
                (nftDetails.sold
                  ? (
                    <>
                      <button className={classes.sold} disabled={nftDetails.sold}>
                        <img src={walletIcon} alt="" />
                        SOLD!
                      </button>
                    </>
                  )
                  : (
                    <>
                      <button className={classes.buy} disabled={nftDetails.sold} onClick={buyNft}>
                        <img src={walletIcon} alt="" />
                        Buy now
                      </button>
                      {/* <button className={classes.bid}><img src={bidIcon} alt="" />Place Bid</button> */}
                    </>
                  )
                )
}
            </div>
          </div>
          {/* PRICE HISTORY */}
          <div className={classes.feature}>
            <DropItem
              key={2}
              item={graph}
              id={2}
              dropdown={dropdown}
              handleSetState={handleSetState}
            />
          </div>
          <div className={classes.feature}>
            <DropItem
              key={3}
              item={description}
              id={3}
              dropdown={dropdown}
              handleSetState={handleSetState}
            />
          </div>
        </div>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className={classes.section}>
        {/* <DropItem key={4} item={transactions} id={4} dropdown={dropdown} handleSetState={handleSetState} ></DropItem> */}

        <div className={classes.heading}>
          <h3>Transaction History</h3>
        </div>
        <div className={classes.tableContainer}>
          {/* <Search data={History} /> */}
          Coming soon...
        </div>
      </div>

      <div className={classes.section}>
        <div className={classes.heading}>
          <h3>Meta Data</h3>
        </div>
        <div className={classes.code}>
          <CopyBlock
            language="json"
            text={JSON.stringify(nftDetails.properties, null, 2)}
            showLineNumbers={false}
            theme={dracula}
            wrapLines
            codeBlock
          />
        </div>
      </div>

      {

        showSocial
          ? (
            <div>
              <div ref={wrapperRef} className={classes.share}>

                <div className={classes.copy}>
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className={classes.textArea}
                  />
                  <CopyToClipboard text={url} onCopy={onCopyText}>
                    <div className={classes.copy_area}>
                      {
                      !isCopied
                        ? (
                          <img
                            className={classes.shareicon}
                            src={copyIcon}
                            alt=""
                          />
                        )
                        : <img className={classes.shareicon} src={copiedIcon} alt="" />
                    }

                    </div>
                  </CopyToClipboard>

                </div>
                <div className={classes.shareContent}>
                  {icons.map((icon) => (
                    <a href={icon.link} target="_blank" rel="noreferrer">
                      <img className={classes.shareIcon} onClick={() => handleSetState({ text: icon.link })} src={icon.icon} alt="" />
                    </a>

                  ))}
                </div>
              </div>
              <div className={classes.shareContent}>
                {icons.map((icon) => (
                  <a href={icon.link} target="_blank" rel="noreferrer">
                    <img
                      className={classes.shareIcon}
                      onClick={() => handleSetState({ text: icon.link })}
                      src={icon.icon}
                      alt=""
                    />
                  </a>
                ))}
              </div>
            </div>
          )
          : (
            ''
          )
}
    </div>
  );
};

export default SingleNFT;
