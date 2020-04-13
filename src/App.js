import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const colors = {
  available: 'lightgray',
  used: 'lightgreen',
  wrong: 'lightcoral',
  candidate: 'deepskyblue'
};

// Math science
const utils = {
  // Sum an array
  sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr, max) => {
    const sets = [[]];
    const sums = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet);
          sums.push(candidateSum);
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)];
  },
};

const Header = () => {
  return (
    <div className="mb-4">
      <h1>Star Match Game</h1>
    </div>
  );
}

const Text = () => {
  return (
    <p className="text-muted">Pick 1 or more numbers that sum to the number of stars</p>
  );
}

const StarMatch = () => {
	const [gameId, setGameId] = useState(1);
	return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)}/>;
}

const Game = (props) => {
  const [stars, setStars] = useState(utils.random(1, 9));
  const [availableNums, setAvailableNums] = useState(utils.range(1, 9));
  const [candidateNums, setCandidateNums] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(10);

  React.useEffect(() => {
  	if (secondsLeft > 0 && availableNums.length > 0) {
      const timerId = setTimeout(() => {
	      setSecondsLeft(secondsLeft - 1);
      }, 1000);
    	return () => clearTimeout(timerId);
  	}
  });
  const candidatesAreWrong = utils.sum(candidateNums) > stars;
  const gameStatus = availableNums.length === 0 
    ? 'won'
    : secondsLeft === 0 
    ? 'lost' 
    : 'active';
  const resetGame = () => {
    setStars(utils.random(1, 9));
    setAvailableNums(utils.range(1, 9));
    setCandidateNums([]);
  };
  const numberStatus = (number) => {
    if (!availableNums.includes(number)) {
      return 'used';
    }
    if (candidateNums.includes(number)) {
      return candidatesAreWrong ? 'wrong' : 'candidate';
    }
    return 'available';
  };
  const onNumberClick = (number, status) => {
    if (gameStatus !== 'active' || status === 'used') {
      return;
    }
    const newCandidatesNums = 
      status === 'available'
      ? candidateNums.concat(number)
      : candidateNums.filter(cn => cn !== number);
    if (utils.sum(newCandidatesNums) !== stars) {
      setCandidateNums(newCandidatesNums);
    } else {
      const newAvailableNums = availableNums.filter(
        n => !newCandidatesNums.includes(n)
      );
      setCandidateNums([]);
      setAvailableNums(newAvailableNums);
      setStars(utils.randomSumIn(newAvailableNums, 9));
    }
  };

  return (
    <div>
      <div className="row col-lg-6 offset-lg-4">
        <div className="border" style={{width: '40%'}}>
          {gameStatus !== 'active' ? (
          	<PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />
          ) : (
          	<StarsDisplay count={stars} />
          )}
        </div>
        <div className="border" style={{width: '40%'}}>
          {utils.range(1, 9).map(number =>
            <PlayNumber 
              key={number} 
              number={number}
              status={numberStatus(number)}
              onClick={onNumberClick}
            />
          )}
        </div>
      </div>
      <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
}

const PlayNumber = props => (
  <button 
    className="number" 
    style={{background: colors[props.status]}}
    onClick={() => props.onClick(props.number, props.status)}>
    {props.number}
  </button>
);

const StarsDisplay = props => (
  <>
    {utils.range(1, props.count).map(starId => (
      <div key={starId} className="star" />
    ))}
  </>
);

const PlayAgain = props => (
	<div className="game-done">
  	<div 
    	className="message"
      style={{ color: props.gameStatus === 'lost' ? 'red' : 'green'}}
    >
  	  {props.gameStatus === 'lost' ? 'Game Over' : 'Nice'}
  	</div>
	  <button onClick={props.onClick}>Play Again</button>
	</div>
);

function App() {
  return (
    <div className="App">
      <Header />
      <Text />
      <StarMatch />
    </div>
  );
}

export default App;
