import { useEffect, useState } from "react";
import PeerState from "../peer/peer-state";
import usePeer from "../peer/usePeer";
import { updateSnapshot } from "../protocol/protocol";
import createVotingState from "../protocol/voting-state";

const Streamer = () => {
  const { myPeerId, state, send } = usePeer();
  const [viewerLink, setViewerLink] = useState(null);

  useEffect(() => {
    if (!myPeerId) return;

    const url = new URL('/viewer', window.location.origin);
    url.search = new URLSearchParams({ connect_to: myPeerId });
    setViewerLink(url.href);
  }, [myPeerId]);

  const sendRandomVotingEvent = () => {
    const randomLength = Math.floor(Math.random() * 5) + 1;
    const randomData = [...Array(randomLength).keys()].map((i) => {
      return {
        name: `Key-${i}`,
        value: Math.floor(Math.random() * 100) + 1
      };
    });

    const votingState = createVotingState(Math.random() < 0.5, randomData);
    const protocol = updateSnapshot({ votingState });

    send(protocol);
  };

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
      <button
        disabled={state === PeerState.Idle}
        onClick={sendRandomVotingEvent}>
        Send random voting event
      </button>
    </>
  );
};

export default Streamer;