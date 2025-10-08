const quizQuestions = [
  {
    id: "1",
    question: "What does `null == undefined` return?",
    options: ["true", "false", "TypeError", "undefined"],
    correct: 0,
  },
  {
    id: "2",
    question: "Which CSS property controls text size?",
    options: ["font-style", "text-style", "font-size", "text-size"],
    correct: 2,
  },
  {
    id: "3",
    question: "What is the result of `typeof NaN`?",
    options: ["'NaN'", "'number'", "'undefined'", "'object'"],
    correct: 1,
  },
  {
    id: "4",
    question: "What does the `===` operator check?",
    options: ["Value only", "Type only", "Both value and type", "Reference"],
    correct: 2,
  },
  {
    id: "5",
    question: "Which method adds elements to the end of an array?",
    options: ["shift()", "unshift()", "push()", "pop()"],
    correct: 2,
  },
  // Riddles
  {
    id: "R1",
    question: "Bridge and torch: 1,2,7,10 min to cross; one torch; two max per trip; slowest sets pace. Minimum total time?",
    options: ["17 minutes", "19 minutes", "21 minutes", "23 minutes"],
    correct: 0,
  },
  {
    id: "R2",
    question: "You see a boat filled with people, yet there isn’t a single person on board. How?",
    options: ["They are invisible", "They are all married", "It's a ghost ship", "It’s a painting"],
    correct: 1,
  },
  {
    id: "R3",
    question: "A farmer needs to carry a wolf, a goat, and a cabbage across a river with a boat that holds one item at a time. He can't leave the wolf with the goat or the goat with the cabbage. Minimum number of crossings?",
    options: ["7 crossings", "9 crossings", "11 crossings", "13 crossings"],
    correct: 0,
  },
  {
    id: "R4",
    question: "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?",
    options: ["Echo", "Whistle", "Shadow", "Thought"],
    correct: 0,
  },
  {
    id: "R5",
    question: "What gets wetter the more it dries?",
    options: ["Sponge", "Towel", "Sun", "Cloud"],
    correct: 1,
  },
];

module.exports = { quizQuestions };

