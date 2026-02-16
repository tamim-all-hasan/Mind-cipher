// --- Game State ---
let score = 0;
let clues = 3;
let time = 120;
let timerInterval;

const puzzleDiv = document.getElementById('puzzle');
const answerInput = document.getElementById('answer');
const feedbackDiv = document.getElementById('feedback');
const submitBtn = document.getElementById('submitBtn');
const choicesDiv = document.getElementById('choices');
const scoreSpan = document.getElementById('score');
const cluesSpan = document.getElementById('clues');
const timerSpan = document.getElementById('time');

let currentPuzzle = null;

// --- Timer ---
function startTimer() {
  timerInterval = setInterval(() => {
    time--;
    timerSpan.textContent = time;
    if (time <= 0) {
      clearInterval(timerInterval);
      feedbackDiv.style.color = "#f44336";
      feedbackDiv.textContent = "⏱ Time's up! Game over.";
      disableInput();
    }
  }, 1000);
}

// --- Disable Input ---
function disableInput() {
  answerInput.disabled = true;
  submitBtn.disabled = true;
}

// --- Puzzle Generators ---

// Word Puzzle
function generateWordPuzzle() {
  const words = ["CRATE","LIGHT","ECHO","PIANO","CANDLE","FOOTSTEPS"];
  const word = words[Math.floor(Math.random() * words.length)];
  const scrambled = word.split('').sort(() => 0.5 - Math.random()).join('');
  return {
    type: 'word',
    question: `Unscramble: ${scrambled}`,
    answer: word.toUpperCase(),
    next: generateDecisionPaths()
  };
}

// Number Puzzle
function generateNumberPuzzle() {
  const start = Math.floor(Math.random() * 5) + 1;
  const step = Math.floor(Math.random() * 5) + 2;
  return {
    type: 'number',
    question: `Next in series: ${start}, ${start+step}, ${start+2*step}, ?`,
    answer: (start + 3*step).toString(),
    next: generateDecisionPaths()
  };
}

// Hybrid Puzzle (letter+number+logic)
function generateHybridPuzzle() {
  const letters = ["CRATE","LIGHT","ECHO","PIANO"];
  const word = letters[Math.floor(Math.random() * letters.length)];
  const letterIndex = Math.floor(Math.random() * word.length);
  const letterValue = word.charCodeAt(letterIndex) - 64; // A=1
  const number = Math.floor(Math.random() * 10) + 1;
  const answerValue = letterValue + number;
  return {
    type: 'hybrid',
    question: `Take the ${letterIndex+1}th letter of '${word}' + ${number}. What's the sum (A=1...) ?`,
    answer: answerValue.toString(),
    next: generateDecisionPaths()
  };
}

// Logic Puzzle
function generateLogicPuzzle() {
  const logics = [
    {q:"I speak without a mouth and hear without ears. What am I?", a:"ECHO"},
    {q:"The more you take, the more you leave behind. What am I?", a:"FOOTSTEPS"},
    {q:"I’m tall when I’m young and short when I’m old. What am I?", a:"CANDLE"},
    {q:"I have keys but no locks. What am I?", a:"PIANO"}
  ];
  const chosen = logics[Math.floor(Math.random()*logics.length)];
  return {
    type: 'logic',
    question: chosen.q,
    answer: chosen.a.toUpperCase(),
    next: generateDecisionPaths()
  };
}

// --- Dynamic Decision Paths (random 2 options, possible secret path) ---
function generateDecisionPaths() {
  const options = ["wordPath","numberPath"];
  // 20% chance of secret path
  if(Math.random()<0.2) options.push("secretPath");
  return options;
}

// --- Generate next puzzle based on path ---
function generateNextPuzzle(path) {
  switch(path){
    case "wordPath": return generateWordPuzzle();
    case "numberPath": return generateNumberPuzzle();
    case "logicPath": return generateLogicPuzzle();
    case "hybridPath": return generateHybridPuzzle();
    case "secretPath":
      return {
        type:'hybrid',
        question:"🎁 Secret Path! Solve: First letter of 'MIND' + 5 = ? (A=1...)",
        answer:"18",
        next: [ "wordPath","hybridPath" ]
      };
    default: return generateHybridPuzzle();
  }
}

// --- Load Puzzle ---
function loadPuzzle(puzzle=null){
  if(!puzzle){
    // first puzzle
    puzzle = generateWordPuzzle();
  }
  currentPuzzle = puzzle;
  puzzleDiv.textContent = puzzle.question;
  answerInput.value = '';
  feedbackDiv.textContent = '';
  choicesDiv.innerHTML = '';
  answerInput.disabled = false;
  submitBtn.disabled = false;

  // If puzzle has only one next path, auto-generate
  if(puzzle.next.length===1){
    currentPuzzle.next = [ puzzle.next[0] ];
  }
}

// --- Show Choices ---
function showChoices(nextPaths){
  choicesDiv.innerHTML='';
  nextPaths.forEach(path=>{
    const btn = document.createElement('button');
    btn.className='choiceBtn';
    btn.textContent=path;
    btn.addEventListener('click', ()=>{
      const nextPuzzle = generateNextPuzzle(path);
      loadPuzzle(nextPuzzle);
    });
    choicesDiv.appendChild(btn);
  });
}

// --- Submit Answer ---
submitBtn.addEventListener('click', ()=>{
  const userAnswer = answerInput.value.trim().toUpperCase();
  const puzzle = currentPuzzle;
  
  if(userAnswer === puzzle.answer){
    feedbackDiv.style.color="#4caf50";
    feedbackDiv.textContent="Correct!";
    score+=10;
    scoreSpan.textContent=score;

    if(puzzle.next && puzzle.next.length>0){
      showChoices(puzzle.next);
      disableInput();
    } else {
      feedbackDiv.textContent=`🎉 Puzzle solved! Score: ${score}`;
      disableInput();
      clearInterval(timerInterval);
    }
  } else {
    feedbackDiv.style.color="#f44336";
    feedbackDiv.textContent="Wrong! -5s penalty";
    time-=5;
    if(clues>0){
      feedbackDiv.textContent+=` | Type "clue" to get a hint (${clues} left)`;
      answerInput.addEventListener('keydown',(e)=>{
        if(e.key==='Enter' && answerInput.value.toLowerCase()==='clue'){
          clues--;
          cluesSpan.textContent=clues;
          feedbackDiv.textContent=`Clue: First letter is ${puzzle.answer[0]}`;
        }
      });
    }
  }
});

// --- Initialize ---
startTimer();
loadPuzzle();
