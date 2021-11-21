import { createContext } from "react";
import Peer from "peerjs";
import PeerState from "./peer-state";

class Observable {
  #value = null;
  #observers = [];

  constructor(value) {
    this.#value = value;
  }

  setValue(value) {
    this.#value = value;
    this.#observers.forEach((observer) => observer(this.#value));
  }

  getValue() {
    return this.#value;
  }

  addObserver(observer) {
    if (observer) {
      this.#observers = [...this.#observers, observer];
    }
  }

  removeObserver(observer) {
    if (observer) {
      this.#observers = this.#observers.filter((existing) => existing !== observer);
    }
  }
};

const peer = new Peer();
const myPeerIdObservable = new Observable(null);
const stateObservable = new Observable(PeerState.Idle);
let connection = null;
let dataObservers = [];

peer.on("open", (peerId) => {
  myPeerIdObservable.setValue(peerId);
});

peer.on("connection", (conn) => {
  if (!connection) {
    stateObservable.setValue(PeerState.Connected);
    connection = conn;

    conn.on("data", (data) => {
      dataObservers.forEach((observer) => observer(data))
    });

    conn.on("close", () => {
      connection = null;
      stateObservable.setValue(PeerState.Idle);
    });
  } else {
    conn.close();
  }
});


const connect = (peerId) => {
  if (!connection) {
    const conn = peer.connect(peerId);
    connection = conn;

    conn.on("open", () => {
      stateObservable.setValue(PeerState.Connected);
      conn.on("data", (data) => {
        dataObservers.forEach((observer) => observer(data))
      });
    });

    conn.on("close", () => {
      connection = null;
      stateObservable.setValue(PeerState.Idle);
    });
  }
};

const send = (data) => {
  if (stateObservable.getValue() === PeerState.Connected && connection) {
    connection.send(data);
  }
};

const close = () => {
  if (connection) {
    connection.close();
    stateObservable.setValue(PeerState.Idle);
  }
};

const addDataObserver = (dataObserver) => {
  if (dataObserver) {
    dataObservers = [...dataObservers, dataObserver];
  }
}

const removeDataObserver = (dataObserver) => {
  if (dataObserver) {
    dataObservers = dataObservers.filter((existing) => existing !== dataObserver);
  }
}

const peerObject = {
  peer,
  myPeerIdObservable,
  stateObservable,
  connect,
  send,
  close,
  addDataObserver,
  removeDataObserver
};

const PeerContext = createContext(peerObject);

export default PeerContext;