import { getDefaultName, handleImage } from '../../utils';

export const isUnique = (attributes, attr, rule) => {
  let parseAttrToRule = attr.map(p => ({ layerTitle: p.trait_type, imageName: p.value }))
  let att_str = JSON.stringify(attr);
  for (let _attr of attributes) {
    let _attr_str = JSON.stringify(_attr);
    if (_attr_str === att_str) return false;
  };
  let result;
  for (let rl of rule) {
    result = rl.every(el => {
      if (JSON.stringify(parseAttrToRule).includes(JSON.stringify(el))) return true;
      return false;
    });

    if (result === true) return false;
  };
  return true
}

export const createUniqueLayer = async props => {
  const { dispatch, setLoader, layers, rule, nftLayers, collectionName, collectionDescription, index, currentPage, id } = props;
  let newLayersCopy = [...nftLayers];
  let newAttributes = [];
  let uniqueIndex = 1;
  const prevAttributes = newLayersCopy.map(({ attributes }) => attributes);

  for (let i = 0; i < uniqueIndex; i++) {
    const promise = new Promise(resolve => {
      setTimeout(() => {
        dispatch(setLoader(`removing ${uniqueIndex} duplicates`))
        let attribute = [];
        layers.forEach(({ layerTitle, traits }) => {
          let randNum = Math.floor(Math.random() * traits.length)
          let { traitTitle, Rarity, image } = traits[randNum]
          attribute.push({
            trait_type: layerTitle,
            value: traitTitle.replace(".png", ""),
            rarity: Rarity,
            image: image
          })
        })
        if (isUnique(prevAttributes, attribute, rule)) {
          newAttributes = [...attribute];
        } else {
          uniqueIndex += 1;
        }
        resolve();
      }, 0);
    });
    await promise;
  }

  dispatch(setLoader(''))
  return {
    id,
    name: `${collectionName} ${getDefaultName(index + 1 + ((currentPage * 20) - 20))}`.trim(),
    description: collectionDescription,
    image: "image",
    attributes: newAttributes
  }
}

export const generateArt = async props => {
  const { layer, canvas, image } = props;
  const images = [];
  layer.attributes.forEach(attr => {
    images.push(attr.image)
  })
  await handleImage({ images, canvas, image });
  const imageUrl = canvas.toDataURL('image/webp', 1);
  return { id: layer.id, imageUrl }
}
