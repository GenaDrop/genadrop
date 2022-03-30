import classes from './button.module.css';

const Button = ({ children, invert }) => (
  <button className={`${classes.button} ${invert && classes.invert}`}>{children}</button>
);

export default Button;
