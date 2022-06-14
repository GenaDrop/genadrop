import React, { useState, useRef, useEffect } from "react";
import classes from "./tableRow.module.css";
import saleIcon from "../../../assets/sale-icon.png";
import transferIcon from "../../../assets/transfer-icon.png";
import mintIcon from "../../../assets/mint-icon.png";
import Transaction from "../../transactionDetails/TransactionDetails";
import { readUserProfile } from "../../../utils/firebase";

const TableRow = (data) => {
  const [state, setState] = useState({
    showTransaction: false,
    to: "",
    from: "",
  });
  const handleSetState = (payload) => {
    setState((states) => ({ ...states, ...payload }));
  };
  const { showTransaction, to, from } = state;

  function breakAddress(address = "", width = 6) {
    if (!address) return "--";
    return `${address.slice(0, width)}...${address.slice(-width)}`;
  }

  const icons = [saleIcon, transferIcon, mintIcon];
  const getDate = () => {
    let date = new Date(data.date.seconds * 1000);
    let graphDate = new Date(data.date * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let formatedGraphDate = `${months[graphDate.getMonth()]} ${graphDate.getDate()}, ${graphDate.getFullYear()}`;
    let formattedDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    return date.getDate() ? formattedDate : formatedGraphDate;
  };
  const icon = () => {
    let icon = "";
    switch (data.event) {
      case "Sale":
        icon = icons[0];
        break;
      case "Transfer":
        icon = icons[1];
        break;
      case "Minting":
        icon = icons[2];
        break;
      default:
        break;
    }
    return icon;
  };

  const handleClick = () => {
    handleSetState({ showTransaction: true });
  };

  const wrapperRef = useRef(null);

  function useOutsideAlerter(ref) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          handleSetState({ showTransaction: false });
        }
      }

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const getUsername = (address) => {};
  useEffect(() => {
    readUserProfile(to).then((data) => {
      if (data) setState({ to: data.username });
    });

    readUserProfile(from).then((data) => {
      if (data) setState({ from: data.username });
    });
  }, [to, from]);
  useOutsideAlerter(wrapperRef);
  return (
    <>
      {showTransaction ? (
        <div ref={wrapperRef}>
          <Transaction data={data} date={getDate(data.date)} chain={data.chain} />
        </div>
      ) : null}
      <tr className={classes.transaction} onClick={handleClick}>
        <td>
          <span className={classes.icon}>
            <img src={icon()} alt="" />
          </span>
          {data.event}
        </td>
        <td>{!data.txId ? "--" : breakAddress(data.txId)}</td>
        <td>{getDate(data.date)}</td>
        <td>{!data.price ? "--" : data.price}</td>
        <td>{to ? to : breakAddress(data.to)}</td>
        <td>{from ? from : breakAddress(data.from)}</td>
      </tr>
    </>
  );
};

export default TableRow;
