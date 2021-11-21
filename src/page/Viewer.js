import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import usePeer from "../peer/usePeer";
import ProtocolType from "../protocol/protocol-type";
import RaceChart from "../component/RaceChart";
import { stringToColor } from "../util/util";

const Viewer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const connectTo = searchParams.get('connect_to');
  const [votingState, setVotingState] = useState({
    visible: false,
    data: []
  });

  const dataObserver = useCallback((data) => {
    switch (data.type) {
      case ProtocolType.UpdateSnapshot:
        const { votingState } = data.payload;
        setVotingState(votingState);
        break
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
    </>
  );
};

export default Viewer;