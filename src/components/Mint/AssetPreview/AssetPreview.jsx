import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { setClipboard, setLoader, setNotification } from '../../../gen-state/gen.actions';
import { GenContext } from '../../../gen-state/gen.context';
import Attribute from '../Attribute/Attribute';
import { handleMint, handleSingleMint } from './AssetPreview-script';
import classes from './AssetPreview.module.css';
import arrowIconLeft from '../../../assets/icon-arrow-left.svg';

const AssetPreview = ({ data, changeFile }) => {
  const {
    file, fileName: fName, metadata, zip,
  } = data;
  const {
    dispatch, connector, account, chainId, mainnet,
  } = useContext(GenContext);
  const [state, setState] = useState({
    attributes: { [Date.now()]: { trait_type: '', value: '' } },
    fileName: fName,
    description: metadata?.length === 1 ? metadata[0].description : '',
    price: '',
    chain: null,
    preview: false,
    dollarPrice: 0,
  });
  const {
    attributes, fileName, description, price, chain, preview, dollarPrice,
  } = state;

  const chains = [
    {
      label: 'Algorand', networkId: 4160, symbol: 'ALGO', chain: 'Algorand',
    },
    {
      label: 'Celo', networkId: 42220, symbol: 'CGLD', chain: 'Celo',
    },
    {
      label: 'Celo testnet', networkId: 44787, symbol: 'CGLD', chain: 'Celo',
    },
    {
      label: 'Polygon', networkId: 137, symbol: 'MATIC', chain: 'Polygon',
    },
    {
      label: 'Polygon Testnet', networkId: 80001, symbol: 'MATIC', chain: 'Polygon',
    },
    {
      label: 'Near', networkId: 1313161554, symbol: 'NEAR', chain: 'Near',
    },
    {
      label: 'Near testnet', networkId: 1313161555, symbol: 'NEAR', chain: 'Near',
    },
  ];

  const mintProps = {
    dispatch,
    setLoader,
    setNotification,
    setClipboard,
    description,
    account,
    chainId,
    connector,
    file: zip,
    fileName,
    price,
    mainnet,
    chain: chain?.chain,
    dollarPrice,
  };

  const singleMintProps = {
    dispatch,
    setLoader,
    setNotification,
    setClipboard,
    account,
    chainId,
    connector,
    file: file[0],
    metadata: { name: fileName, description, attributes: Object.values(attributes) },
    fileName,
    price,
    mainnet,
    chain: chain?.chain,
    dollarPrice,
  };

  const handleSetState = (payload) => {
    setState((state) => ({ ...state, ...payload }));
  };

  const getUintByChain = {
    Algo: 'Algo',
    Celo: 'CGLD',
    Polygon: 'Matic',
    'Polygon Testnet': 'Matic',
    Near: 'Near',
  };

  const handleAddAttribute = () => {
    handleSetState({
      attributes: {
        ...attributes,
        [Date.now()]: { trait_type: '', value: '' },
      },
    });
  };

  const handleRemoveAttribute = (id) => {
    if (Object.keys(attributes).length === 1) return;

    const newAttributes = {};
    for (const key in attributes) {
      if (key !== id) {
        newAttributes[key] = attributes[key];
      }
    }
    handleSetState({ attributes: newAttributes });
  };

  const handleChangeAttribute = (arg) => {
    const { event: { target: { name, value } }, id } = arg;
    handleSetState({
      attributes: { ...attributes, [id]: { ...attributes[id], [name]: value } },
    });
  };

  const handlePrice = (event) => {
    console.log('concord', connector);
    handleSetState({ price: event.target.value });
  };

  const setMint = () => {
    if (!chainId) return dispatch(setNotification('connect wallet and try again'));
    const c = chains.find((c) => c.networkId == chainId);
    if (!c) return dispatch(setNotification('unsupported chain detected'));
    if (file.length > 1) {
      handleMint(mintProps);
    } else {
      handleSingleMint(singleMintProps);
    }
  };

  useEffect(() => {
    console.log('chainId: ', chainId);
    if (chainId) {
      const c = chains.find((c) => c.networkId == chainId);
      if (!c) return handleSetState({ chain: { label: 'unsupported chain' } });
      handleSetState({ chain: c });
      if (c.symbol === 'NEAR') {
        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
          .then((res) => {
            handleSetState({ dollarPrice: res.data.near.usd * price });
          });
      } else {
        axios.get(`https://api.coinbase.com/v2/prices/${c.symbol}-USD/spot`)
          .then((res) => {
            handleSetState({ dollarPrice: res.data.data.amount * price });
          });
      }
    }
  }, [price, chainId]);

  return (
    <div className={classes.container}>
      {
        preview
          ? (
            <div className={classes.previewWrapper}>
              <div onClick={() => handleSetState({ preview: false })} className={classes.cancelPreview}>
                <img src={arrowIconLeft} alt="" />
                {' '}
                Back
              </div>
              {
              file.map((f, idx) => (
                <div key={idx} className={classes.assetWrapper}>
                  <img src={URL.createObjectURL(f)} alt="" />
                </div>
              ))
            }
            </div>
          )
          : (
            <div className={classes.wrapper}>
              <section className={classes.asset}>
                {
                file.length > 1
                  ? (
                    <div
                      onClick={() => handleSetState({ preview: true })}
                      className={classes.showPreview}
                    >
                      view all collections
                    </div>
                  )
                  : null
              }
                <img src={URL.createObjectURL(file[0])} alt="" />
                <button onClick={changeFile}>Change asset</button>
              </section>

              <section className={classes.type}>
                <div>
                  {file.length > 1 ? 'Collection Mint' : 'Mint 1 of 1s'}
                </div>
              </section>

              <section className={classes.details}>

                <div className={classes.inputWrapper}>
                  <label>
                    {' '}
                    Title
                    <span className={classes.required}>*</span>
                  </label>
                  <input
                    style={metadata ? { pointerEvents: 'none' } : {}}
                    type="text"
                    value={fileName}
                    onChange={(event) => handleSetState({ fileName: event.target.value })}
                  />
                </div>

                <div className={classes.inputWrapper}>
                  <label>
                    Description
                    <span className={classes.required}>*</span>
                  </label>
                  <textarea
                    style={metadata?.length === 1 ? { pointerEvents: 'none' } : {}}
                    rows="5"
                    value={description}
                    onChange={(event) => handleSetState({ description: event.target.value })}
                  />
                </div>

                <div className={classes.inputWrapper}>
                  <label>
                    Attributes
                    <span className={classes.required}>*</span>
                  </label>
                  {
                  !metadata
                    ? (
                      <>
                        <div className={classes.attributes}>
                          {
                          (Object.keys(attributes)).map((key) => (
                            <Attribute
                              key={key}
                              attribute={attributes[key]}
                              id={key}
                              removeAttribute={handleRemoveAttribute}
                              changeAttribute={handleChangeAttribute}
                            />
                          ))
                        }
                        </div>
                        <button onClick={handleAddAttribute}>+ Add Attribute</button>
                      </>
                    )
                    : metadata.length === 1
                      ? (
                        <>
                          {
                          metadata[0].attributes.map((attr, idx) => (
                            <div className={classes.attribute} key={idx}>
                              <div>{attr.trait_type}</div>
                              <div>{attr.value}</div>
                            </div>
                          ))
                        }
                        </>
                      )
                      : (
                        <div className={classes.metadata}>
                          <div>
                            Number of assets:
                            {metadata.length}
                          </div>
                          <div className={classes.trait_type}>
                            Trait_types:
                            {
                          metadata[0]?.attributes.map(({ trait_type }, idx) => (
                            <span key={idx}>
                              {trait_type}
                              {' '}
                            </span>
                          ))
                        }
                          </div>
                        </div>
                      )
                }
                </div>
              </section>

              <section className={classes.mintOptions}>

                <div className={classes.inputWrapper}>
                  <label>
                    Price (USD)
                    <span className={classes.required}>*</span>
                  </label>
                  {
                  chainId
                    ? (
                      <div className={classes.price}>
                        <input type="number" value={price} onChange={handlePrice} />
                        <span>
                          {dollarPrice.toFixed(2)}
                          {' '}
                          {getUintByChain[chain?.label]}
                        </span>
                      </div>
                    )
                    : <span className={classes.warn}>Connect wallet to add price</span>
                }

                </div>

                <div className={classes.inputWrapper}>
                  <label>
                    Chain:
                    {chainId ? (
          <span className={classes.chain}>
            {' '}
            {chain?.label}
          </span>
        ) : '---'}
                    {' '}

                  </label>
                </div>
              </section>

              <section className={classes.mintButtonWrapper}>
                <button onClick={setMint} className={classes.mintBtn}>Mint</button>
                <button onClick={changeFile} className={classes.cancelBtn}>Cancel</button>
              </section>
            </div>
          )
      }
    </div>
  );
};

export default AssetPreview;
