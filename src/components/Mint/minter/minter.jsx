import React, { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  setClipboard,
  setConnectFromMint,
  setLoader,
  setOverlay,
  setNotification,
  setMinter,
  setToggleWalletPopup,
} from "../../../gen-state/gen.actions";
import { GenContext } from "../../../gen-state/gen.context";
import Attribute from "../Attribute/Attribute";
import { handleMint, handleSingleMint, getBase64, getFileFromBase64 } from "./minter-script";
import classes from "./minter.module.css";
import CollectionPreview from "../collection-preview/collectionPreview";
import rightArrow from "../../../assets/icon-arrow-right.svg";
import ProfileImgOverlay from "../ProfileImgOverlay/ProfileImgOverlay";
import Popup from "../popup/popup.component";
import { ReactComponent as PlusIcon } from "../../../assets/icon-plus.svg";
import GenadropToolTip from "../../Genadrop-Tooltip/GenadropTooltip";
import supportedChains from "../../../utils/supportedChains";
import { ReactComponent as DropdownIcon } from "../../../assets/icon-dropdown2.svg";
import { ReactComponent as GreenTickIcon } from "../../../assets/icon-green-tick.svg";
import VibesLogo from "../../../assets/proof-of-vibes.png";
import { initConnectWallet } from "../../wallet/wallet-script";
import SliderInput from "./SliderInput";

const Minter = () => {
  const history = useHistory();
  const { dispatch, connector, account, chainId, mainnet, minter: minterFile } = useContext(GenContext);
  const [minter, setMinterObj] = useState(minterFile);
  // save file progress
  const loadedMinter = JSON.parse(sessionStorage.getItem("minter"));
  const { file, fileName: fName, metadata, zip } = minter;
  const [state, setState] = useState({
    attributes: file?.length === 1 ? { [Date.now()]: { trait_type: "File Type", value: file[0]?.type } } : {},
    category: metadata?.attributes ? metadata?.attributes[1].value : "",
    fileName: minter?.fileName,
    description: metadata?.length === 1 ? metadata[0].description : "",
    chain: null,
    preview: false,
    collectionProfile: "",
    toggleGuide: false,
    toggleDropdown: false,
    toggleCategory: false,
    toggleType: false,
    previewSelectMode: false,
    profileSelected: false,
    popupProps: {
      url: null,
      isError: null,
      popup: false,
    },
    showReceiverAddress: false,
    receiverAddress: "",
    goodReceiverAddress: false,
    showLocation: false,
    vibeProps: {
      friendliness: 0,
      energy: 0,
      density: 0,
    },
    stick_type: "",
  });

  const {
    attributes,
    fileName,
    description,
    chain,
    preview,
    collectionProfile,
    toggleGuide,
    toggleDropdown,
    previewSelectMode,
    profileSelected,
    popupProps,
    showReceiverAddress,
    receiverAddress,
    goodReceiverAddress,
    category,
    toggleCategory,
    showLocation,
    vibeProps,
    toggleType,
    stick_type,
  } = state;

  const mintProps = {
    dispatch,
    setLoader,
    setNotification,
    setClipboard,
    description,
    receiverAddress,
    account,
    chainId,
    connector,
    file: zip,
    fileName,
    mainnet,
    chain: chain?.chain,
  };

  const singleMintProps = {
    dispatch,
    setLoader,
    setNotification,
    setClipboard,
    receiverAddress,
    account,
    chainId,
    connector,
    file: file ? file[0] : {},
    metadata: {
      name: fileName,
      description,
      attributes: Object.values(attributes),
    },
    fileName,
    mainnet,
    chain: chain?.chain,
  };
  const handleSetState = (payload) => {
    setState((states) => ({ ...states, ...payload }));
  };

  useEffect(() => {
    if (minter) {
      Promise.all(Array.prototype.map.call(minter.file, getBase64))
        .then((urls) => {
          const newMinters = { ...minter, description, fileName, category, attributes, vibeProps, stick_type };
          newMinters.file = urls;

          sessionStorage.setItem("minter", JSON.stringify(newMinters));
        })
        .catch((error) => {
          console.log(error);
          // ...handle/report error...
        });
    } else {
      if (!loadedMinter) {
        return history.push("/mint");
      }
      const files = loadedMinter.file.map((base64file) => {
        return getFileFromBase64(base64file.url, base64file.name);
      });
      loadedMinter.file = files;
      setMinterObj(loadedMinter);
      handleSetState({
        description: loadedMinter.description,
        fileName: loadedMinter.fileName,
        category: loadedMinter.category,
        attributes: loadedMinter.attributes,
        vibeProps: loadedMinter.vibeProps,
        stick_type: loadedMinter.stick_type,
      });
    }
    return null;
  }, [chain]);

  useEffect(() => {
    handleSetState({
      attributes: loadedMinter.attributes,
    });
  }, [file]);

  const handleAddAttribute = () => {
    handleSetState({
      attributes: {
        ...attributes,
        [Date.now()]: { trait_type: "", value: "" },
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
    const {
      event: {
        target: { name, value },
      },
      id,
    } = arg;
    handleSetState({
      attributes: { ...attributes, [id]: { ...attributes[id], [name]: value } },
    });
  };

  const handleCancel = () => {
    dispatch(setMinter(null));
    history.push("/mint");
  };

  const handleSetFileState = () => {
    console.log("handleSetFileState");
  };

  const changeFile = () => {
    history.push(`/mint/${minter.mintType}`);
  };

  const setMint = () => {
    if (!(window.localStorage.walletconnect || chainId)) return initConnectWallet({ dispatch });

    if (!chainId) {
      return dispatch(
        setNotification({
          message: "connect your wallet and try again",
          type: "warning",
        })
      );
    }
    if (showReceiverAddress && receiverAddress.length < 42) {
      return dispatch(
        setNotification({
          message: "Invalid receiver address ",
          type: "warning",
        })
      );
    }
    if (receiverAddress.length >= 42 && showReceiverAddress) {
      mintProps.receiverAddress = receiverAddress;
      singleMintProps.receiverAddress = receiverAddress;
    } else {
      mintProps.receiverAddress = account;
      singleMintProps.receiverAddress = account;
    }
    if (file?.length > 1) {
      if (!mintProps.description) {
        return dispatch(
          setNotification({
            message: "fill in the required fields",
            type: "warning",
          })
        );
      }
      dispatch(setOverlay(true));
      handleMint(mintProps).then((url) => {
        dispatch(setOverlay(false));
        if (typeof url === "object") {
          handleSetState({
            popupProps: {
              url: url.message,
              isError: true,
              popup: true,
            },
          });
        } else {
          sessionStorage.removeItem("minter");
          handleSetState({
            popupProps: {
              url,
              isError: false,
              popup: true,
            },
          });
        }
      });
    } else {
      if (!singleMintProps.fileName || !description) {
        return dispatch(
          setNotification({
            message: "fill out the missing fields",
            type: "warning",
          })
        );
      }
      if (category) {
        singleMintProps.metadata.attributes.push({
          trait_type: "Category",
          value: category,
        });
        if (category === "Sesh") {
          singleMintProps.metadata.attributes.push({
            trait_type: "smoking stick",
            value: stick_type,
          });
        } else if (category === "Vibe") {
          singleMintProps.metadata.attributes.push(
            {
              trait_type: "friendliness",
              value: vibeProps.friendliness,
            },
            {
              trait_type: "energy",
              value: vibeProps.energy,
            },
            {
              trait_type: "density",
              value: vibeProps.density,
            }
          );
        }
      }
      dispatch(setOverlay(true));

      handleSingleMint(singleMintProps).then((url) => {
        dispatch(setOverlay(false));
        if (singleMintProps.chain.toLowerCase() === "near") {
          return {};
        }
        if (typeof url === "object") {
          handleSetState({
            popupProps: {
              url: url.message,
              isError: true,
              popup: true,
            },
          });
        } else {
          sessionStorage.removeItem("minter");
          handleSetState({
            popupProps: {
              url,
              isError: false,
              popup: true,
            },
          });
        }
      });
    }
  };

  const handleConnectFromMint = (props) => {
    handleSetState({ toggleDropdown: false });
    dispatch(setToggleWalletPopup(true));
    dispatch(
      setConnectFromMint({
        chainId: props.networkId,
        isComingSoon: props.comingSoon,
      })
    );
  };

  useEffect(() => {
    if (chainId) {
      handleSetState({ chain: supportedChains[chainId] });
    }
  }, [chainId]);

  const handleReceiverAddress = (e) => {
    handleSetState({ receiverAddress: e.target.value });
    if (e.target.value.length >= 42) {
      handleSetState({ goodReceiverAddress: true });
    } else {
      handleSetState({ goodReceiverAddress: false });
    }
  };
  // select category
  let categories = ["Sesh", "Photography", "Painting", "Illustration", "3D"];
  const stick_types = ["blunt", "joint", "spliff", "hashish", "bong", "cigarette", "cigar"];

  // get current location
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  function success(pos) {
    const crd = pos.coords;
    const lat = crd.latitude;
    const lon = crd.longitude;
    const API_KEY = "994462fe818ec2383a1f5e5da2a2455b";
    const API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    if (lat && lon) {
      if (category === "Sesh") {
        axios
          .get(API_URL)
          .then((data) => {
            const country = data?.data[0]?.country;
            const city = data?.data[0]?.name;
            const address = `${country}/${city}`;
            handleSetState({
              attributes: {
                ...attributes,
                location: { trait_type: "chapter", value: address },
              },
            });
          })
          .catch((err) => console.log(err));
      } else {
        handleSetState({
          attributes: {
            ...attributes,
            location: { trait_type: "location", value: `${lon},${lat}` },
          },
        });
      }
    }
  }
  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);

    handleSetState({
      showLocation: false,
    });
    return dispatch(
      setNotification({
        message: "Location access denied",
        type: "error",
      })
    );
  }

  const getLocation = () => navigator.geolocation.getCurrentPosition(success, error, options);
  useEffect(() => {
    if (showLocation) {
      getLocation();
    } else {
      const new_attr = attributes;
      delete new_attr.location;
      handleSetState({
        attributes: new_attr,
      });
    }
  }, [showLocation, category]);

  const isVibe = metadata?.attributes ? metadata?.attributes[1].value === "Photography" : false;
  if (isVibe) categories = ["Vibe", "Photography"];

  return (
    <div className={classes.container}>
      <Popup handleSetState={handleSetState} popupProps={popupProps} />
      {preview ? (
        <CollectionPreview
          previewSelectMode={previewSelectMode}
          file={file}
          metadata={metadata}
          handleMintSetState={handleSetState}
          collectionProfile={collectionProfile}
          handleSetFileState={handleSetFileState}
          zip={zip}
        />
      ) : (
        <div className={classes.wrapper}>
          <div>
            <section className={classes.assetContainer}>
              <div className={`${classes.imageContainers} ${file?.length > 1 && classes._}`}>
                {file &&
                  (file?.length > 1 ? (
                    file
                      .filter((_, idx) => idx < 3)
                      .map((f, idx) => (
                        <div
                          key={idx}
                          style={{ backgroundImage: `url(${URL.createObjectURL(f)})` }}
                          className={classes.imageContainer}
                        />
                      ))
                  ) : file[0].type === "video/mp4" ? (
                    <video src={URL.createObjectURL(file[0])} alt="" className={classes.singleImage} autoPlay loop />
                  ) : (
                    <img src={URL.createObjectURL(file[0])} alt="" className={classes.singleImage} />
                  ))}
                {category === "Vibe" && <img src={VibesLogo} className={classes.overlayImage} alt="proof-of-vibes" />}
              </div>

              <div className={classes.assetInfo}>
                <div className={classes.innerAssetInfo}>
                  <div className={classes.assetInfoTitle}>
                    <span>{fName}</span>
                  </div>
                  <div>
                    <span>Number of assets:</span> <p>{file?.length}</p>
                  </div>
                  {chainId === 4160 && (
                    <div className={classes.priceTooltip}>
                      <span>Mint Price:</span> <p className={classes.assetInfoMintPrice}>{file?.length * 0.1} ALGO</p>
                      <GenadropToolTip content="Mint price is 0.01 per NFT" fill="#0d99ff" />
                    </div>
                  )}
                  {file?.length > 1 ? (
                    <div onClick={() => handleSetState({ preview: true })} className={classes.showPreview}>
                      <span>view all assets</span>
                      <img src={rightArrow} alt="" />
                    </div>
                  ) : null}
                </div>
                <button onClick={changeFile} type="button">
                  Change asset
                </button>
              </div>
            </section>
            <div className={classes.mintForm}>
              <div className={classes.heading}>{file?.length > 1 ? "Mint a collection" : "Mint 1 of 1"}</div>

              <section className={classes.details}>
                <div className={classes.category}>Asset Details</div>
                <div className={classes.inputWrapper}>
                  <label>
                    {" "}
                    Title <span className={classes.required}>*</span>
                  </label>
                  <input
                    style={zip ? { pointerEvents: "none" } : {}}
                    type="text"
                    value={fileName}
                    onChange={(event) => handleSetState({ fileName: event.target.value })}
                  />
                </div>

                <div className={classes.inputWrapper}>
                  <label>
                    Description <span className={classes.required}>*</span>{" "}
                    <GenadropToolTip
                      content="This description will be visible on your collection page"
                      fill="#0d99ff"
                    />
                  </label>
                  <textarea
                    style={metadata?.length === 1 ? { pointerEvents: "none" } : {}}
                    rows="5"
                    value={description}
                    onChange={(event) => handleSetState({ description: event.target.value })}
                  />
                </div>

                {file?.length === 1 && (
                  <div className={classes.inputWrapper}>
                    <label>Category</label>
                    <div
                      onClick={() => {
                        if (!metadata?.attributes[1]?.value || isVibe) {
                          handleSetState({
                            toggleCategory: !toggleCategory,
                          });
                        }
                      }}
                      className={`${classes.chain} ${classes.active}`}
                    >
                      {category ? <div className={classes.chainLabel}>{category}</div> : <span>Select Category</span>}
                      {(!metadata?.attributes || isVibe) && <DropdownIcon className={classes.dropdownIcon} />}
                    </div>
                    <div className={`${classes.chainDropdown} ${toggleCategory && classes.active}`}>
                      {categories.map((nftCategory) => (
                        <div
                          className={`${classes.chain} `}
                          key={nftCategory}
                          onClick={() => handleSetState({ category: nftCategory, toggleCategory: false })}
                        >
                          {nftCategory}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {category === "Sesh" && (
                  <div className={classes.inputWrapper}>
                    <label>Stick Type</label>
                    <div
                      onClick={() => {
                        handleSetState({
                          toggleType: !toggleType,
                        });
                      }}
                      className={`${classes.chain} ${classes.active}`}
                    >
                      {stick_type ? <div className={classes.chainLabel}>{stick_type}</div> : <span>Select</span>}
                      <DropdownIcon className={classes.dropdownIcon} />
                    </div>
                    <div className={`${classes.chainDropdown} ${toggleType && classes.active}`}>
                      {stick_types.map((type) => (
                        <div
                          className={`${classes.chain} `}
                          key={type}
                          onClick={() => handleSetState({ stick_type: type, toggleType: false })}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {category === "Vibe" && (
                  <div className={classes.inputWrapper}>
                    <label>Friendliness</label>
                    <SliderInput
                      MAX={10}
                      value={vibeProps.friendliness}
                      handleChange={(e) => {
                        const friendliness = e.target.value;
                        const newProps = vibeProps;
                        newProps.friendliness = friendliness;
                        handleSetState({
                          vibeProps: newProps,
                        });
                      }}
                    />
                    <label>Energy</label>
                    <SliderInput
                      MAX={10}
                      value={vibeProps.energy}
                      handleChange={(e) => {
                        const energy = e.target.value;
                        const newProps = vibeProps;
                        newProps.energy = energy;
                        handleSetState({
                          vibeProps: newProps,
                        });
                      }}
                    />
                    <label>Density</label>
                    <SliderInput
                      MAX={10}
                      value={vibeProps.density}
                      handleChange={(e) => {
                        const density = e.target.value;
                        const newProps = vibeProps;
                        newProps.density = density;
                        handleSetState({
                          vibeProps: newProps,
                        });
                      }}
                    />
                  </div>
                )}
                <div className={classes.inputWrapper}>
                  <label>Attributes</label>
                  {!zip ? (
                    <>
                      <div className={classes.attributes}>
                        {Object.keys(attributes).map((key) => (
                          <Attribute
                            key={key}
                            attribute={attributes[key]}
                            id={key}
                            index={key}
                            removeAttribute={handleRemoveAttribute}
                            changeAttribute={handleChangeAttribute}
                          />
                        ))}
                      </div>
                      <button type="button" onClick={handleAddAttribute}>
                        + Add Attribute
                      </button>
                    </>
                  ) : metadata.length === 1 ? (
                    <>
                      {metadata[0].attributes.map((attr, idx) => (
                        <div className={classes.attribute} key={idx}>
                          <div>{attr.trait_type}</div>
                          <div>{attr.value}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className={classes.metadata}>
                      <div>Number of assets: {metadata.length}</div>
                      <div className={classes.trait_type}>
                        Trait_types:
                        {metadata[0]?.attributes.map(({ trait_type }, idx) => (
                          <span key={idx}>{trait_type} </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {file?.length > 1 && (
                  <>
                    <div className={`${classes.inputWrapper} ${classes.dropInputWrapper}`}>
                      <label>
                        Collection photo
                        <GenadropToolTip content="This image will be used as collection logo" fill="#0d99ff" />
                      </label>
                    </div>
                    <div className={`${classes.dropWrapper} ${collectionProfile && classes.dropWrapperSeleted}`}>
                      <div onClick={() => handleSetState({ toggleGuide: true })}>
                        {profileSelected ? (
                          <img src={URL.createObjectURL(file[0])} alt="" />
                        ) : (
                          <div className={classes.selectImg}>
                            <PlusIcon />
                            <p>Add photo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {(category === "Vibe" || category === "Sesh") && file?.length === 1 && (
                  <div className={classes.inputWrapper}>
                    <div className={classes.toggleTitle}>
                      <div className={classes.category}>Enable Location</div>
                      <div className={classes.toggler} onClick={() => handleSetState({ showLocation: !showLocation })}>
                        <label className={classes.switch}>
                          <div className={`${classes.locationSlider} ${showLocation ? classes.active : ""}`} />
                          <span className={classes.slider} />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className={classes.inputWrapper}>
                  <div className={classes.toggleTitle}>
                    <div className={classes.category}>
                      Non Tranferable NFT{" "}
                      <GenadropToolTip
                        content="This NFT will be minted to receiver address and cannot be moved afterward"
                        fill="#0d99ff"
                      />
                    </div>
                    <div className={classes.toggler}>
                      <label className={classes.switch}>
                        <input
                          type="checkbox"
                          onClick={() => handleSetState({ showReceiverAddress: !showReceiverAddress })}
                        />
                        <span className={classes.slider} />
                      </label>
                    </div>
                  </div>

                  <div className={showReceiverAddress ? classes.receiverAddress : classes.noDisplay}>
                    <label>Receiver Address</label>

                    <div className={classes.inputContainer}>
                      <input
                        style={zip ? { pointerEvents: "none" } : {}}
                        type="text"
                        value={receiverAddress}
                        placeholder={account}
                        onChange={(event) => handleReceiverAddress(event)}
                      />
                      {goodReceiverAddress ? <GreenTickIcon /> : ""}
                    </div>
                  </div>
                </div>
              </section>

              <section className={classes.mintOptions}>
                <div className={classes.category}>Set Mint Options</div>
                <div className={classes.inputWrapper}>
                  <label>Blockchain</label>
                  <div
                    onClick={() => handleSetState({ toggleDropdown: !toggleDropdown })}
                    className={`${classes.chain} ${classes.active}`}
                  >
                    {chainId ? (
                      <div className={classes.chainLabel}>
                        <img src={supportedChains[chainId].icon} alt="" />
                        {chain?.label}
                      </div>
                    ) : (
                      <span>Select Chain</span>
                    )}
                    <DropdownIcon className={classes.dropdownIcon} />
                  </div>
                  <div className={`${classes.chainDropdown} ${toggleDropdown && classes.active}`}>
                    {Object.values(supportedChains)
                      .filter((chainE) => mainnet === chainE.isMainnet)
                      .map((chainE, idx) => (
                        <div
                          onClick={() =>
                            !chainE.comingSoon && chainE.networkId !== chainId
                              ? handleConnectFromMint(chainE)
                              : handleSetState({ toggleDropdown: !toggleDropdown })
                          }
                          className={`${classes.chain} ${chainE.comingSoon && classes.disable}`}
                          key={chainE.id}
                          value={chainE.label}
                        >
                          <img src={chainE.icon} alt="" />
                          {chainE.label}
                        </div>
                      ))}
                  </div>
                </div>
              </section>

              <section className={classes.mintButtonWrapper}>
                <button type="button" onClick={setMint} className={classes.mintBtn}>
                  Mint
                </button>
                <button type="button" onClick={handleCancel} className={classes.cancelBtn}>
                  Cancel
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
      <ProfileImgOverlay
        metadata={metadata}
        zip={zip}
        handleSetState={handleSetState}
        handleSetFileState={handleSetFileState}
        file={file}
        toggleGuide={toggleGuide}
        collectionProfile={collectionProfile}
      />
    </div>
  );
};

export default Minter;
