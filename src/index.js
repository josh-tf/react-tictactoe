import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import { throwStatement } from "@babel/types";

function Square(props) {
  const className =
    "square" +
    (props.highlight ? " highlight" : "") +
    (" player-" + props.player);
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winLine;
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={winLine && winLine.includes(i)}
        player={this.props.squares[i]}
      />
    );
  }

  render() {
    const gridSize = 3;
    let squares = [];

    for (let i = 0; i < gridSize; i++) {
      let row = [];

      for (let c = 0; c < gridSize; c++) {
        row.push(this.renderSquare(i * gridSize + c));
      }
      squares.push(
        <div key={i} class-name="board-row">
          {row}
        </div>
      );
    }

    return <div>{squares}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      isAscending: true,
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? "X" : "O";

    this.setState({
      history: history.concat([
        {
          squares: squares,
          lastMoved: i,
          lastPlayer: this.state.xIsNext ? "X" : "O"
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  handleSortToggle() {
    this.setState({
      isAscending: !this.state.isAscending
    });
  }

  resetGame() {
    this.setState({
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      isAscending: true,
      xIsNext: false
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    const winMeta = calculateWinner(current.squares);
    const winner = winMeta.winner;

    const stepNumber = this.state.stepNumber;
    const isAscending = this.state.isAscending;

    let moveHistory = history.map((step, move) => {
      const lastMoved = step.lastMoved;
      const curPlayer = step.lastPlayer;
      const col = 1 + (lastMoved % 3);
      const row = 1 + Math.floor(lastMoved / 3);
      const desc = move ? "Go to move #" + move : "Go to game start";

      if (move == 0) {
        return (
          <tr>
            <td>{move}</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td key={move}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => this.jumpTo(move)}
              >
                {desc}
              </button>
            </td>
          </tr>
        );
      } else {
        return (
          <tr className={move === stepNumber ? "move-list-item-selected" : ""}>
            <td>{move}</td>
            <td>Player {curPlayer}</td>
            <td>{row}</td>
            <td>{col}</td>
            <td key={move}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => this.jumpTo(move)}
              >
                {desc}
              </button>
            </td>
          </tr>
        );
      }
    });

    if (!isAscending) {
      moveHistory.reverse();
    }

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      if (winMeta.isDraw) {
        status = "Draw";
      } else {
        status = "Next Player: " + (this.state.xIsNext ? "x" : "o");
      }
    }

    return (
      <div className="game">
        <div class="container">
          <div class="row">
            <div class="col-lg-12 text-center">
              <h1 class="mt-5">Tic Tac Toe</h1>
              <p class="lead">
                A <i>toeriffic</i> spin on the <a href="">Intro to React</a> tutorial.
              </p>

              <div class="row">
                <div className="game-board">
                  <div class="status">{status}</div>
                  <Board
                    squares={current.squares}
                    onClick={i => this.handleClick(i)}
                    winLine={winMeta.line}
                  />
                </div>
              </div>

              <div class="row">
                <div className="game-info">
                  <div class="move-history">
                    <h4>
                      Move History&nbsp;
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => this.handleSortToggle()}
                      >
                        {isAscending ? "descending" : "ascending"}
                      </button>
                    </h4>
                    <table class="moveHistory">
                      <tr>
                        <th>Move</th>
                        <th>Player</th>
                        <th>Row</th>
                        <th>Col</th>
                        <th>Jump</th>
                      </tr>
                      {moveHistory}
                    </table>
                    <br />

                    <button
                        className="btn btn-danger btn"
                        onClick={() => this.resetGame()}
                      >
                        Reset Game
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// helper functions
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: lines[i]
      };
    }
  }

  let isDraw = true;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      isDraw = false;
      break;
    }
  }

  return {
    winner: null,
    line: null,
    isDraw: isDraw
  };
}

ReactDOM.render(<Game />, document.getElementById("root"));
