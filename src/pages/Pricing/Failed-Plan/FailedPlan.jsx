import { useContext, useEffect } from "react";
import { GenContext } from "../../../gen-state/gen.context";
import { ReactComponent as FailedIcon } from "../../../assets/icon-payment-failed.svg";
import classes from "./FailedPlan.module.css";
import { useHistory } from "react-router-dom";
import { setProposedPlan } from "../../../gen-state/gen.actions";

const FailedPlan = () => {
  const history = useHistory();
  const { dispatch, proposedPlan } = useContext(GenContext);

  useEffect(() => {
    if (!proposedPlan) {
      return history.push("/create");
    }
    dispatch(setProposedPlan(""));
    document.documentElement.scrollTop = 0;
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        <FailedIcon className={classes.failedIcon} />
        <div className={classes.heading}>Payment failed!</div>
        <div className={classes.description}>Something went terribly wrong here Don’t worry! Let’s try again</div>
        <div className={classes.btnContainer}>
          <button onClick={() => history.push("/create/session/pricing")} className={classes.btn_1}>
            Try again
          </button>
          <button onClick={() => history.push("/create")} className={classes.btn_2}>
            Go to create
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailedPlan;
