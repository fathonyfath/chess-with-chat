import ProtocolType from "./protocol-type";

const createProtocol = (type, payload) => {
  return { type, payload };
};

const updateVotingState = (votingState) => {
  return createProtocol(ProtocolType.UpdateVotingState, votingState);
};

const updateFEN = (fen) => {
  return createProtocol(ProtocolType.UpdateFEN, fen);
}

const updateHistory = (history) => {
  return createProtocol(ProtocolType.UpdateHistory, history);
}

const updateStatus = (status) => {
  return createProtocol(ProtocolType.UpdateStatus, status);
}

const updateCountdown = (countdown) => {
  return createProtocol(ProtocolType.UpdateCountdown, countdown);
}

const updatePossibleEnemyMoves = (possibleMoves) => {
  return createProtocol(ProtocolType.UpdatePossibleEnemyMoves, possibleMoves);
}

export { updateVotingState, updateFEN, updateHistory, updateStatus, updateCountdown, updatePossibleEnemyMoves };