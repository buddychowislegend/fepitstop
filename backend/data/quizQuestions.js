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
];

module.exports = { quizQuestions };

