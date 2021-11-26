import { count } from "d3-array";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GoPlayChatState from "../api/goplay-chat-state";
import useGoPlayChat from "../api/useGoPlayChat";
import ChessPlayer from "../component/ChessPlayer";
import useInterval from "../hook/useInterval";
import PeerState from "../peer/peer-state";
import usePeer from "../peer/usePeer";
import { updateCountdown, updateFEN, updateHistory, updatePossibleEnemyMoves, updateVotingState } from "../protocol/protocol";
import createVotingState from "../protocol/voting-state";

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const ViewerTime = 10;

const Streamer = () => {
  const eventSlugRef = useRef();

  const { myPeerId, state, send } = usePeer();
  const [viewerLink, setViewerLink] = useState(null);

  const { lastChatMessage, chatState, connect } = useGoPlayChat();

  const [countdown, setCountdown] = useState(null);
  const acceptingChat = useRef(false);

  const [fen, setFen] = useState(null);
  const [gameHistory, setGameHistory] = useState({});

  const getEnemyMovesRef = useRef();
  const moveEnemyRef = useRef();
  const gameIsOverRef = useRef();

  const userSetRef = useRef([]);
  const userMoveSelectionRef = useRef({});

  const chatIsConnected = () => chatState === GoPlayChatState.Connected

  const countdownOver = () => {
    acceptingChat.current = false;

    const processMove = async (move) => {
      await delay(500);
      moveEnemyRef.current(move);
    };

    const pickRandomMove = () => {
      const { allMoves } = getEnemyMovesRef.current();
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      processMove(randomMove);
    }

    const userSelection = Object.keys(userMoveSelectionRef.current).map((i) => {
      return {
        name: i,
        value: userMoveSelectionRef.current[i]
      };
    });

    if (userSelection.length > 0) {
      userSelection.sort((a, b) => b.value - a.value);
      const highestValue = userSelection[0].value;
      const allHighestValue = userSelection.filter((i) => i.value === highestValue);
      const moveToChoose = allHighestValue[Math.floor(Math.random() * allHighestValue.length)];
      processMove(moveToChoose.name);
    } else {
      pickRandomMove();
    }

    userSetRef.current = [];
    userMoveSelectionRef.current = {};
    sendVotingProtocol();
  }

  const sendVotingProtocol = useCallback(() => {
    const dataToSend = Object.keys(userMoveSelectionRef.current).map((i) => {
      return {
        name: i,
        value: userMoveSelectionRef.current[i]
      };
    });

    let showChart = true;
    if (dataToSend.length === 0) {
      showChart = false;
    }
    const votingState = createVotingState(showChart, dataToSend);
    const protocol = updateVotingState(votingState);
    send(protocol);
  }, [userMoveSelectionRef, send]);

  useEffect(() => {
    send(updateCountdown(countdown));

    if (countdown === 0) {
      countdownOver();
    }

    if (countdown) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, send]);

  useEffect(() => {
    if (acceptingChat.current && lastChatMessage) {
      const { allMoves } = getEnemyMovesRef.current();

      const from = lastChatMessage.frm;
      const message = lastChatMessage.msg;

      if (allMoves.includes(message) && !userSetRef.current.includes(from)) {
        userSetRef.current.push(from);
        const userMoveSelection = userMoveSelectionRef.current;
        const userMoveSelectionCopy = { ...userMoveSelection, [message]: (userMoveSelection[message] || 1) }
        userMoveSelectionRef.current = userMoveSelectionCopy
        sendVotingProtocol();
      }
    }
  }, [lastChatMessage, acceptingChat, userSetRef, userMoveSelectionRef, sendVotingProtocol]);

  const onCurrentChanged = useCallback((turn) => {
    if (turn === "b" && !gameIsOverRef.current()) {
      const { allMoves } = getEnemyMovesRef.current();
      setCountdown(ViewerTime);
      send(updatePossibleEnemyMoves(allMoves));
      acceptingChat.current = true;
    }
  }, [send]);

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
      <p>Countdown: {countdown || "null"}</p>
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
        gameIsOverRef={gameIsOverRef}
        onCurrentChanged={onCurrentChanged}
        onGameHistoryChanged={onGameHistoryChanged}
        onFenChanged={onFenChanged} />
    </>
  );
};

export default Streamer;