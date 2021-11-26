import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GoPlayChatState from "../api/goplay-chat-state";
import useGoPlayChat from "../api/useGoPlayChat";
import ChessPlayer from "../component/ChessPlayer";
import usePeer from "../peer/usePeer";
import RaceChart from "../component/RaceChart";
import { updateCountdown, updateFEN, updateHistory, updatePossibleEnemyMoves, updateStatus, updateVotingState } from "../protocol/protocol";
import createVotingState from "../protocol/voting-state";
import { stringToColor } from "../util/util";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const ViewerTime = 10;

const Streamer = () => {
  const eventSlugRef = useRef();

  const { myPeerId, state, send } = usePeer();
  const [viewerLink, setViewerLink] = useState(null);

  const { lastChatMessage, chatState, connect } = useGoPlayChat();

  const [countdown, setCountdown] = useState(null);
  const acceptingChat = useRef(false);

  const [fen, setFen] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  const getEnemyMovesRef = useRef();
  const moveEnemyRef = useRef();
  const gameIsOverRef = useRef();

  const userSetRef = useRef([]);
  const userMoveSelectionRef = useRef({});

  const [votingState, setVotingState] = useState({
    visible: false,
    data: []
  });
  const [gameStatus, setGameStatus] = useState("");

  const [viewerPossibleMove, setViewerPossibleMove] = useState([]);

  const chatIsConnected = () => chatState === GoPlayChatState.Connected;

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
    };

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
    setVotingState(votingState);
    const protocol = updateVotingState(votingState);
    setVotingState(votingState);
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

  const chartData = useMemo(() => {
    return votingState.data.map((item) => {
      return {
        name: item.name,
        color: stringToColor(item.name),
        value: item.value
      };
    });
  }, [votingState]);

  const onCurrentChanged = useCallback((turn) => {
    if (turn === "b" && !gameIsOverRef.current()) {
      const { allMoves } = getEnemyMovesRef.current();
      setCountdown(ViewerTime);
      setViewerPossibleMove(allMoves);
      send(updatePossibleEnemyMoves(allMoves));
      acceptingChat.current = true;
    }
  }, [send]);

  const onStatusChanged = useCallback((status) => {
    setGameStatus(status);
    send(updateStatus(status));
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
    <div className="wrapper">
      <section className="header flex">
        <div className="game-status card">
          <h1>{gameStatus}</h1>
        </div>
        <div className="game-countdown card">
          <h2>Viewer countdown: {countdown}</h2>
        </div>
      </section>
      <section className="content flex">
        <div className="chessboard-container">
          <ChessPlayer
            getEnemyMovesRef={getEnemyMovesRef}
            moveEnemyRef={moveEnemyRef}
            gameIsOverRef={gameIsOverRef}
            onCurrentChanged={onCurrentChanged}
            onStatusChanged={onStatusChanged}
            onGameHistoryChanged={onGameHistoryChanged}
            onFenChanged={onFenChanged}
          />
          <div className="card peer-info">
            <div className="input-group">
              <input
                type="text"
                id="event-slug"
                name="event-slug"
                ref={eventSlugRef}
              ></input>
              <button
                disabled={chatIsConnected()}
                onClick={() => connect(eventSlugRef.current.value)}
              >
                Update Event Slug
              </button>
            </div>
            <div className="input-group">
              <input
                type="text"
                id="link"
                name="link"
                value={viewerLink || ""}
                readOnly
              ></input>
              <button
                disabled={!viewerLink || !chatIsConnected()}
                onClick={() => navigator.clipboard.writeText(viewerLink)}
              >
                Copy link
              </button>
            </div>
            <div className="streamer-info">
              <p>State: {state}</p>
              <p>MyPeerId: {myPeerId}</p>
              <p>ChatState: {chatState}</p>
            </div>
          </div>
        </div>
        <div className="info-container">
          <div className="chart-container card">
            <h1>Moves Graph</h1>
            <RaceChart data={chartData} />
          </div>
          <div className="move-container card">
            <h1>Viewer Possible Moves</h1>
            <div className="flex possible-move">
              {viewerPossibleMove.map((move, i) => {
                return <p key={i}>{move}</p>;
              })}
            </div>
          </div>
          <div className="history-container card">
            <h1>History</h1>
            <div className="flex history-move">
              {gameHistory.map((move, i) => {
                return i % 2 === 0 ? (
                  <span key={i}>
                    {i + 1}. <b>{move.to}</b>
                  </span>
                ) : (
                  <span key={i}>
                    <b>{move.to}</b>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Streamer;