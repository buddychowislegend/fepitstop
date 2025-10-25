const quizQuestions = [
  // JavaScript Fundamentals
  {
    id: "1",
    question: "What does `null == undefined` return?",
    options: ["true", "false", "TypeError", "undefined"],
    correct: 0,
    category: "JavaScript Basics",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "2",
    question: "What is the result of `typeof NaN`?",
    options: ["'NaN'", "'number'", "'undefined'", "'object'"],
    correct: 1,
    category: "JavaScript Basics",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "3",
    question: "What does the `===` operator check?",
    options: ["Value only", "Type only", "Both value and type", "Reference"],
    correct: 2,
    category: "JavaScript Basics",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "4",
    question: "Which method adds elements to the end of an array?",
    options: ["shift()", "unshift()", "push()", "pop()"],
    correct: 2,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "5",
    question: "What is the output? `console.log(typeof typeof 1)`",
    options: ["'number'", "'string'", "'object'", "'undefined'"],
    correct: 1,
    category: "JavaScript Basics",
    difficulty: "Medium",
    profile: 'frontend'
  },
  
  // Code Snippet Questions
  {
    id: "6",
    question: "What is the output?\n```js\nconsole.log(1 + '2' + 3);\n```",
    options: ["'123'", "6", "'15'", "NaN"],
    correct: 0,
    category: "Type Coercion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "7",
    question: "What is the output?\n```js\nconsole.log([1, 2, 3] + [4, 5, 6]);\n```",
    options: ["[1,2,3,4,5,6]", "'1,2,34,5,6'", "'1,2,3,4,5,6'", "Error"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "8",
    question: "What is the output?\n```js\nlet a = [1, 2, 3];\nlet b = a;\nb.push(4);\nconsole.log(a);\n```",
    options: ["[1, 2, 3]", "[1, 2, 3, 4]", "undefined", "Error"],
    correct: 1,
    category: "References",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "9",
    question: "What is the output?\n```js\nconsole.log(0.1 + 0.2 === 0.3);\n```",
    options: ["true", "false", "undefined", "NaN"],
    correct: 1,
    category: "Numbers",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "10",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nObject.freeze(obj);\nobj.a = 2;\nconsole.log(obj.a);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 0,
    category: "Objects",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "11",
    question: "What is the output?\n```js\nconsole.log([] == ![]);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 0,
    category: "Type Coercion",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "12",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\narr[10] = 99;\nconsole.log(arr.length);\n```",
    options: ["3", "4", "10", "11"],
    correct: 3,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "13",
    question: "What is the output?\n```js\nfunction test() {\n  console.log(a);\n  var a = 1;\n}\ntest();\n```",
    options: ["1", "undefined", "ReferenceError", "null"],
    correct: 1,
    category: "Hoisting",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "14",
    question: "What is the output?\n```js\nconst obj = { a: 1, b: 2, a: 3 };\nconsole.log(obj.a);\n```",
    options: ["1", "2", "3", "Error"],
    correct: 2,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "15",
    question: "What is the output?\n```js\nconsole.log(+'10' + +'20');\n```",
    options: ["'1020'", "30", "'30'", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "16",
    question: "What is the output?\n```js\nlet x = 1;\nfunction test() {\n  console.log(x);\n  let x = 2;\n}\ntest();\n```",
    options: ["1", "2", "undefined", "ReferenceError"],
    correct: 3,
    category: "Hoisting",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "17",
    question: "What is the output?\n```js\nconsole.log([...'hello']);\n```",
    options: ["'hello'", "['hello']", "['h','e','l','l','o']", "Error"],
    correct: 2,
    category: "Spread Operator",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "18",
    question: "What is the output?\n```js\nconst obj = { x: 1 };\nconst arr = [obj, obj];\narr[0].x = 2;\nconsole.log(arr[1].x);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 1,
    category: "References",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "19",
    question: "What is the output?\n```js\nconsole.log(1 < 2 < 3);\nconsole.log(3 > 2 > 1);\n```",
    options: ["true, true", "true, false", "false, true", "false, false"],
    correct: 1,
    category: "Comparisons",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "20",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\ndelete arr[1];\nconsole.log(arr.length);\n```",
    options: ["2", "3", "undefined", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "21",
    question: "What is the output?\n```js\nconst a = {};\nconst b = { key: 'b' };\na[b] = 123;\nconsole.log(a['[object Object]']);\n```",
    options: ["undefined", "123", "'[object Object]'", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "22",
    question: "What is the output?\n```js\nconsole.log(!!null);\n```",
    options: ["true", "false", "null", "undefined"],
    correct: 1,
    category: "Boolean Conversion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "23",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3].map(num => {\n  if (typeof num === 'number') return;\n  return num * 2;\n});\nconsole.log(arr);\n```",
    options: ["[2, 4, 6]", "[undefined, undefined, undefined]", "[]", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "24",
    question: "What is the output?\n```js\nconst person = { name: 'John' };\nObject.seal(person);\nperson.age = 30;\nconsole.log(person.age);\n```",
    options: ["30", "undefined", "null", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "25",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3, 4, 5];\narr.length = 2;\nconsole.log(arr);\n```",
    options: ["[1, 2, 3, 4, 5]", "[1, 2]", "[3, 4, 5]", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "26",
    question: "What is the output?\n```js\nconst x = 1;\n(() => {\n  x = 2;\n  console.log(x);\n})();\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 3,
    category: "Scope",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "27",
    question: "What is the output?\n```js\nconsole.log(3 + 4 + '5');\n```",
    options: ["'345'", "'75'", "12", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "28",
    question: "What is the output?\n```js\nconst obj = { a: 1, b: 2 };\nconst { a, ...rest } = obj;\nconsole.log(rest);\n```",
    options: ["{ a: 1, b: 2 }", "{ b: 2 }", "{ a: 1 }", "Error"],
    correct: 1,
    category: "Destructuring",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "29",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst [a, , c] = arr;\nconsole.log(c);\n```",
    options: ["1", "2", "3", "undefined"],
    correct: 2,
    category: "Destructuring",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "30",
    question: "What is the output?\n```js\nconst func = () => arguments;\nconsole.log(func(1, 2, 3));\n```",
    options: ["[1, 2, 3]", "{ 0: 1, 1: 2, 2: 3 }", "undefined", "ReferenceError"],
    correct: 3,
    category: "Arrow Functions",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "31",
    question: "What is the output?\n```js\nconst num = 123;\nconsole.log(num.toString(2));\n```",
    options: ["'123'", "'1111011'", "123", "Error"],
    correct: 1,
    category: "Numbers",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "32",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\narr.forEach((num, i) => {\n  arr[i] = num * 2;\n});\nconsole.log(arr);\n```",
    options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 2, 3, 2, 4, 6]", "Infinite loop"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "33",
    question: "What is the output?\n```js\nconst promise = new Promise((resolve) => {\n  console.log(1);\n  resolve(2);\n});\npromise.then(console.log);\nconsole.log(3);\n```",
    options: ["1, 2, 3", "1, 3, 2", "3, 1, 2", "2, 1, 3"],
    correct: 1,
    category: "Promises",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "34",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst result = arr.map(x => x * 2).filter(x => x > 3);\nconsole.log(result);\n```",
    options: ["[2, 4, 6]", "[4, 6]", "[2, 3]", "[1, 2, 3]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "35",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconst copy = obj;\ncopy.a = 2;\nconsole.log(obj.a);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 1,
    category: "References",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "36",
    question: "What is the output?\n```js\nconst str = 'hello';\nstr[0] = 'H';\nconsole.log(str);\n```",
    options: ["'Hello'", "'hello'", "Error", "undefined"],
    correct: 1,
    category: "Strings",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "37",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.slice(1, 2));\n```",
    options: ["[1]", "[2]", "[1, 2]", "[2, 3]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "38",
    question: "What is the output?\n```js\nconst x = 10;\nfunction test() {\n  console.log(x);\n  const x = 20;\n}\ntest();\n```",
    options: ["10", "20", "undefined", "ReferenceError"],
    correct: 3,
    category: "Hoisting",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "39",
    question: "What is the output?\n```js\nconsole.log([...[1, 2], ...[3, 4]]);\n```",
    options: ["[[1, 2], [3, 4]]", "[1, 2, 3, 4]", "Error", "undefined"],
    correct: 1,
    category: "Spread Operator",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "40",
    question: "What is the output?\n```js\nconst obj = { x: 1, y: 2 };\nconst { x: a, y: b } = obj;\nconsole.log(a, b);\n```",
    options: ["undefined undefined", "x y", "1 2", "Error"],
    correct: 2,
    category: "Destructuring",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "41",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3, 4, 5];\nconsole.log(arr.splice(2, 1));\n```",
    options: ["[1, 2]", "[3]", "[4, 5]", "[1, 2, 4, 5]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "42",
    question: "What is the output?\n```js\nconst x = { a: 1 };\nconst y = { a: 1 };\nconsole.log(x == y);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "43",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.includes(2));\n```",
    options: ["true", "false", "1", "undefined"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "44",
    question: "What is the output?\n```js\nconst func = (a, b = a) => a + b;\nconsole.log(func(5));\n```",
    options: ["5", "10", "NaN", "Error"],
    correct: 1,
    category: "Functions",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "45",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\narr.length = 0;\nconsole.log(arr);\n```",
    options: ["[1, 2, 3]", "[]", "[0]", "undefined"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "46",
    question: "What is the output?\n```js\nconsole.log(typeof null);\n```",
    options: ["'null'", "'object'", "'undefined'", "'number'"],
    correct: 1,
    category: "JavaScript Basics",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "47",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst newArr = arr.reverse();\nconsole.log(arr === newArr);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "48",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\ndelete obj.a;\nconsole.log(obj.a);\n```",
    options: ["1", "null", "undefined", "Error"],
    correct: 2,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "49",
    question: "What is the output?\n```js\nconsole.log(parseInt('10', 2));\n```",
    options: ["10", "2", "5", "Error"],
    correct: 1,
    category: "Numbers",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "50",
    question: "What is the output?\n```js\nconst x = [1, 2, 3];\nconst y = x;\ny = [4, 5, 6];\nconsole.log(x);\n```",
    options: ["[1, 2, 3]", "[4, 5, 6]", "Error", "undefined"],
    correct: 2,
    category: "References",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "51",
    question: "What is the output?\n```js\nconsole.log('5' - 3);\n```",
    options: ["'53'", "2", "'2'", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "52",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.find(x => x > 1));\n```",
    options: ["[2, 3]", "2", "true", "undefined"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "53",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconst arr = [obj];\narr[0].a = 2;\nconsole.log(obj.a);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 1,
    category: "References",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "54",
    question: "What is the output?\n```js\nconsole.log([] + []);\n```",
    options: ["[]", "''", "'[][]'", "Error"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "55",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.indexOf(2));\n```",
    options: ["0", "1", "2", "-1"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "56",
    question: "What is the output?\n```js\nconst x = 5;\nconst y = x++;\nconsole.log(x, y);\n```",
    options: ["5 5", "6 5", "5 6", "6 6"],
    correct: 1,
    category: "Operators",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "57",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.some(x => x > 2));\n```",
    options: ["true", "false", "[3]", "3"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "58",
    question: "What is the output?\n```js\nconst obj = { a: 1, b: 2 };\nfor (let key in obj) {\n  console.log(key);\n}\n```",
    options: ["1 2", "a b", "'a' 'b'", "undefined"],
    correct: 1,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "59",
    question: "What is the output?\n```js\nconsole.log(Math.max());\n```",
    options: ["0", "undefined", "-Infinity", "Infinity"],
    correct: 2,
    category: "Math",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "60",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.every(x => x > 0));\n```",
    options: ["true", "false", "[1, 2, 3]", "undefined"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "61",
    question: "What is the output?\n```js\nconst str = 'hello';\nconsole.log(str.repeat(2));\n```",
    options: ["'hello'", "'hellohello'", "'hheelllloo'", "Error"],
    correct: 1,
    category: "Strings",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "62",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3, 2, 1];\nconsole.log([...new Set(arr)]);\n```",
    options: ["[1, 2, 3, 2, 1]", "[1, 2, 3]", "[1, 2]", "Error"],
    correct: 1,
    category: "Sets",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "63",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconst copy = { ...obj };\ncopy.a = 2;\nconsole.log(obj.a);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 0,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "64",
    question: "What is the output?\n```js\nconsole.log(!'');\n```",
    options: ["true", "false", "''", "undefined"],
    correct: 0,
    category: "Boolean Conversion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "65",
    question: "What is the output?\n```js\nconst arr = [1, [2, [3]]];\nconsole.log(arr.flat());\n```",
    options: ["[1, 2, 3]", "[1, [2, [3]]]", "[1, 2, [3]]", "Error"],
    correct: 2,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "66",
    question: "What is the output?\n```js\nconst x = 1;\nconst y = '1';\nconsole.log(x == y && x === y);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 1,
    category: "Comparisons",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "67",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.join('-'));\n```",
    options: ["'1-2-3'", "'123'", "[1-2-3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "68",
    question: "What is the output?\n```js\nconst obj = { a: { b: 1 } };\nconst copy = { ...obj };\ncopy.a.b = 2;\nconsole.log(obj.a.b);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "69",
    question: "What is the output?\n```js\nconsole.log(true + false);\n```",
    options: ["'truefalse'", "1", "0", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "70",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.reduce((a, b) => a + b, 0));\n```",
    options: ["0", "6", "[1, 2, 3]", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "71",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nObject.preventExtensions(obj);\nobj.b = 2;\nconsole.log(obj.b);\n```",
    options: ["2", "undefined", "null", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "72",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.at(-1));\n```",
    options: ["1", "2", "3", "undefined"],
    correct: 2,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "73",
    question: "What is the output?\n```js\nconst x = 10;\nconst y = x.toString();\nconsole.log(typeof y);\n```",
    options: ["'number'", "'string'", "'object'", "'undefined'"],
    correct: 1,
    category: "Type Conversion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "74",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst [, b] = arr;\nconsole.log(b);\n```",
    options: ["1", "2", "3", "undefined"],
    correct: 1,
    category: "Destructuring",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "75",
    question: "What is the output?\n```js\nconsole.log([] == false);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 0,
    category: "Type Coercion",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "76",
    question: "What is the output?\n```js\nconst func = function test() {};\nconsole.log(typeof test);\n```",
    options: ["'function'", "'undefined'", "'object'", "ReferenceError"],
    correct: 1,
    category: "Functions",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "77",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.fill(0, 1, 2));\n```",
    options: ["[0, 0, 0]", "[1, 0, 3]", "[0, 2, 3]", "[1, 2, 0]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "78",
    question: "What is the output?\n```js\nconst x = { a: 1 };\nconst y = Object.create(x);\nconsole.log(y.a);\n```",
    options: ["undefined", "1", "null", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "79",
    question: "What is the output?\n```js\nconsole.log('5' * '2');\n```",
    options: ["'52'", "10", "'10'", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "80",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.concat([4, 5]));\n```",
    options: ["[1, 2, 3, 4, 5]", "[[1,2,3],[4,5]]", "[1, 2, 3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "81",
    question: "What is the output?\n```js\nconst x = 1;\nconst y = 2;\nconsole.log(`${x}${y}`);\n```",
    options: ["3", "'12'", "12", "Error"],
    correct: 1,
    category: "Template Literals",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "82",
    question: "What is the output?\n```js\nconst obj = { a: 1, b: 2 };\nconsole.log(Object.keys(obj));\n```",
    options: ["[1, 2]", "['a', 'b']", "{ a: 1, b: 2 }", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "83",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.flatMap(x => [x, x * 2]));\n```",
    options: ["[1, 2, 2, 4, 3, 6]", "[[1, 2], [2, 4], [3, 6]]", "[1, 2, 3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "84",
    question: "What is the output?\n```js\nconsole.log(Number(''));\n```",
    options: ["0", "NaN", "undefined", "null"],
    correct: 0,
    category: "Type Conversion",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "85",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst result = arr.filter(() => false);\nconsole.log(result);\n```",
    options: ["[1, 2, 3]", "[]", "false", "undefined"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "86",
    question: "What is the output?\n```js\nconst x = { a: 1 };\nconst y = { b: 2 };\nconst z = { ...x, ...y };\nconsole.log(z);\n```",
    options: ["{ a: 1 }", "{ b: 2 }", "{ a: 1, b: 2 }", "Error"],
    correct: 2,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "87",
    question: "What is the output?\n```js\nconsole.log(Boolean('false'));\n```",
    options: ["true", "false", "'false'", "undefined"],
    correct: 0,
    category: "Boolean Conversion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "88",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.lastIndexOf(2));\n```",
    options: ["0", "1", "2", "-1"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "89",
    question: "What is the output?\n```js\nconst x = null;\nconsole.log(x ?? 'default');\n```",
    options: ["null", "'default'", "undefined", "Error"],
    correct: 1,
    category: "Nullish Coalescing",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "90",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.shift());\n```",
    options: ["1", "[1]", "[2, 3]", "3"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "91",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconsole.log('a' in obj);\n```",
    options: ["true", "false", "1", "undefined"],
    correct: 0,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "92",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\narr.unshift(0);\nconsole.log(arr);\n```",
    options: ["[0, 1, 2, 3]", "[1, 2, 3, 0]", "[1, 2, 3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "93",
    question: "What is the output?\n```js\nconsole.log(10 / 0);\n```",
    options: ["0", "NaN", "Infinity", "Error"],
    correct: 2,
    category: "Numbers",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "94",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.slice(-2));\n```",
    options: ["[1]", "[2, 3]", "[3]", "[-2]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "95",
    question: "What is the output?\n```js\nconst x = 'hello';\nconsole.log(x.charAt(0));\n```",
    options: ["'h'", "0", "'hello'", "undefined"],
    correct: 0,
    category: "Strings",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "96",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.pop());\n```",
    options: ["1", "2", "3", "[1, 2]"],
    correct: 2,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "97",
    question: "What is the output?\n```js\nconsole.log(Object.values({ a: 1, b: 2 }));\n```",
    options: ["['a', 'b']", "[1, 2]", "{ a: 1, b: 2 }", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "98",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.findIndex(x => x > 1));\n```",
    options: ["0", "1", "2", "-1"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "99",
    question: "What is the output?\n```js\nconsole.log(String(123));\n```",
    options: ["123", "'123'", "Error", "undefined"],
    correct: 1,
    category: "Type Conversion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "100",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3, 4, 5];\nconsole.log(arr.slice(1, -1));\n```",
    options: ["[2, 3, 4]", "[1, 2, 3, 4]", "[2, 3, 4, 5]", "[1]"],
    correct: 0,
    category: "Arrays",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "101",
    question: "What is the output?\n```js\nconst x = [1, 2];\nconst y = [3, 4];\nconsole.log([...x, ...y]);\n```",
    options: ["[[1,2],[3,4]]", "[1, 2, 3, 4]", "Error", "undefined"],
    correct: 1,
    category: "Spread Operator",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "102",
    question: "What is the output?\n```js\nconsole.log(parseInt('10px'));\n```",
    options: ["10", "NaN", "'10px'", "Error"],
    correct: 0,
    category: "Numbers",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "103",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconsole.log(obj.hasOwnProperty('a'));\n```",
    options: ["true", "false", "1", "undefined"],
    correct: 0,
    category: "Objects",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "104",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.toString());\n```",
    options: ["'[1,2,3]'", "'1,2,3'", "[1, 2, 3]", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "105",
    question: "What is the output?\n```js\nconsole.log(!!0);\n```",
    options: ["true", "false", "0", "undefined"],
    correct: 1,
    category: "Boolean Conversion",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "106",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.copyWithin(0, 1, 2));\n```",
    options: ["[2, 2, 3]", "[1, 1, 2]", "[1, 2, 3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "107",
    question: "What is the output?\n```js\nconsole.log(Array.isArray([]));\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "108",
    question: "What is the output?\n```js\nconst x = 5;\nconsole.log(x.toFixed(2));\n```",
    options: ["5", "'5.00'", "5.00", "Error"],
    correct: 1,
    category: "Numbers",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "109",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconsole.log(Object.entries(obj));\n```",
    options: ["['a', 1]", "[['a', 1]]", "{ a: 1 }", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "110",
    question: "What is the output?\n```js\nconsole.log('hello'.toUpperCase());\n```",
    options: ["'hello'", "'HELLO'", "'Hello'", "Error"],
    correct: 1,
    category: "Strings",
    difficulty: "Easy",
    profile: 'frontend'
  },
  
  // CSS Questions
  {
    id: "C1",
    question: "Which CSS property controls text size?",
    options: ["font-style", "text-style", "font-size", "text-size"],
    correct: 2,
    category: "CSS",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "C2",
    question: "What does 'display: flex' do?",
    options: ["Makes text flexible", "Creates a flexbox container", "Hides element", "Makes element inline"],
    correct: 1,
    category: "CSS",
    difficulty: "Easy",
    profile: 'frontend'
  },
  {
    id: "C3",
    question: "Which property controls element stacking order?",
    options: ["z-index", "stack-order", "layer", "position"],
    correct: 0,
    category: "CSS",
    difficulty: "Easy",
    profile: 'frontend'
  },
  
  // Riddles
  {
    id: "R1",
    question: "Bridge and torch: 1,2,7,10 min to cross; one torch; two max per trip; slowest sets pace. Minimum total time?",
    options: ["17 minutes", "19 minutes", "21 minutes", "23 minutes"],
    correct: 0,
    category: "Logic Puzzles",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "R2",
    question: "You see a boat filled with people, yet there isn't a single person on board. How?",
    options: ["They are invisible", "They are all married", "It's a ghost ship", "It's a painting"],
    correct: 1,
    category: "Logic Puzzles",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "R3",
    question: "A farmer needs to carry a wolf, a goat, and a cabbage across a river with a boat that holds one item at a time. He can't leave the wolf with the goat or the goat with the cabbage. Minimum number of crossings?",
    options: ["7 crossings", "9 crossings", "11 crossings", "13 crossings"],
    correct: 0,
    category: "Logic Puzzles",
    difficulty: "Hard",
    profile: 'frontend'
  },
  {
    id: "R4",
    question: "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?",
    options: ["Echo", "Whistle", "Shadow", "Thought"],
    correct: 0,
    category: "Logic Puzzles",
    difficulty: "Medium",
    profile: 'frontend'
  },
  {
    id: "R5",
    question: "What gets wetter the more it dries?",
    options: ["Sponge", "Towel", "Sun", "Cloud"],
    correct: 1,
    category: "Logic Puzzles",
    difficulty: "Easy",
    profile: 'frontend'
  },
  

  // ============ BACKEND (Java, Spring Boot) QUESTIONS ============
  {
    id: "B1",
    question: "What is the difference between == and equals() in Java?",
    options: ["No difference", "== compares references, equals() compares values", "== compares values, equals() compares references", "Both are identical"],
    correct: 1,
    category: "Java Basics",
    difficulty: "Medium",
    profile: "backend"
  },
  {
    id: "B2",
    question: "What does @Autowired annotation do in Spring?",
    options: ["Creates a bean manually", "Injects dependencies automatically", "Marks a class as a service", "Defines a database transaction"],
    correct: 1,
    category: "Spring Boot",
    difficulty: "Easy",
    profile: "backend"
  },
  {
    id: "B3",
    question: "What is a microservice architecture?",
    options: ["A monolithic application", "Breaking an app into small, independent services", "A single large service", "Only for large companies"],
    correct: 1,
    category: "Microservices",
    difficulty: "Easy",
    profile: "backend"
  },
  {
    id: "B4",
    question: "What is the difference between ArrayList and LinkedList in Java?",
    options: ["No difference", "ArrayList uses arrays, LinkedList uses linked nodes", "LinkedList is faster", "ArrayList can only store strings"],
    correct: 1,
    category: "Data Structures",
    difficulty: "Medium",
    profile: "backend"
  },
  {
    id: "B5",
    question: "What does REST stand for?",
    options: ["Rapid Execution Service Token", "Representational State Transfer", "Remote Exchange Service Terminal", "Resource Entry Service Tier"],
    correct: 1,
    category: "API Design",
    difficulty: "Easy",
    profile: "backend"
  },
  {
    id: "B6",
    question: "What is a transaction in databases?",
    options: ["A payment", "A sequence of operations treated as a single unit", "A data backup", "A query result"],
    correct: 1,
    category: "Database",
    difficulty: "Medium",
    profile: "backend"
  },
  {
    id: "B7",
    question: "What is the purpose of Spring Data JPA?",
    options: ["UI framework", "Simplifies database access through repositories", "API gateway", "Load balancing"],
    correct: 1,
    category: "Spring Boot",
    difficulty: "Easy",
    profile: "backend"
  },
  {
    id: "B8",
    question: "What is the difference between checked and unchecked exceptions in Java?",
    options: ["No difference", "Checked must be declared/handled, unchecked don't need to be", "Checked are for bugs, unchecked are for errors", "They're the same"],
    correct: 1,
    category: "Exception Handling",
    difficulty: "Medium",
    profile: "backend"
  },
  {
    id: "B9",
    question: "What does ACID stand for in database transactions?",
    options: ["Automatic Coding In Database", "Atomicity, Consistency, Isolation, Durability", "Application Control & Isolation Data", "None of the above"],
    correct: 1,
    category: "Database",
    difficulty: "Hard",
    profile: "backend"
  },
  {
    id: "B10",
    question: "What is dependency injection?",
    options: ["Adding more features", "Providing objects their dependencies instead of creating them", "Reducing dependencies", "A design anti-pattern"],
    correct: 1,
    category: "Design Patterns",
    difficulty: "Medium",
    profile: "backend"
  },
  {
    id: "P1",
    question: "What does 'product-market fit' mean?",
    options: ["Product matches company size", "Product satisfies strong market demand", "Product has good marketing", "Product is profitable"],
    correct: 1,
    category: "Product Strategy",
    difficulty: "Easy",
    profile: "product"
  },
  {
    id: "P2",
    question: "What is a KPI?",
    options: ["A type of software", "Key Performance Indicator", "A project management tool", "A pricing model"],
    correct: 1,
    category: "Metrics",
    difficulty: "Easy",
    profile: "product"
  },
  {
    id: "P3",
    question: "What is the purpose of a PRD (Product Requirements Document)?",
    options: ["To define the product vision and requirements", "To replace the CEO", "To be a legal document", "None of the above"],
    correct: 0,
    category: "Documentation",
    difficulty: "Easy",
    profile: "product"
  },
  {
    id: "P4",
    question: "What is user segmentation?",
    options: ["Splitting the code", "Dividing users into groups based on characteristics", "Removing inactive users", "Ranking users by activity"],
    correct: 1,
    category: "User Research",
    difficulty: "Medium",
    profile: "product"
  },
  {
    id: "P5",
    question: "What does DAU stand for?",
    options: ["Data Analysis Unit", "Daily Active Users", "Design Architecture Update", "Data Access URL"],
    correct: 1,
    category: "Metrics",
    difficulty: "Easy",
    profile: "product"
  },
  {
    id: "P6",
    question: "What is a feature roadmap?",
    options: ["A physical map", "A timeline of planned features to be released", "A bug list", "User feedback"],
    correct: 1,
    category: "Planning",
    difficulty: "Easy",
    profile: "product"
  },
  {
    id: "P7",
    question: "What is cohort analysis?",
    options: ["Team meeting format", "Analyzing groups of users with shared characteristics over time", "Revenue analysis", "Competitor analysis"],
    correct: 1,
    category: "Analytics",
    difficulty: "Hard",
    profile: "product"
  },
  {
    id: "P8",
    question: "What is an MoM (Month-over-Month) growth rate?",
    options: ["Management style", "Change in a metric from one month to the next", "Team size change", "Budget allocation"],
    correct: 1,
    category: "Metrics",
    difficulty: "Medium",
    profile: "product"
  },
  {
    id: "P9",
    question: "What is a product pivot?",
    options: ["Turning the product physically", "Changing the product strategy based on market feedback", "Hiring new staff", "Increasing price"],
    correct: 1,
    category: "Strategy",
    difficulty: "Medium",
    profile: "product"
  },
  {
    id: "P10",
    question: "What is NPS (Net Promoter Score)?",
    options: ["Net Product Sales", "Measure of customer loyalty and satisfaction", "New Product Strategy", "Number of Project Stakeholders"],
    correct: 1,
    category: "Metrics",
    difficulty: "Medium",
    profile: "product"
  },
  {
    id: "H1",
    question: "What is employer branding?",
    options: ["Company logo design", "How a company is perceived as an employer", "Marketing campaigns", "Social media presence"],
    correct: 1,
    category: "Recruitment",
    difficulty: "Easy",
    profile: "hr"
  },
  {
    id: "H2",
    question: "What is employee retention?",
    options: ["Storing employee data", "Keeping valuable employees in the organization", "Employee training", "Performance reviews"],
    correct: 1,
    category: "Talent Management",
    difficulty: "Easy",
    profile: "hr"
  },
  {
    id: "H3",
    question: "What does 'at-will employment' mean?",
    options: ["Employee can work when they want", "Either party can end employment without cause", "Only for executives", "A European concept"],
    correct: 1,
    category: "Employment Law",
    difficulty: "Medium",
    profile: "hr"
  },
  {
    id: "H4",
    question: "What is an onboarding process?",
    options: ["Shipping products", "Process of integrating new employees", "Training veterans", "Retirement program"],
    correct: 1,
    category: "Talent Management",
    difficulty: "Easy",
    profile: "hr"
  },
  {
    id: "H5",
    question: "What is employee engagement?",
    options: ["Hiring process", "Level of commitment and involvement employees have", "Office parties", "Salary increases"],
    correct: 1,
    category: "Culture",
    difficulty: "Easy",
    profile: "hr"
  },
  {
    id: "H6",
    question: "What is a 360-degree feedback?",
    options: ["Circular office layout", "Feedback from managers, peers, and subordinates", "Monthly reviews", "Customer feedback"],
    correct: 1,
    category: "Performance Management",
    difficulty: "Medium",
    profile: "hr"
  },
  {
    id: "H7",
    question: "What does ATS stand for in recruitment?",
    options: ["Application Training System", "Applicant Tracking System", "Average Test Score", "Automatic Task System"],
    correct: 1,
    category: "Recruitment",
    difficulty: "Easy",
    profile: "hr"
  },
  {
    id: "H8",
    question: "What is succession planning?",
    options: ["Planning company events", "Preparing employees for future leadership roles", "Sales strategy", "Marketing plan"],
    correct: 1,
    category: "Talent Management",
    difficulty: "Medium",
    profile: "hr"
  },
  {
    id: "H9",
    question: "What is organizational culture?",
    options: ["Company art collection", "Shared values, beliefs, and behaviors of an organization", "Office decoration", "Holiday celebrations"],
    correct: 1,
    category: "Culture",
    difficulty: "Medium",
    profile: "hr"
  },
  {
    id: "H10",
    question: "What is employee turnover?",
    options: ["Staff rotation", "Rate at which employees leave a company", "Shift changes", "Promotion"],
    correct: 1,
    category: "Talent Management",
    difficulty: "Easy",
    profile: "hr"
  },
  {
    id: "S1",
    question: "What is a sales pipeline?",
    options: ["Physical pipes for products", "Stages of potential sales from prospect to close", "Marketing funnel", "Distribution channel"],
    correct: 1,
    category: "Sales Strategy",
    difficulty: "Easy",
    profile: "business"
  },
  {
    id: "S2",
    question: "What does CRM stand for?",
    options: ["Customer Relationship Management", "Corporate Revenue Model", "Client Resources Module", "Commercial Retail Management"],
    correct: 0,
    category: "Sales Tools",
    difficulty: "Easy",
    profile: "business"
  },
  {
    id: "S3",
    question: "What is a sales quota?",
    options: ["Company policy", "Target amount a salesperson is expected to sell", "Discount percentage", "Commission rate"],
    correct: 1,
    category: "Sales Metrics",
    difficulty: "Easy",
    profile: "business"
  },
  {
    id: "S4",
    question: "What is B2B sales?",
    options: ["Business to Business", "Business to Bitcoin", "Business to Buyer", "Bulk to Business"],
    correct: 0,
    category: "Sales Models",
    difficulty: "Easy",
    profile: "business"
  },
  {
    id: "S5",
    question: "What is customer acquisition cost (CAC)?",
    options: ["Total company profit", "Average cost to acquire a new customer", "Customer loyalty cost", "Product development cost"],
    correct: 1,
    category: "Business Metrics",
    difficulty: "Medium",
    profile: "business"
  },
  {
    id: "S6",
    question: "What is LTV (Lifetime Value)?",
    options: ["Latest Transaction Value", "Total revenue from a customer over their relationship", "Line Transaction Value", "Loan Transaction Value"],
    correct: 1,
    category: "Business Metrics",
    difficulty: "Medium",
    profile: "business"
  },
  {
    id: "S7",
    question: "What is a channel partner?",
    options: ["TV network", "Organization that sells your products/services", "Sales manager", "Marketing team"],
    correct: 1,
    category: "Partnerships",
    difficulty: "Medium",
    profile: "business"
  },
  {
    id: "S8",
    question: "What is enterprise sales?",
    options: ["Selling computers", "Selling to large organizations with complex needs", "Retail sales", "Online sales"],
    correct: 1,
    category: "Sales Models",
    difficulty: "Medium",
    profile: "business"
  },
  {
    id: "S9",
    question: "What does SLA stand for?",
    options: ["Sales Leadership Agreement", "Service Level Agreement", "Sales Level Analysis", "Strategic Learning Agreement"],
    correct: 1,
    category: "Contracts",
    difficulty: "Medium",
    profile: "business"
  },
  {
    id: "S10",
    question: "What is churn rate?",
    options: ["Product mixing", "Percentage of customers who stop using service", "Sales growth", "Market expansion"],
    correct: 1,
    category: "Business Metrics",
    difficulty: "Medium",
    profile: "business"
  }
];

module.exports = quizQuestions;
