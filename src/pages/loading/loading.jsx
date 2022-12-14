import classes from './loading.module.css';
import loadingIcon from '../../assets/icon-loading-dark.svg'
const Loading = () => {
  return (
    <div className={classes.container}>
      <img src={loadingIcon} alt="" />
    </div>
  )
}

export default Loading;