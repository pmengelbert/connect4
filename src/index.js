import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Slot(props) {
  return (
    <button className="ssh" onClick={props.onClick}>
      <div 
        style={props.style}
        className="slot"
      >
      </div>
    </button>
  );
}

class Board extends React.Component {
  renderSlot(x, y) {
    const slots = this.props.columns[x]
    return (
      <Slot
        style={{backgroundColor: slots[y] || "#b3b3b3"} }
        onClick={() => this.props.onClick(x)}
      />
    );
  }

  renderColumn(i) {
      return (
      <div key={i} className="column">
        <div className="button-holder">
          <button className="pick-slot"
                  onClick={() => this.props.onClick(i)}
          ></button>
        </div>
        {this.renderSlot(i, 5)}
        {this.renderSlot(i, 4)}
        {this.renderSlot(i, 3)}
        {this.renderSlot(i, 2)}
        {this.renderSlot(i, 1)}
        {this.renderSlot(i, 0)}
      </div>
    );
  }

  render() {
    return (
      <div className="column">
        {this.props.columns.map((e, i) => this.renderColumn(i))}
      </div>
    );
  }

}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{ columns: Array(7).fill([]), }],
      mvNumber: 0,
      redToPlay: true,
    };
    this.redColor = "#b93535";
    this.yellowColor = "#ffb42b";
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.mvNumber + 1);
    const current = history[history.length - 1];
    const columns = current.columns.slice(); //swap for next line!
    //const columns = this.state.columns;
    const preslice = columns.slice(0, i);
    const newSlots = columns[i].concat(this.state.redToPlay ? this.redColor + " ": this.yellowColor + " ");
    const postslice = columns.slice(i+1);
    if (this.winner()) return;
    this.setState({
      history: history.concat([{columns: preslice.concat([newSlots]).concat(postslice),}]),
      redToPlay: !this.state.redToPlay,
      mvNumber: history.length,
    });
  }

  checkColumns(rows = null) {
    const history = this.state.history.slice();
    const current = history[history.length - 1];
    let set;
    if (rows) {
      set = this.rows();
      set = set.map((e) => e.map((s) => s == null ? " " : s))
    } else {
      set = current.columns.slice(); 
      //set = this.state.columns.slice();
    }
    const strings = set.map((c) => c.join(""));
    let m;
    for (var i = 0; i < strings.length; i++) {
      let red = this.redColor + " ";
      let yellow = this.yellowColor + " ";
      m = strings[i].match("(" + red.repeat(4) + ")|(" + yellow.repeat(4) + ")");
      if (m) return m[0].split(' ')[0];
    }
    return null
  }

  rows() {
    const history = this.state.history.slice();
    const current = history[history.length - 1];
    const columns = current.columns.slice(); //swap for next line!
    //const columns = this.state.columns.slice();
    var max = 0;
    for (var i = 0; i < columns.length; i++) {
      if (columns[i].length > columns[max].length) { max = i; }
    }
    const rows = columns[max].map((col, i) => columns.map(row => row[i]));
    return rows;
  }


  checkDiagonal(nw = null) {
    const history = this.state.history.slice();
    const current = history[history.length - 1];
    const set = current.columns.slice(); //swap for next line!
    //const set = this.state.columns.slice();
    if (set.map((c) => c.length).reduce((a, b) => Math.max(a, b)) < 4) return false;
    if (nw) set.reverse();

    for (let ybase = 0; ybase < 3; ybase++) {
      for (let xbase = 0; xbase < 5; xbase++) {
        let look = set[xbase][ybase];
        let i;
        for (i = 0; i < 4; i++) {
          if (set[i+xbase] == null || set[i+xbase][i+ybase] == null) break;
          if (set[i+xbase][i+ybase] !== look) break;
        }
        if (i === 4) return look;
      }
    }

      return null;
  }

  winner() {
    return (this.checkColumns("rows") || 
            this.checkColumns() || 
            this.checkDiagonal() ||
            this.checkDiagonal("nw")
   );
  }

  render() {
    const history = this.state.history.slice();
    const current = history[this.state.mvNumber];
    const columns = current.columns.slice();
    const winner = this.winner();
    let status; 
    if (winner) {
      status = (this.state.redToPlay ? "Yellow " : "Red ") + " wins!"
    }
    else {
      status = (this.state.redToPlay ? "Red" : "Yellow") + " to play";
    }
    if (this.state.mvNumber === 0) status += ". Click the slot above a column to play."
    return (
      <div className="game">
      <div className="board-holder">
        <div className="game-board">
          <Board columns={columns} onClick={(i) => this.handleClick(i)}/>
        </div>
      </div>
        <div className="status">
          <div>{status}</div>
        </div>
        <div className="backforth">
          <button 
                className="bfbutton"
                disabled={this.state.mvNumber <= 0 ? true : false}
                onClick={() => this.setState({ 
                    mvNumber: this.state.mvNumber - 1, 
                    redToPlay: ((this.state.mvNumber - 1) % 2 === 0), 
                  })
                }
          >{"< go back"} </button>
          <button 
               className="bfbutton"
               disabled={this.state.mvNumber === (history.length - 1) ? true : false} 
               onClick={() => this.setState({ mvNumber: this.state.mvNumber + 1, })}
          >{"go forth>"}</button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById('root'));
