import React, { useContext, useEffect, useState } from "react";
import CollectionMenu from "../menu/collection-menu";
import classes from "./collection-overview.module.css";
import { GenContext } from "../../gen-state/gen.context";
import { addRule, clearPreview, clearRule, setConflictRule } from "../../gen-state/gen.actions";
import isUnique from "./collection-overview-script";
import RulesCard from "../rulesCard/rulesCard.component";
import { reOrderPreview } from "../../utils";
import infoIcon from "../../assets/icon-info-regular.svg";
import closeIcon from "../../assets/icon-close.svg";
import createIcon from "../../assets/create-icon2.svg";

const CollectionOverview = () => {
  const { dispatch, isRule, preview, rule, layers } = useContext(GenContext);
  const [state, setState] = useState({
    toggleInfo: false,
    showRule: false,
  });

  const { showRule, toggleInfo } = state;

  const handleSetState = (payload) => {
    setState((states) => ({ ...states, ...payload }));
  };

  const openRule = () => {
    dispatch(setConflictRule(true));
    dispatch(clearPreview());
    handleSetState({ showRule: false });
  };

  const closeRule = () => {
    dispatch(setConflictRule(false));
  };

  const handleRules = () => {
    if (!rule.length) return;
    handleSetState({ showRule: true });
  };

  const handleAddRule = () => {
    const newPreview = reOrderPreview({ preview, layers });
    if (isUnique({ rule, preview: newPreview }) && newPreview.length) {
      dispatch(addRule([...rule, newPreview]));
    }
    closeRule();
  };

  useEffect(() => {
    const ruleCopy = [...rule];
    let orderedRule = [];
    dispatch(clearRule());
    ruleCopy.forEach((r) => {
      const newRule = reOrderPreview({ preview: r, layers });
      orderedRule = [...orderedRule, newRule];
    });
    const filteredRule = orderedRule.filter((rl) => rl.length);
    dispatch(addRule(filteredRule));
  }, [layers]);

  useEffect(() => {
    if (!rule.length) handleSetState({ showRule: false });
  }, [rule]);

  return (
    <div className={classes.container}>
      {layers[0]?.traits.length ? (
        <div className={classes.rules}>
          {isRule ? (
            <>
              <button type="button" onClick={handleAddRule} className={classes.addRuleBtn}>
                Add Rule
              </button>
              <button type="button" onClick={closeRule} className={classes.showRuleBtn}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={openRule} className={classes.addRuleBtn}>
                Set Conflict
              </button>
              <button type="button" onClick={handleRules} className={classes.showRuleBtn}>
                Rules <div className={classes.ruleCount}>{rule.length}</div>
              </button>
              {showRule && (
                <div className={classes.ruleCardWrapper}>
                  <RulesCard showRule={(e) => handleSetState({ showRule: e })} />
                </div>
              )}
            </>
          )}
          <div className={`${classes.conflictGuide} ${toggleInfo && classes.hidden}`}>
            <img src={infoIcon} alt="info" />
            <p>Setting conflict rules for images means that the selected set of images cannot form a generative art</p>
            <img onClick={() => handleSetState({ toggleInfo: true })} src={closeIcon} alt="close" />
          </div>
        </div>
      ) : null}

      {layers.length ? (
        layers.map((layer) => <CollectionMenu key={layer.id} layer={layer} />)
      ) : (
        <div className={classes.fallback}>
          <img src={createIcon} alt="" />
          <h4>Add layers To generate art</h4>
          <p>Click on “Add Layer” button to add layers for your arts</p>
        </div>
      )}
    </div>
  );
};

export default CollectionOverview;
