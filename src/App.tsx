import { useEffect, useState } from "react";
import "./App.css";
import { Piece as PieceIcon } from "@chessire/pieces";

type Position = [number, number];

interface Piece {
  color: "black" | "white" | "empty";
  position: Position;
  piece: "K" | "Q" | "R" | "B" | "N" | "P";
}

interface BoxProps extends Piece {
  isSelected: boolean;
  isValidMove: boolean;
  onSelect: () => void;
}

function App() {
  const [data, setData] = useState<Piece[] | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const boardResponse = await fetch(
          "http://195.35.22.177:4545/current_board"
        );
        const boardData: Piece[] = await boardResponse.json();
        setData(boardData);

        if (selectedPiece) {
          const movesResponse = await fetch(
            `http://195.35.22.177:4545/get_valid_moves?row=${selectedPiece[0]}&col=${selectedPiece[1]}`
          );
          const movesData: Position[] = await movesResponse.json();
          setValidMoves(movesData);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [selectedPiece]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chessboard">
      <div className="row-labels">
        {[8, 7, 6, 5, 4, 3, 2, 1].map((label) => (
          <div key={label} className="row-label">
            {label}
          </div>
        ))}
      </div>
      <div className="board">
        {data.map((item) => (
          <Box
            key={item.color + item.piece + item.position.join("")}
            {...item}
            isSelected={
              JSON.stringify(item.position) === JSON.stringify(selectedPiece)
            }
            isValidMove={validMoves.some(
              (move) => JSON.stringify(move) === JSON.stringify(item.position)
            )}
            onSelect={() => setSelectedPiece(item.position)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

const Box: React.FC<BoxProps> = ({
  color,
  position,
  piece,
  isSelected,
  isValidMove,
  onSelect,
}) => {
  return (
    <div
      className={`box ${isSelected ? "selected" : ""} ${
        isValidMove ? "valid-move" : ""
      }`}
      style={{
        gridRowStart: 8 - position[0],
        gridColumnStart: position[1] + 1,
      }}
      onClick={onSelect}
    >
      {color !== "empty" && (
        //@ts-ignore
        <PieceIcon color={color} piece={piece} width={64} fillColor={color} />
      )}
    </div>
  );
};
