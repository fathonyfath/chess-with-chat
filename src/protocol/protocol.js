import ProtocolType from "./protocol-type";

const createProtocol = (type, payload) => {
  return { type, payload };
};

const updateSnapshot = ({ votingState }) => {
  return createProtocol(
    ProtocolType.UpdateSnapshot,
    {
      votingState
    }
  );
};

export { updateSnapshot };