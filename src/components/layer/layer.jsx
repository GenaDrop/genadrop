import { useState, useContext } from 'react';
import { updateLayer } from '../../gen-state/gen.actions';
import { GenContext } from '../../gen-state/gen.context';
import classes from './layer.module.css';

const Layer = ({ name, trait, click, id, activeInput, setActiveInput }) => {
  const [state, setState] = useState({
    inputValue: ''
  })
  const { inputValue } = state;

  const { dispatch } = useContext(GenContext);

  const handleSetState = payload => {
    setState(state => ({ ...state, ...payload }))
  }

  const handleRename = () => {
    setActiveInput('')
    if (!inputValue) return
    dispatch(updateLayer({ layerTitle: inputValue, id: id }))
  }

  const handleEdit = name => {
    setActiveInput(name)
    handleSetState({ inputValue: name })
  }

  return (
    <div className={classes.item}>
      <div className={classes._name}>
        <div className={classes.line}>
          <img src="/assets/icon-drag.svg" alt="" />
        </div>
        <div className={classes.renameBtn}>
          {activeInput === name
            ?
            <form onSubmit={handleRename}>
              <input
                className={`${classes.renameInput} ${classes.active}`}
                type="text"
                onChange={e => handleSetState({ inputValue: e.target.value })}
                value={inputValue}
                autoFocus
              />
            </form>
            :
            <div className={classes.nameHeader}>{name}</div>
          }
          <div className={classes.editBtn} >
            {activeInput === name
              ? <img onClick={handleRename} src="/assets/icon-mark.svg" alt="" />
              : <img onClick={() => handleEdit(name)} src="/assets/icon-edit.svg" alt="" />
            }
          </div>
        </div>
      </div>
      <div className={classes.trait}>{trait}</div>
      <div onClick={click} className={classes.icon}>
        <img src="/assets/icon-delete.svg" alt="" />
      </div>
    </div>
  )
}

export default Layer;