import ProtocolType from "./protocol-type";

const createProtocol = (type, payload) => {
  return { type, payload };
};

const updateVotingState = (votingState) => {
  return createProtocol(ProtocolType.UpdateVotingState, votingState);
};

const updateFEN = (FEN) => {
  return createProtocol(ProtocolType.UpdateFEN, FEN);
}

const updateHistory = (history) => {
  return createProtocol(ProtocolType.UpdateHistory, history);
}

export { updateVotingState, updateFEN, updateHistory };