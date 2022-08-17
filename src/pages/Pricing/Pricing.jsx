import classes from "./Pricing.module.css";
import { plans } from "./Pricing.script";
import { ReactComponent as CloseIcon } from "../../assets/icon-close.svg";
import { ReactComponent as MarkIcon } from "../../assets/icon-mark.svg";
import { useEffect, useState } from "react";
import PricingModal from "../../components/Modals/Pricing-Modal/PricingModal";
import { useHistory } from "react-router-dom";
import { useContext } from "react";
import { GenContext } from "../../gen-state/gen.context";
import { setCurrentPlan, setProposedPlan } from "../../gen-state/gen.actions";
import { handleResetCreate } from "../../utils";

const Pricing = () => {
  const history = useHistory();
  const [plan, setPlan] = useState(0);
  const [price, setPrice] = useState(0);
  const { dispatch, currentPlan, upgradePlan, collectionName } = useContext(GenContext);

  const handlePlan = (plan, price) => {
    if (price) {
      setPlan(plan);
      setPrice(price - Number(plans[currentPlan].price));
      dispatch(setProposedPlan(plan));
    } else {
      handleResetCreate({ dispatch });
      dispatch(setCurrentPlan(plan));
      history.push("/create");
    }
  };

  const mapCurrentPlanToLevel = (plan, level) => {
    let levels = {
      free: 0,
      hobby: 1,
      pro: 2,
      agency: 3,
    };

    let currentLevel = levels[plan];
    if (currentLevel >= levels[level]) return true;
    return false;
  };

  const closeModal = () => {
    setPlan(0);
  };

  useEffect(() => {
    if (!collectionName) {
      return history.push("/create");
    }
    document.documentElement.scrollTop = 200;
  }, []);

  return (
    <div className={classes.container}>
      {plan != 0 ? <PricingModal modal={plan} price={price} closeModal={closeModal} /> : ""}
      <div className={classes.heading}>
        <h1>Pricing $ plans</h1>
        <p>Simple pricing.. No hidden fees. Advanced features for your NFT collections</p>
      </div>

      <div className={classes.cardMenu}>
        {Object.values(plans).map((plan, idx) => (
          <div key={idx} className={classes.wrapper}>
            {plan.mostPopular && <div className={classes.mark}>Most Popular</div>}
            <div className={classes.card}>
              <div className={classes.type}>{plan.type}</div>
              <div className={classes.description}>{plan.description}</div>
              <div className={classes.coveredCost}>{plan.coveredCost}</div>
              <div className={classes.price}>${plan.price}</div>
              <div className={classes.services}>
                {plan.services.map(({ name, available }, idx) => (
                  <div key={idx} className={classes.service}>
                    {available ? (
                      <MarkIcon className={classes.markIcon} />
                    ) : (
                      <CloseIcon className={classes.closeIcon} />
                    )}
                    <div className={classes.serviceName}>{name}</div>
                  </div>
                ))}
              </div>
              {upgradePlan && currentPlan === plan.type ? (
                <div onClick={() => history.push("/create")} className={`${classes.subscribeBtn} ${classes.disabled}`}>
                  Current Plan
                </div>
              ) : upgradePlan && mapCurrentPlanToLevel(currentPlan, plan.type) ? (
                <div className={`${classes.subscribeBtn} ${classes.disabled}`}>disabled</div>
              ) : (
                <div
                  onClick={() => handlePlan(plan.type, Number(plan.price))}
                  className={`${classes.subscribeBtn} ${plan.mostPopular && classes.active}`}
                >
                  {plan.subscription}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
