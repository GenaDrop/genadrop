import { useEffect, useState } from 'react';
import classes from './priceDropdown.module.css';
import dropdownIcon from '../../../assets/icon-dropdown.svg';
import arrowDown from '../../../assets/icon-arrow-down-long.svg';
import arrowUp from '../../../assets/icon-arrow-up-long.svg';

const PriceDropdown = ({ onPriceFilter }) => {
  const [state, setState] = useState({
    togglePriceFilter: false,
    priceFilter: 'low',
  });

  const { priceFilter, togglePriceFilter } = state;

  const handleSetState = (payload) => {
    setState((state) => ({ ...state, ...payload }));
  };

  useEffect(() => {
    onPriceFilter(priceFilter);
  }, [priceFilter]);

  return (
    <div className={classes.priceDropdown}>
      <div onClick={() => handleSetState({ togglePriceFilter: !togglePriceFilter })} className={classes.selectedPrice}>
        Price
        <div className={classes.priceInfo}>
          {priceFilter === 'low' ? <span>Low to High</span> : <span>High to Low</span>}
          <img src={dropdownIcon} alt="" className={`${classes.dropdownIcon} ${togglePriceFilter && classes.active}`} />
        </div>
      </div>
      <div className={`${classes.dropdown} ${togglePriceFilter && classes.active}`}>
        <div onClick={() => handleSetState({ priceFilter: 'low', togglePriceFilter: false })}>
          price
          {' '}
          <div className={classes.priceInfo}>
            <span>Low to High</span>
            {' '}
            <img src={arrowUp} alt="" />
          </div>
        </div>
        <div onClick={() => handleSetState({ priceFilter: 'high', togglePriceFilter: false })}>
          price
          {' '}
          <div className={classes.priceInfo}>
            <span>High to Low</span>
            {' '}
            <img src={arrowDown} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;
