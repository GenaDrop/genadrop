/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import axios from "axios";
import fileDownload from "js-file-download";
// eslint-disable-next-line import/no-unresolved
import worker from "workerize-loader!../worker"; // eslint-disable-line import/no-webpack-loader-syntax
import { getAlgoData } from "./arc_ipfs";
import { readSIngleUserNft } from "./firebase";
import blankImage from "../assets/blank.png";
import { setActiveCollection, setAlgoCollections, setAlgoSingleNfts } from "../gen-state/gen.actions";

export const getAuroraCollections = async (collection) => {
  const collectionArr = [];
  if (collection) {
    for (let i = 0; i < collection.length; i += 1) {
      try {
        const collectionObj = {};
        for (let j = 0; j < collection[i].nfts.length; j++) {
          const { data } = await axios.get(
            collection[i]?.nfts[j].tokenIPFSPath.replace("ipfs://", "https://ipfs.io/ipfs/")
          );
          collectionObj.image_url = data?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        collectionObj.name = collection[i]?.name;
        collectionObj.owner = collection[i]?.id;
        const getPrice = collection[i]?.nfts.map((col) => col.price).reduce((a, b) => (a < b ? a : b));
        const chain = collection[i]?.nfts?.map((col) => col.chain).reduce((a, b) => a === b && a);
        collectionObj.chain = chain;
        collectionObj.price = getPrice * 0.000000000000000001;
        collectionObj.description = collection[i]?.description;
        collectionObj.nfts = collection[i]?.nfts;
        collectionArr.push(collectionObj);
      } catch (error) {
        console.log(error);
      }
    }
  }
  return collectionArr;
};

export const getNftCollections = async ({ collections, mainnet, dispatch }) => {
  const collectionsObj = {};
  for (let i = 0; i < collections.length; i += 1) {
    try {
      const collectionObj = {};
      collectionObj.name = collections[i].name;
      collectionObj.price = collections[i].price;
      collectionObj.owner = collections[i].owner;
      collectionObj.description = collections[i].description;
      collectionObj.url = collections[i].url;
      const urlIPF = collections[i].url.replace("ipfs://", "https://ipfs.io/ipfs/");
      const { data } = await axios.get(urlIPF);
      collectionObj.nfts = data;
      const {
        asset: { params },
      } = await getAlgoData(mainnet, data[0]);
      const response = await axios.get(params.url.replace("ipfs://", "https://ipfs.io/ipfs/"));
      collectionObj.image_url = response.data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      collectionObj.chain = 4160;
      collectionsObj[collectionObj.name] = collectionObj;
      dispatch(setAlgoCollections({ ...collectionsObj }));
    } catch (error) {
      console.log(error);
    }
  }
  return collectionsObj;
};

export const getSingleNfts = async ({ mainnet, singleNfts, dispatch }) => {
  const nftsObj = {};
  for (let i = 0; i < singleNfts?.length; i += 1) {
    try {
      const nftObj = {};
      nftObj.Id = singleNfts[i].id;
      nftObj.price = singleNfts[i].price;
      nftObj.buyer = singleNfts[i].Buyer;
      nftObj.owner = singleNfts[i].owner;
      nftObj.sold = singleNfts[i].sold;
      nftObj.dateSold = singleNfts[i].dateSold;
      nftObj.description = singleNfts[i].description;
      nftObj.mainnet = singleNfts[i].mainnet;
      const {
        asset: { params },
      } = await getAlgoData(mainnet, singleNfts[i].id);
      nftObj.url = params.url;
      const urlIPF = params.url.replace("ipfs://", "https://ipfs.io/ipfs/");
      const response = await axios.get(urlIPF);
      nftObj.image_url = response.data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      nftObj.name = response.data.name;
      nftObj.description = response.data.description;
      nftObj.chain = 4160;
      nftObj.properties = response.data.properties;
      nftsObj[nftObj.Id] = nftObj;
      dispatch(setAlgoSingleNfts({ ...nftsObj }));
    } catch (error) {
      console.error("get collection result failed");
    }
  }
  return nftsObj;
};

export const getNftCollection = async ({ collection, mainnet, handleSetState, dispatch }) => {
  const nftArr = [];
  const nftsObj = {};
  const urlIPF = collection.url.replace("ipfs://", "https://ipfs.io/ipfs/");
  const { data } = await axios.get(urlIPF);
  for (let i = 0; i < data.length; i += 1) {
    try {
      const nftObj = {};
      nftObj.collection_name = collection.name;
      nftObj.owner = collection.owner;
      nftObj.price = collection.price;
      const {
        asset: { params },
      } = await getAlgoData(mainnet, data[i]);
      nftObj.algo_data = params;
      nftObj.Id = data[i];
      const urlIPF = params.url.replace("ipfs://", "https://ipfs.io/ipfs/");
      const response = await axios.get(urlIPF);
      const assetInfo = await readSIngleUserNft(collection.owner, data[i]);
      nftObj.sold = assetInfo.sold;
      nftObj.ipfs_data = response.data;
      nftObj.name = response.data.name;
      nftObj.image_url = response.data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      nftObj.chain = 4160;
      nftArr.push(nftObj);
      nftsObj[nftObj.Id] = nftObj;
      handleSetState({
        NFTCollection: [...nftArr],
        loadedChain: 4160,
      });
      dispatch(setActiveCollection([...nftArr]));
      window.localStorage.activeCollection = JSON.stringify({ ...nftsObj });
    } catch (error) {
      console.error(error);
    }
  }
  return nftArr;
};

export const getGraphCollection = async (collection, mainnet) => {
  const nftArr = [];
  if (collection) {
    for (let i = 0; i < collection?.length; i++) {
      const { data } = await axios.get(collection[i].tokenIPFSPath.replace("ipfs://", "https://ipfs.io/ipfs/"));
      try {
        const nftObj = {};
        nftObj.collection_name = mainnet.name;
        nftObj.description = mainnet.description;
        nftObj.chain = collection[i].chain;
        nftObj.owner = mainnet.id;
        nftObj.Id = collection[i].id;
        const getPrice = collection.map((col) => col.price).reduce((a, b) => (a < b ? a : b));
        console.log("get Price", getPrice);
        nftObj.collectionPrice = getPrice * 0.000000000000000001;
        nftObj.price = collection[i].price * 0.000000000000000001;
        nftObj.sold = collection[i].isSold;
        nftObj.ipfs_data = data;
        nftObj.name = data.name;
        nftObj.image_url = data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
        nftArr.push(nftObj);
      } catch (error) {
        console.log(error);
      }
    }
  }
  return nftArr;
};

export const getTransactions = async (transactions) => {
  const trnArr = [];

  for (let i = 0; i < transactions.length; i++) {
    try {
      const trnObj = {};
      (trnObj.buyer = transactions[i]?.buyer?.id),
        (trnObj.price = transactions[i]?.price),
        (trnObj.seller = transactions[i].id),
        (trnObj.txDate = transactions[i]?.txDate),
        (trnObj.txId = transactions[i]?.txId),
        (trnObj.type = transactions[i]?.type);
      trnArr.push(trnObj);
    } catch (error) {}
    return trnArr;
  }
};

export const getGraphNft = async (collection, mainnet) => {
  console.log(collection);
  const { data } = await axios.get(collection?.tokenIPFSPath.replace("ipfs://", "https://ipfs.io/ipfs/"));
  const nftObj = [];
  try {
    const nftArr = {};
    nftArr.collection_name = collection?.collection?.name;
    nftArr.collection_contract = collection?.collection?.id;
    nftArr.name = data?.name;
    nftArr.chain = collection?.chain;
    nftArr.owner = collection?.owner?.id;
    nftArr.price = collection?.price * 0.000000000000000001;
    nftArr.image_url = data?.image?.replace("ipfs://", "https://ipfs.io/ipfs/");
    nftArr.ipfs_data = data;
    nftArr.description = data?.description;
    nftArr.Id = collection?.tokenID;
    nftArr.marketId = collection?.id;
    nftArr.properties = data?.properties;
    nftObj.push(nftArr);
  } catch (error) {
    console.log(error);
  }

  return nftObj;
};

export const getUserNftCollection = async (mainnet, data) => {
  const nftArr = [];
  for (let i = 0; i < data?.length; i += 1) {
    try {
      const nftObj = {};
      nftObj.collection_name = data[i].collection;
      nftObj.price = data[i].price;
      const {
        asset: { params },
      } = await getAlgoData(mainnet, data[i].id);
      nftObj.algo_data = params;
      nftObj.Id = data[i].id;
      const response = await axios.get(params.url.replace("ipfs://", "https://ipfs.io/ipfs/"));
      nftObj.ipfs_data = response.data;
      nftObj.name = response.data.name;
      nftObj.image_url = response.data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      nftArr.push(nftObj);
    } catch (error) {
      console.error(error);
    }
  }
  return nftArr;
};

export const getSingleGraphNfts = async (nfts) => {
  const nftArr = [];
  for (let i = 0; i < nfts?.length; i++) {
    try {
      const nftObj = {};
      const { data } = await axios.get(nfts[i].tokenIPFSPath.replace("ipfs://", "https://ipfs.io/ipfs/"));
      nftObj.Id = nfts[i]?.id;
      nftObj.price = nfts[i]?.price * 0.000000000000000001;
      nftObj.owner = nfts[i]?.owner?.id;
      nftObj.sold = nfts[i]?.isSold;
      nftObj.chain = nfts[i]?.chain;
      nftObj.description = data?.description;
      nftObj.image_url = data?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      nftObj.name = data?.name;
      nftArr.push(nftObj);
    } catch (error) {
      console.log(error);
    }
  }
  return nftArr;
};

export const getSingleNftDetails = async (mainnet, nft) => {
  const nftDetails = {};
  try {
    nftDetails.Id = nft.id;
    nftDetails.price = nft.price;
    nftDetails.buyer = nft.buyer;
    nftDetails.owner = nft.owner;
    nftDetails.sold = nft.sold;
    nftDetails.dateSold = nft.dateSold;
    nftDetails.description = nft.description;
    const {
      asset: { params },
    } = await getAlgoData(mainnet, nft.id);
    const response = await axios.get(params.url.replace("ipfs://", "https://ipfs.io/ipfs/"));
    nftDetails.image_url = response.data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
    nftDetails.name = response.data.name;
    nftDetails.description = response.data.description;
    nftDetails.properties = response.data.properties;
  } catch (error) {
    console.error("get collection result failed");
  }
  return nftDetails;
};

// export const getNftData = async (mainnet, collection, assetName) => {
//   const collectionData = await getNftCollection({ mainnet, collection });
//   return collectionData.find((asset) => asset.name === assetName);
// };

export const getImageSize = async (img) =>
  new Promise((resolve) => {
    const image = new Image();
    if (typeof img === "string") {
      image.src = img;
    } else {
      image.src = URL.createObjectURL(img);
    }
    image.onload = () => {
      resolve({ height: image.height, width: image.width });
    };
  });

export const getDefaultName = (nameId) => {
  let id = nameId;
  id = String(id);
  if (id.length < 4) {
    const repeatBy = 4 - id.length;
    return `#${"0".repeat(repeatBy)}${id}`;
  }
  return `#${id}`;
};

export const handleImage = async (props) => {
  const { canvas, images, image } = props;
  const { height, width } = await getImageSize(image);
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
  const ctx = canvas.getContext("2d");
  for (const img of images) {
    const resImage = await new Promise((resolve) => {
      const mewImage = new Image();
      mewImage.src = URL.createObjectURL(img);
      mewImage.onload = () => {
        resolve(mewImage);
      };
    });
    if (resImage) ctx.drawImage(resImage, 0, 0, width, height);
  }
};

export const handleBlankImage = async (props) => {
  const { img, canvas } = props;
  const { height, width } = await getImageSize(img);
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
  const ctx = canvas.getContext("2d");
  const image = await new Promise((resolve) => {
    const newImage = new Image();
    newImage.src = blankImage;
    newImage.onload = () => {
      resolve(newImage);
    };
  });
  if (image) ctx.drawImage(image, 0, 0, width, height);
};

export const reOrderPreview = ({ preview, layers }) => {
  const newPreview = [];
  [...layers].forEach(({ id, traits, layerTitle }) => {
    traits.forEach(({ traitTitle }) => {
      preview.forEach((p) => {
        if (id === p.layerId && traitTitle === p.imageName) {
          newPreview.push({ ...p, layerTitle });
        }
      });
    });
  });
  return newPreview;
};

export const getMockValue = async (val) => {
  const pickerOpts = {
    types: [
      {
        description: "Images",
        accept: {
          "image/*": [".png"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  };

  async function getTheFile() {
    const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
    const fileData = await fileHandle.getFile();
    return fileData;
  }

  async function getBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        console.log("Error: ", error);
      };
    });
  }

  let value = Array(val).fill({
    attributes: [
      {
        image: await getTheFile(),
        rarity: "1",
        trait_type: "a",
        value: "Red Lips.png",
      },
    ],
    description: " #0001",
    id: Date.now(),
    image: await getBase64(await getTheFile()),
    name: "",
  });

  value = value.map((v, id) => ({
    ...v,
    name: `#${id}`,
    description: `description ${id + 1}`,
  }));

  return value;
};

export const handleDownloadWithWorker = async (props) => {
  const { name, outputFormat } = props;
  const mockValue = await getMockValue(500);
  const instance = worker();
  const content = await instance.downloadCallback({
    value: mockValue,
    name,
    outputFormat,
  });
  fileDownload(
    content,
    // eslint-disable-next-line no-constant-condition
    `${"name" ? `${"name"}${true ? "" : `_${"id"}`}.zip` : "collections.zip"}`
  );
};
