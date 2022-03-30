import React, { useEffect, useState } from 'react';

import { useHistory, useRouteMatch } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import classes from './collections.module.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { getNftCollections } from '../../../utils';
import CollectionsCard from '../collectionsCard/collectionsCard';
import { fetchCollections } from '../../../utils/firebase';
// import NotFound from '../../not-found/notFound';

const Collections = () => {
  const [state, setState] = useState({
    algoCollection: [],
  });
  const { algoCollection } = state;

  const handleSetState = (payload) => {
    setState((states) => ({ ...states, ...payload }));
  };
  const history = useHistory();
  const { url } = useRouteMatch();

  useEffect(() => {
    try {
      (async function getAlgoCollection() {
        const collections = await fetchCollections();
        if (collections?.length) {
          const result = await getNftCollections(collections);
          handleSetState({ algoCollection: result });
        } else {
          handleSetState({ algoCollection: null });
        }
      }());
    } catch (error) {
      console.log(error);
    }
  }, []);
  return (
    <div className={classes.container}>
      <div className={classes.heading}>
        <h3>Top Collections</h3>
        <button type="button" onClick={() => history.push(`${url}/collections`)}>view all</button>
      </div>

      {
        algoCollection?.length
          ? (
            <div className={classes.wrapper}>
              {
              algoCollection
                .filter((_, idx) => idx < 10)
                .map((collection, idx) => (
                  <CollectionsCard key={idx} collection={collection} />
                ))
            }
            </div>
          )
          : !algoCollection
            ? <h1 className={classes.noResult}> No Result Found.</h1>
            : (
              <div className={classes.skeleton}>
                {
                (Array(4).fill(null)).map((_, idx) => (
                  <div key={idx}>
                    <Skeleton count={1} height={250} />
                    <br />
                    <Skeleton count={1} height={30} />
                    <br />
                    <Skeleton count={1} height={30} />
                  </div>
                ))
              }
              </div>
            )
      }
    </div>
  );
};

export default Collections;
