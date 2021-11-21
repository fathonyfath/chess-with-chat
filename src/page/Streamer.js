import { useEffect, useState } from "react";
import PeerState from "../peer/peer-state";
import usePeer from "../peer/usePeer";

const Streamer = () => {
  const [items, setItems] = useState([]);
  const dataObserver = (data) => {
    setItems((items) => [...items, data]);
  };

  const { myPeerId, state, send } = usePeer(dataObserver);
  const [viewerLink, setViewerLink] = useState(null);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    if (!myPeerId) return;

    const url = new URL('/viewer', window.location.origin);
    url.search = new URLSearchParams({ connect_to: myPeerId });
    setViewerLink(url.href);
  }, [myPeerId]);

  return (
    <>
      <h1>Streamer</h1>
      <h2>State: {state}</h2>
      <p>MyPeerId: {myPeerId}</p>
      <input type="text" id="link" name="link" value={viewerLink || ""} readOnly></input>
      <button
        disabled={!viewerLink}
        onClick={() => navigator.clipboard.writeText(viewerLink)}>
        Copy link
      </button>
      <br />
      <input type="text" id="message" name="message" value={message} onChange={(ev) => setMessage(ev.target.value)}></input>
      <button
        disabled={state === PeerState.Idle}
        onClick={() => {
          send(message);
          setMessage("");
        }}>
        Send message
      </button>
      {items.length > 0 && <p>Item: </p>}
      <ul>
        {items.map((item) => <li>{item}</li>)}
      </ul>
    </>
  );
};

export default Streamer;