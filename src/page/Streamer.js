import { useEffect, useRef, useState } from "react";
import GoPlayChatState from "../api/goplay-chat-state";
import useGoPlayChat from "../api/useGoPlayChat";
import ChessPlayer from "../component/ChessPlayer";
import PeerState from "../peer/peer-state";
import usePeer from "../peer/usePeer";
import { updateFEN, updateHistory, updateVotingState } from "../protocol/protocol";
import createVotingState from "../protocol/voting-state";

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const Streamer = () => {
  const eventSlugRef = useRef();

  const { myPeerId, state, send } = usePeer();
  const [viewerLink, setViewerLink] = useState(null);

  const { lastChatMessage, chatState, connect } = useGoPlayChat();

  const [acceptingChat, setAcceptingChat] = useState(true);

  const [fen, setFen] = useState(null);
  const [gameHistory, setGameHistory] = useState({});

  const getEnemyMovesRef = useRef();
  const moveEnemyRef = useRef();

  const chatIsConnected = () => chatState === GoPlayChatState.Connected

  useEffect(() => {
    if (acceptingChat && lastChatMessage) {

    }
  }, [lastChatMessage, acceptingChat]);

  const onCurrentChanged = (turn) => {
    if (turn === "b") {
      const { allMoves } = getEnemyMovesRef.current();
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      const processMove = async () => {
        await delay(1000);
        moveEnemyRef.current(randomMove);
      };
      processMove();
    }
  };

  const onGameHistoryChanged = (history) => {
    setGameHistory(history);

    const protocol = updateHistory(history);
    send(protocol);
  };

  const onFenChanged = (fen) => {
    setFen(fen);

    const protocol = updateFEN(fen);
    send(protocol);
  };

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
      <p>ChatState: {chatState}</p>
      <input type="text" id="event-slug" name="event-slug" ref={eventSlugRef}></input>
      <button
        disabled={chatIsConnected()}
        onClick={() => connect(eventSlugRef.current.value)}>
        Update Event Slug
      </button>
      <br />
      <input type="text" id="link" name="link" value={viewerLink || ""} readOnly></input>
      <button
        disabled={!viewerLink || !chatIsConnected()}
        onClick={() => navigator.clipboard.writeText(viewerLink)}>
        Copy link
      </button>
      <br />
      <ChessPlayer
        getEnemyMovesRef={getEnemyMovesRef}
        moveEnemyRef={moveEnemyRef}
        onCurrentChanged={onCurrentChanged}
        onGameHistoryChanged={onGameHistoryChanged}
        onFenChanged={onFenChanged} />
    </>
  );
};

export default Streamer;