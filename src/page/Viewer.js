import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import usePeer from "../peer/usePeer";
import ProtocolType from "../protocol/protocol-type";
import RaceChart from "../component/RaceChart";
import { stringToColor } from "../util/util";
import ChessViewer from "../component/ChessViewer";

const Viewer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const connectTo = searchParams.get('connect_to');
  const [votingState, setVotingState] = useState({
    visible: false,
    data: []
  });

  const [fen, setFen] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  const [countdown, setCountdown] = useState(0);
  const [possibleMove, setPossibleMove] = useState([]);
  const [gameStatus, setGameStatus] = useState("");

  const dataObserver = useCallback((data) => {
    switch (data.type) {
      case ProtocolType.UpdateVotingState:
        setVotingState(data.payload);
        break;
      case ProtocolType.UpdateFEN:
        setFen(data.payload);
        break;
      case ProtocolType.UpdateHistory:
        setGameHistory(data.payload);
        break;
      case ProtocolType.UpdateStatus:
        setGameStatus(data.payload);
        break;
      case ProtocolType.UpdateCountdown:
        setCountdown(data.payload);
        break;
      case ProtocolType.UpdatePossibleEnemyMoves:
        setPossibleMove(data.payload);
        break;
      default:
    };
  }, []);

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
    };
  }, [connectTo, myPeerId, close, connect]);

  const chartData = useMemo(() => {
    return votingState.data.map((item) => {
      return {
        name: item.name,
        color: stringToColor(item.name),
        value: item.value
      };
    });
  }, [votingState]);

  return (
    <div className="wrapper">
      <section className="header flex">
        <div className="game-status card">
          <h1>{gameStatus}</h1>
        </div>
        <div className="game-countdown card">
          <h2>Countdown: {countdown}</h2>
        </div>
      </section>
      <section className="content flex">
        <div className="chessboard-container">
          <ChessViewer fen={fen} gameHistory={gameHistory} />
          <div className="card peer-info">
            <h2>Peer status: {state}</h2>
          </div>
        </div>
        <div className="info-container">
          <div className="chart-container card">
            <h1>Moves Graph</h1>
            <RaceChart data={chartData} />
          </div>
          <div className="move-container card">
            <h1>Possible Moves</h1>
            <div className="flex possible-move">
              {possibleMove.map((move, i) => {
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

export default Viewer;