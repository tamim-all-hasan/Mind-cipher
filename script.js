// --- Game State ---
let score, clues, time, timerInterval, currentPuzzle;

// --- DOM ---
const puzzleDiv = document.getElementById('puzzle');
const answerInput = document.getElementById('answer');
const feedbackDiv = document.getElementById('feedback');
const submitBtn = document.getElementById('submitBtn');
const choicesDiv = document.getElementById('choices');
const scoreSpan = document.getElementById('score');
const cluesSpan = document.getElementById('clues');
const timerSpan = document.getElementById('time');

// --- Reset Game ---
function resetGame(){
  score = 0;
  clues = 3;
  time = 120;
  scoreSpan.textContent = score;
  cluesSpan.textContent = clues;
  timerSpan.textContent = time;
  feedbackDiv.textContent = '';
  choicesDiv.innerHTML = '';
  answerInput.disabled = false;
  submitBtn.disabled = false;
  clearInterval(timerInterval);
  startTimer();
  loadPuzzle();
}

// --- Timer ---
function startTimer(){
  timerInterval = setInterval(()=>{
    time--;
    timerSpan.textContent = time;
    if(time <= 0){
      gameOver("⏱ Time's up!");
    }
  },1000);
}

// --- Game Over ---
function gameOver(message){
  clearInterval(timerInterval);
  disableInput();

  // Auto show correct answer
  if(currentPuzzle){
    feedbackDiv.innerHTML = `
      ${message}<br>
      ✅ Correct Answer: <strong>${currentPuzzle.answer}</strong>
      <br><br>
    `;
  }

  // Play Again button
  const restartBtn = document.createElement('button');
  restartBtn.textContent = "Play Again";
  restartBtn.className = "choiceBtn";
  restartBtn.onclick = resetGame;
  choicesDiv.innerHTML = '';
  choicesDiv.appendChild(restartBtn);
}

// --- Disable Input ---
function disableInput(){
  answerInput.disabled = true;
  submitBtn.disabled = true;
}

// --- Puzzle Generators ---

function generateWordPuzzle(){
  const words=["CRATE","LIGHT","ECHO","PIANO","CANDLE","FOOTSTEPS"];
  const word=words[Math.floor(Math.random()*words.length)];
  const scrambled=word.split('').sort(()=>0.5-Math.random()).join('');
  return {
    question:`Unscramble: ${scrambled}`,
    answer:word,
    next:generateDecisionPaths()
  };
}

function generateNumberPuzzle(){
  const start=Math.floor(Math.random()*5)+1;
  const step=Math.floor(Math.random()*5)+2;
  return{
    question:`Next: ${start}, ${start+step}, ${start+2*step}, ?`,
    answer:(start+3*step).toString(),
    next:generateDecisionPaths()
  };
}

function generateHybridPuzzle(){
  const words=["CRATE","LIGHT","ECHO","PIANO"];
  const word=words[Math.floor(Math.random()*words.length)];
  const index=Math.floor(Math.random()*word.length);
  const letterValue=word.charCodeAt(index)-64;
  const number=Math.floor(Math.random()*10)+1;
  return{
    question:`Take ${index+1}th letter of '${word}' + ${number} (A=1...)`,
    answer:(letterValue+number).toString(),
    next:generateDecisionPaths()
  };
}

function generateLogicPuzzle(){
  const logics=[
    {q:"I speak without a mouth and hear without ears.",a:"ECHO"},
    {q:"The more you take, the more you leave behind.",a:"FOOTSTEPS"},
    {q:"I’m tall when young, short when old.",a:"CANDLE"},
    {q:"I have keys but no locks.",a:"PIANO"}
  ];
  const chosen=logics[Math.floor(Math.random()*logics.length)];
  return{
    question:chosen.q,
    answer:chosen.a,
    next:generateDecisionPaths()
  };
}

function generateDecisionPaths(){
  const paths=["word","number","hybrid"];
  if(Math.random()<0.2) paths.push("secret");
  return paths.slice(0,2);
}

function generateNextPuzzle(type){
  if(type==="word") return generateWordPuzzle();
  if(type==="number") return generateNumberPuzzle();
  if(type==="hybrid") return generateHybridPuzzle();
  if(type==="secret"){
    return{
      question:"🎁 Secret! First letter of 'MIND' + 5 (A=1...)",
      answer:"18",
      next:["hybrid"]
    };
  }
}

// --- Load Puzzle ---
function loadPuzzle(puzzle=null){
  if(!puzzle){
    puzzle=generateWordPuzzle();
  }
  currentPuzzle=puzzle;
  puzzleDiv.textContent=puzzle.question;
  answerInput.value='';
  feedbackDiv.textContent='';
  choicesDiv.innerHTML='';
}

// --- Show Choices ---
function showChoices(paths){
  disableInput();
  choicesDiv.innerHTML='';
  paths.forEach(path=>{
    const btn=document.createElement('button');
    btn.textContent=path;
    btn.className='choiceBtn';
    btn.onclick=()=>{
      loadPuzzle(generateNextPuzzle(path));
      answerInput.disabled=false;
      submitBtn.disabled=false;
    };
    choicesDiv.appendChild(btn);
  });
}

// --- Submit ---
submitBtn.addEventListener('click',()=>{
  const userAnswer=answerInput.value.trim().toUpperCase();

  if(userAnswer===currentPuzzle.answer){
    feedbackDiv.style.color="#4caf50";
    feedbackDiv.textContent="Correct!";
    score+=10;
    scoreSpan.textContent=score;
    showChoices(currentPuzzle.next);
  }else{
    feedbackDiv.style.color="#f44336";
    feedbackDiv.textContent="Wrong! -5s";
    time-=5;
    if(time<=0){
      gameOver("💀 Time penalty ended the game!");
    }
  }
});

// --- Start ---
resetGame();
