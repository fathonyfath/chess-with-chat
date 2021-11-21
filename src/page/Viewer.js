import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import usePeer from "../peer/usePeer";

const Viewer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const connectTo = searchParams.get('connect_to');

  const [items, setItems] = useState([]);

  const dataObserver = (data) => {
    setItems((items) => [...items, data]);
    send(`Reply: ${data}`);
  };

  const { myPeerId, state, connect, send, close } = usePeer(dataObserver);

  useEffect(() => {
    if (!connectTo) {
      navigate("/");
    }
  }, [navigate, searchParams, connectTo]);


  useEffect(() => {
    if (!connectTo || !myPeerId) return;
    connect(connectTo);

    return () => {
      close();
    }
  }, [connectTo, myPeerId, close, connect]);

  return (
    <>
      <h1>Viewer</h1>
      <h2>State: {state}</h2>
      <p>MyPeerId: {myPeerId}</p>
      <p>ConnectTo: {connectTo}</p>
      {items.length > 0 && <p>Item: </p>}
      <ul>
        {items.map((item) => <li>{item}</li>)}
      </ul>
    </>
  );
};

export default Viewer;