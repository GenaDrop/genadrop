import { useContext, useEffect, useRef } from 'react';
import { setCurrentDnaLayers, setLoading, setMintAmount, setMintInfo, setNftLayers } from '../../gen-state/gen.actions';
import { GenContext } from '../../gen-state/gen.context';
import Button from '../button/button';
import CollectionDetails from '../details/collection-details';
import CollectionPreview from '../preview/collection-preview';
import classes from './collection-description.module.css';
import { Link } from 'react-router-dom';
import ButtonClickEffect from '../button-effect/button-effect';
import { createDna, createUniqueLayer, generateArt, parseLayers } from './collection-description-script';

const CollectionDescription = () => {
  const { layers, mintAmount, dispatch, combinations, isLoading, mintInfo, rule, isRule } = useContext(GenContext);
  const canvasRef = useRef(null);

  const handleChange = event => {
    let value = event.target.value;
    dispatch(setMintAmount(value ? parseInt(value) : 0))
    dispatch(setMintInfo(""))
  }

  const handleGenerate = async () => {
    if (isRule) return
    dispatch(setMintInfo("in progress..."))
    if (!mintAmount) return dispatch(setMintInfo("please set the amount to generate"));
    if (!combinations) return dispatch(setMintInfo("Please uplaod assets"))
    if (mintAmount > combinations - rule.length) return dispatch(setMintInfo("cannot generate more than the possible combinations"));
    dispatch(setNftLayers([]))
    dispatch(setLoading(true))
    const dnaLayers = createDna(layers);
    const uniqueLayers = createUniqueLayer({ layers: dnaLayers, mintAmount, rule });
    const arts = await generateArt({ layers: uniqueLayers, canvas: canvasRef.current, image: layers[0]['traits'][0]['image'] });
    dispatch(setCurrentDnaLayers(dnaLayers))
    dispatch(setNftLayers(parseLayers({ uniqueLayers, arts })))
    dispatch(setMintInfo("completed"))
    dispatch(setLoading(false))
  }

  useEffect(() => {
    dispatch(setLoading(false))
  }, [dispatch])

  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        <div className={classes.preview_details}>
          <div className={classes.previewWrapper}>
            <CollectionPreview />
          </div>
          <div className={classes.detailsWrapper}>
            <CollectionDetails />
          </div>
        </div>
        <div className={classes.btnWrapper}>
          <div onClick={handleGenerate}>
            <ButtonClickEffect>
              <Button>generate {mintAmount}</Button>
            </ButtonClickEffect>
          </div>
        </div>

        <div className={classes.btnWrapper}>
          {
            mintInfo === "completed" && !isRule
              ?
              <Link to="/preview">
                <ButtonClickEffect>
                  <Button invert>preview</Button>
                </ButtonClickEffect>
              </Link>
              :
              <div className={`${classes.mintInfo} ${isLoading && classes.isLoading}`}>
                {mintInfo}
              </div>
          }
        </div>
      </div>
      <div className={classes.input}>
        <div className={classes.action}>
          <label htmlFor="generate amout">Generate Amount</label>
          <input onChange={handleChange} type="number" min="0" />
        </div>
        <div className={classes.action}>
          <div htmlFor="combinations">Combinations</div>
          <div>{combinations - rule.length}</div>
        </div>
      </div>

      <canvas style={{ display: "none" }} ref={canvasRef}></canvas>
    </div>
  )
}

export default CollectionDescription;