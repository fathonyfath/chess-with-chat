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
  const [gameHistory, setGameHistory] = useState({});


  const dataObserver = useCallback((data) => {
    switch (data.type) {
      case ProtocolType.UpdateVotingState:
        setVotingState(data.payload);
        break
      case ProtocolType.UpdateFEN:
        setFen(data.payload);
        break;
      case ProtocolType.UpdateHistory:
        setGameHistory(data.payload);
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
    }
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
    <>
      <h1>Viewer</h1>
      <h2>State: {state}</h2>
      <p>MyPeerId: {myPeerId}</p>
      <p>ConnectTo: {connectTo}</p>
      {votingState.visible && <RaceChart data={chartData} />}
      <ChessViewer
        fen={fen}
        gameHistory={gameHistory} />
    </>
  );
};

export default Viewer;