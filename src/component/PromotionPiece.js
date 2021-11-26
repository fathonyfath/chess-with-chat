const piece = ["Q", "R", "B", "N"];

const PromotionPiece = ({ current, onPromotionHandler, style }) => {
  return (
    <div className="text-center" style={style}>
      {piece.map((e, i) => (
        <img
          className="promotion-piece"
          key={i}
          src={`../images/chesspieces/${current}${e}.png`}
          alt="white piece"
          onClick={() => onPromotionHandler(e)}
        />
      ))}
    </div>
  );
};

export default PromotionPiece;
