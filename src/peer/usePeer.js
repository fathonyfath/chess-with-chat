import { useContext, useEffect, useState } from "react";
import PeerContext from "./PeerContext";

const usePeer = (dataObserver) => {
  const {
    peer,
    myPeerIdObservable,
    stateObservable,
    connect,
    send,
    close,
    addDataObserver,
    removeDataObserver
  } = useContext(PeerContext);

  const [myPeerId, setMyPeerId] = useState(myPeerIdObservable.getValue());
  const [state, setState] = useState(stateObservable.getValue());

  useEffect(() => {
    myPeerIdObservable.addObserver(setMyPeerId);
    stateObservable.addObserver(setState);

    return () => {
      myPeerIdObservable.removeObserver(setMyPeerId);
      stateObservable.removeObserver(setState);
    }
  }, [myPeerIdObservable, stateObservable]);

  useEffect(() => {
    addDataObserver(dataObserver);
    return () => removeDataObserver(dataObserver);
  }, [addDataObserver, removeDataObserver, dataObserver]);

  return { peer, myPeerId, state, connect, send, close };
}

export default usePeer;