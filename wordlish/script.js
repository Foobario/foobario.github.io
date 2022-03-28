const numTries = 6;
let triesLeft  = numTries;
let nextLetter = 0;
let theAnswer;
let currentGuess = [];
let theDate;
let dayNum;
const startDate = new Date('2021-6-19');
let currentDate = new Date();

const numFromDate = (date, otherDate = startDate) => Math.ceil(Math.abs(new Date(date) - new Date(otherDate)) / (1000 * 60 * 60 * 24)) - 1;

const dateFromNum = (numOfDays, date = startDate) => {
  const daysAgo = new Date(date.getTime());
  daysAgo.setDate(date.getDate() + numOfDays);
  return daysAgo;
}

function setup(num) {
  if (num != null) {
    // a specific date
    dayNum = num;
  }
  else {
    // today's date
    theDate = Date("today");
    dayNum  = numFromDate(theDate);
  }
  theAnswer = WORDLES[dayNum];

  // console.log(theAnswer,dayNum);

  let grid = document.getElementById("grid");
  grid.innerHTML = '';

  for (let i = 0; i < numTries; i++) {
    let row = document.createElement("div");
    row.className = "gridRow";
    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }
    grid.appendChild(row);
  }

  // set wordleDate
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let date = dateFromNum(dayNum);
  document.getElementById("wordleDate").innerHTML = date.toLocaleDateString("en-US", options);

  // call scoreGrid with no arguments to clear colors
  scoreGrid();

  // reset letter
  currentGuess = [];
  nextLetter   = 0;
  triesLeft = numTries;
}

function scoreGrid(letter, color) {
  let ltr = document.getElementsByClassName("ltr");
  if (letter == null && color == null) {
    // clear the keyboard
    for (const elem of ltr) {
      elem.style.backgroundColor = "transparent";
    }
  }
  else {
    for (const elem of ltr) {
      if (elem.textContent.toUpperCase() === letter.toUpperCase()) {
        //retain previous colors
        let oldColor = elem.style.backgroundColor;
        if ((oldColor === 'green') || (oldColor === 'yellow' && color !== 'green')) return;

        // assign new color
        elem.style.backgroundColor = color;
        break;
      }
    }
  }
}

function checkGuess() {
  let row = document.getElementsByClassName("gridRow")[6 - triesLeft];
  let guessString = '';
  let rightGuess = Array.from(theAnswer);

  for (const letr of currentGuess) {
    guessString += letr;
  }

  // don't do anything if there aren't 5 letters
  if (guessString.length != 5) return;

  // if the guess isn't in the game's dictionary, don't accept it
  if (!WORDLES.includes(guessString)) {
    toastr.error("Sorry, your guess is not in the game's dictionary.");
    return;
  }

  // style the letters
  for (let i = 0; i < 5; i++) {
    let ltrColor = '';
    let box = row.children[i];
    let ltr = currentGuess[i];
    let ltrPos = rightGuess.indexOf(currentGuess[i]);

    // if the letter is not in the correct word, style it grey
    if (ltrPos === -1) {
      ltrColor = 'grey';
    }
    else {
      // letter is in the right position, so style it green...
      if (currentGuess[i] === rightGuess[i]) {
        ltrColor = 'green';
      }
      else {
        // otherwise, style it yellow.
        ltrColor = 'yellow';
      }
      // rightGuess[ltrPos] = "#";
    }

    box.style.backgroundColor = ltrColor;
    scoreGrid(ltr, ltrColor);

    let delay = 250 * i;
    setTimeout(() => {
      //flip box
      animateCSS(box, 'flipInX');
      //shade box
      box.style.backgroundColor = ltrColor;
      scoreGrid(ltr, ltrColor);
    }, delay);
  }

  if (guessString === theAnswer) {
    toastr.success("You guessed right! Game over!");
    // getch(theAnswer);
    triesLeft = 0;
    return;
  }
  else {
    triesLeft -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (triesLeft === 0) {
      toastr.error("Sorry, you are out of guesses.");
      toastr.info(`The answer was: "${theAnswer}"`);
    }
  }
}

function insertLetter(theKey) {
  // do nothing if word already has 5 letters
  if (nextLetter === 5) return;

  theKey = theKey.toUpperCase();

  let row = document.getElementsByClassName("gridRow")[6 - triesLeft];
  let box = row.children[nextLetter];
  animateCSS(box, "pulse");
  box.textContent = theKey;
  box.classList.add("filled-box");
  currentGuess.push(theKey);
  nextLetter += 1;
}

function deleteLetter() {
  let row = document.getElementsByClassName("gridRow")[6 - triesLeft];
  let box = row.children[nextLetter - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
}

const animateCSS = (element, animation, prefix = 'animate__') => {
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element;
    node.style.setProperty('--animate-duration', '0.3s');

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {
      once: true
    });
  });
}

document.addEventListener("keyup", (e) => {
  // remove focus from buttons
  document.getElementById("first").blur();
  document.getElementById("prev").blur();
  document.getElementById("today").blur();
  document.getElementById("next").blur();
  document.getElementById("last").blur();
  document.getElementById("random").blur();
  // document.getElementById("cal").blur();

  if (triesLeft === 0) return;

  let theKey = String(e.key);
  if (theKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
    return;
  }

  if (theKey === "Enter") {
    checkGuess();
    return;
  }

  let found = theKey.match(/[a-z]/gi);
  if (!found || found.length > 1) {
    return;
  }
  else {
    insertLetter(theKey.toUpperCase());
  }
})

document.getElementById("kb").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("ltr")) return;

  let key = target.textContent;

  if (key === "Space") return;

  if (key === "Del") key = "Backspace";

  document.dispatchEvent(new KeyboardEvent("keyup", {
    'key': key
  }))

  target.blur();
})

document.getElementById("first").addEventListener("click", (e) => { setup(0) });
document.getElementById("prev").addEventListener("click", (e) => { setup(dayNum - 1) });
document.getElementById("today").addEventListener("click", (e) => { setup(numFromDate(currentDate, startDate)) });
document.getElementById("next").addEventListener("click", (e) => { setup(dayNum + 1) });
document.getElementById("last").addEventListener("click", (e) => { setup(WORDLES.length - 1) });
document.getElementById("random").addEventListener("click", (e) => { setup(Math.floor(Math.random() * 2309)) });

// function setClick(id, val) {
//   document.getElementById(id).addEventListener("click", (e) => {
//     setup(val);
//   });
// }

async function getch(word) {
  try {
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;
    const res  = await fetch(url);
    const data = await res.json();
    const meanings = data[0].meanings[0].definitions;

    let def = word + '\n';
    for (let i = 0; i < meanings.length; i++) {
      def += "  " + (i+1) + ". " + meanings[i].definition;
    }
    alert(def);
    // console.log(meanings)train
    ;
    //displayData(data);
  } catch (error) {
    console.log(error);
  }
}

setup();
