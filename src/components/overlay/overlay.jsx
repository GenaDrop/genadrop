import { useContext } from 'react';
import classes from './overlay.module.css';
import { GenContext } from '../../gen-state/gen.context';

const Overlay = () => {
  const { isLoading } = useContext(GenContext);

  return (
    <div className={`${classes.overlay} ${isLoading && classes.isLoading}`}>
      {/* <p>Do not reload the page...</p> */}
    </div>
  );
};

export default Overlay;
