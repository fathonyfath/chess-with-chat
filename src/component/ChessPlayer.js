import * as Chess from "chess.js";
import Chessboard from "chessboardjsx";
import { useEffect, useState } from "react";
import PromotionPiece from "./PromotionPiece";

const game = new Chess();

const ChessPlayer = ({
  getEnemyMovesRef,
  moveEnemyRef,
  onCurrentChanged,
  onStatusChanged,
  onFenChanged,
  onGameHistoryChanged,
}) => {
  const [status, setStatus] = useState(null);

  const [fen, setFen] = useState(null);

  const [gameHistory, setGameHistory] = useState([]);
  const [squareStyles, setSquareStyles] = useState({});

  const [orientation,] = useState("white");
  const [current, setCurrent] = useState("w");
  const [historySquare, setHistorySquare] = useState({});

  const [pieceToPromote, setPieceToPromote] = useState({ from: null, to: null });
  const [showPromotePiece, setShowPromotePiece] = useState(false);

  useEffect(() => {
    if (status && onStatusChanged) {
      onStatusChanged(status);
    }
  }, [status, onStatusChanged]);

  useEffect(() => {
    if (fen && onFenChanged) {
      onFenChanged(fen);
    }
  }, [fen, onFenChanged]);

  useEffect(() => {
    if (gameHistory && onGameHistoryChanged) {
      onGameHistoryChanged(gameHistory);
    }
  }, [gameHistory, onGameHistoryChanged]);

  const getEnemyMoves = () => {
    if (game.turn() === orientation.slice(0, 1)) return { allMoves: [], promotionMoves: [] };

    const moves = game.moves({ verbose: true });
    const allMoves = moves.map((it) => it.san);
    const promotionMoves = moves.filter((it) => it.flags === "p" || it.flags === "cp").map((it) => it.san);

    return { allMoves, promotionMoves };
  };

  if (getEnemyMovesRef) {
    getEnemyMovesRef.current = getEnemyMoves;
  }

  const moveEnemy = (san) => {
    if (game.turn() === orientation.slice(0, 1)) return false;
    game.move(san);
    updateStatus();
    return true;
  };

  if (moveEnemyRef) {
    moveEnemyRef.current = moveEnemy;
  }

  const onPromotionHandler = (p) => {
    game.move({
      ...pieceToPromote,
      promotion: p.toLowerCase()
    });

    game.promotionInProgress = false;

    setPieceToPromote({ from: null, to: null });
    setShowPromotePiece(false);
    updateStatus();
  };

  useEffect(() => {
    if (onCurrentChanged) {
      onCurrentChanged(current);
    }
  }, [current, onCurrentChanged]);

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

      setHistorySquare(style);
      setSquareStyles(style);
    }
  }, [gameHistory]);

  const updateStatus = () => {
    let moveColor = "White";
    if (game.turn() === "b") {
      moveColor = "Black";
    }

    if (game.in_checkmate()) {
      setStatus("Game over, " + moveColor + " is in checkmate.");
    } else if (game.in_draw()) {
      setStatus("Game over, drawn position");
    } else {
      if (game.in_check()) {
        setStatus(moveColor + " to move," + moveColor + " is in check");
      } else {
        setStatus(moveColor + " to move");
      }
    }

    setCurrent(game.turn());
    setFen(game.fen());
    setGameHistory(game.history({ verbose: true }));
  };

  const highlightSquareMoves = (squaresToHighlight) => {
    if (game.promotionInProgress) return;

    const style = {};
    squaresToHighlight.forEach((square) => {
      style[square] = {
        background: "radial-gradient(circle, #fffc00 36%, transparent 40%)",
        borderRadius: "50%",
      };
    });
    setSquareStyles({ ...squareStyles, ...style });
  };

  const isItPlayerTurn = () => {
    return game.turn() === orientation.slice(0, 1);
  };

  const onDrop = ({ sourceSquare, targetSquare }) => {
    if (!isItPlayerTurn()) return;
    if (game.game_over()) return "snapback";
    if (game.promotionInProgress) return;

    const from = sourceSquare;
    const to = targetSquare;
    const move = game.move({ from, to });

    const isPromotion = game
      .moves({ verbose: true })
      .filter((move) => move.from === from && move.to === to && move.flags.includes("p"))
      .length > 0;

    if (isPromotion) {
      game.promotionInProgress = true;
      setPieceToPromote({ from, to });
      setShowPromotePiece(true);
      return;
    }

    if (move === null && !isPromotion) return "snapback";

    updateStatus();
  };

  const onMouseOverSquare = (square) => {
    const moves = game.moves({
      square: square,
      verbose: true
    });

    if (moves.length === 0) return;

    const squaresToHighlight = moves.map((it) => it.to);
    highlightSquareMoves(squaresToHighlight);
  };

  const onMouseOutSquare = (square) => {
    setSquareStyles(historySquare);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ position: "relative" }}>
        <Chessboard
          id="standard"
          position={fen || "start"}
          onDrop={onDrop}
          orientation={orientation}
          squareStyles={squareStyles}
          onMouseOverSquare={onMouseOverSquare}
          onMouseOutSquare={onMouseOutSquare}
          showNotation={true}
          draggable={true}
          animate={false}
          resize={true}
        />
        {showPromotePiece && (
          <div style={{
            position: "absolute",
            textAlign: "center",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10
          }}>
            <PromotionPiece
              style={{
                display: "inline-block",
                background: "white"
              }}
              current={current}
              onPromotionHandler={onPromotionHandler} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessPlayer;