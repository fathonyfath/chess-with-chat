import Chessboard from "chessboardjsx";
import { useEffect, useState } from "react";

const ChessViewer = ({ fen, orientation, gameHistory }) => {
  const [squareStyles, setSquareStyles] = useState({});

  useEffect(() => {
    if (gameHistory.length > 0) {
      const moveToHighlight = gameHistory.slice(-2);
      const style = moveToHighlight.reduce((prev, curr) => {
        return {
          ...prev,
          [curr.from]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
          [curr.to]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
        };
      }, {});

      setSquareStyles(style);
    }
  }, [gameHistory]);

  return (
    <Chessboard
      id="standard"
      position={fen || "start"}
      orientation={orientation || "white"}
      squareStyles={squareStyles}
      showNotation={true}
      animate={true}
      resize={true}
    />
  );
};

export default ChessViewer;