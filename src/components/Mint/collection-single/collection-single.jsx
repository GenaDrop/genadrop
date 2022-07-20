import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useHistory, useRouteMatch, Link } from "react-router-dom";
import classes from "./collection-single.module.css";
import { ReactComponent as CollectionIcon } from "../../../assets/icon-collection-light.svg";
import { ReactComponent as _1of1Icon } from "../../../assets/icon-1of1-light.svg";
import { ReactComponent as LeftArrow } from "../../../assets/icon-arrow-left.svg";
// import UploadOverlay from "../upload-overlay/upload-overlay";
import { handleZipFile } from "./collection-single-script";
import Minter from "../minter/minter";
import { ReactComponent as Line } from "../../../assets/icon-line.svg";
import { GenContext } from "../../../gen-state/gen.context";

const CollectionToSingleMinter = () => {
  const params = useParams();
  const history = useHistory();
  const { url } = useRouteMatch();
  const fileRef = useRef(null);
  const dragRef = useRef(null);
  const dropRef = useRef(null);

  const { zip: zipObg } = useContext(GenContext);
  const [state, setState] = useState({
    mintSwitch: "",
    loading1: false,
    loading2: false,
    acceptedFileType: "",
    file: null,
    fileName: "",
    metadata: null,
    zip: null,
  });

  const { mintSwitch, loading1, loading2, acceptedFileType, file, fileName, metadata, zip } = state;

  const handleSetState = (payload) => {
    setState((state) => ({ ...state, ...payload }));
  };

  const handleCollectionClick = () => {
    history.push(url.replace("1of1", "collection"));
  };

  const handle1of1Click = () => {
    history.push(url.replace("collection", "1of1"));
  };

  const handleImageLoading1 = () => {
    handleSetState({ loading1: true });
  };

  const handleImageLoading2 = () => {
    handleSetState({ loading2: true });
  };

  const handleFileChange = (event) => {
    handleSetState({ fileName: "", file: null, metadata: null, zip: null });
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;
    const name = uploadedFile.name.replace(/\.+\s*\./, ".").split(".");
    const uploadedFileName = name.slice(0, name.length - 1).join(".");
    const fileType = name.slice(name.length - 1).join();
    if (!acceptedFileType.includes(fileType.toLowerCase())) return;

    if (fileType === "zip") {
      handleSetState({ zip: uploadedFile, fileName: uploadedFileName });
      handleZipFile({ uploadedFile, handleSetState });
    } else {
      handleSetState({ file: [uploadedFile], fileName: uploadedFileName });
    }
  };

  // read zip file directed from the create page
  const handleZipUpload = () => {
    handleSetState({ fileName: "", file: null, metadata: null, zip: null });
    const zipFile = zipObg.file;
    handleSetState({ zip: zipFile, fileName: zipObg.name });

    handleZipFile({ uploadedFile: zipFile, handleSetState });
  };

  useEffect(() => {
    dragRef.current.ondragover = (e) => {
      e.preventDefault();
      document.querySelector(".drop-area").style.border = "2px dashed green";
    };
    dragRef.current.ondragleave = (e) => {
      e.preventDefault();
      document.querySelector(".drop-area").style.border = "2px solid var(--outline)";
    };
    dragRef.current.ondrop = (e) => {
      e.preventDefault();
      document.querySelector(".drop-area").style.border = "2px solid green";
      handleFileChange({ target: e.dataTransfer });
    };
  }, []);

  useEffect(() => {
    if (params.mintId === "collection") {
      handleSetState({ acceptedFileType: ".zip" });
    } else {
      handleSetState({ acceptedFileType: ".jpg, .jpeg, .png, .webp" });
    }
    handleSetState({ mintSwitch: params.mintId });
  }, [params.mintId]);

  useEffect(() => {
    if (Object.keys(zipObg).length !== 0) {
      handleZipUpload();
    }
  }, [zipObg]);
  return (
    <div ref={dragRef} className={classes.container}>
      {/* <div ref={dropRef} style={{display: 'none'}} className="drop-area"><UploadOverlay /></div>  */}

      {file ? (
        <Minter
          data={{ file, fileName, metadata, zip }}
          handleSetFileState={handleSetState}
          changeFile={() =>
            handleSetState({
              fileName: "",
              file: null,
              metadata: null,
              zip: null,
            })
          }
        />
      ) : (
        <>
          <Link to="/mint" className={classes.goBack}>
            <LeftArrow alt="" />
            <span>Back to Mint</span>
          </Link>
          <header className={classes.headingWrapper}>
            {/* <h1 className={classes.heading}>Mint Your NFTs</h1> */}
            <p className={classes.description}>
              Upload a{" "}
              <span>
                {params.mintId === "1of1" ? "image" : "collection"}
                <Line alt="" />
              </span>{" "}
              to create NFTs on any of our <br />
              supported blockchains super fast!
            </p>
          </header>

          <div className={classes.mintSwitch}>
            <button
              type="button"
              className={`${params.mintId === "collection" && classes.active}`}
              onClick={handleCollectionClick}
            >
              collection
            </button>
            <button type="button" className={`${params.mintId === "1of1" && classes.active}`} onClick={handle1of1Click}>
              1 of 1
            </button>
          </div>

          {mintSwitch === "collection" ? (
            <div className={`${classes.card} ${classes[params.mintId]} drop-area`}>
              {!loading1 ? <div className={classes.imagePlaceholder} /> : null}
              <CollectionIcon
                style={!loading1 ? { display: "none" } : {}}
                alt=""
                onLoad={handleImageLoading1}
              />
              <h3 className={classes.title}> Mint a collection</h3>
              <p className={classes.action}>Drag and Drop your zip file created using Genadrop Create app</p>
              <p className={classes.supportedFiles}>
                We only support .Zip files for collection mints and deploy to Celo, Algorand, Aurora, and Polygon{" "}
              </p>
              <div>or</div>
              <button type="button" onClick={() => fileRef.current.click()} className={classes.btn}>
                Browse files
              </button>
            </div>
          ) : mintSwitch === "1of1" ? (
            <div className={`${classes.card} ${classes[`_${params.mintId}`]} drop-area`}>
              {!loading2 ? <div className={classes.imagePlaceholder} /> : null}
              <_1of1Icon style={!loading2 ? { display: "none" } : {}} alt="" onLoad={handleImageLoading2} />
              <h3 className={classes.title}> Mint 1 of 1 </h3>
              <p className={classes.action}>Drag and Drop your image file here</p>
              <p className={classes.supportedFiles}>
                We only support .Zip files for collection mints and deploy to Celo, Algorand, Aurora, and Polygon{" "}
              </p>
              <div>or</div>
              <button type="button" onClick={() => fileRef.current.click()} className={classes.btn}>
                Browse files
              </button>
            </div>
          ) : (
            <div className={classes.cardPlaceholder} />
          )}

          <input
            style={{ display: "none" }}
            onChange={handleFileChange}
            ref={fileRef}
            type="file"
            accept={acceptedFileType}
          />
        </>
      )}
    </div>
  );
};

export default CollectionToSingleMinter;
