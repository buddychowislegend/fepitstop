const quizQuestions = [
  // JavaScript Fundamentals
  {
    id: "1",
    question: "What does `null == undefined` return?",
    options: ["true", "false", "TypeError", "undefined"],
    correct: 0,
    category: "JavaScript Basics",
    difficulty: "Easy"
  },
  {
    id: "2",
    question: "What is the result of `typeof NaN`?",
    options: ["'NaN'", "'number'", "'undefined'", "'object'"],
    correct: 1,
    category: "JavaScript Basics",
    difficulty: "Easy"
  },
  {
    id: "3",
    question: "What does the `===` operator check?",
    options: ["Value only", "Type only", "Both value and type", "Reference"],
    correct: 2,
    category: "JavaScript Basics",
    difficulty: "Easy"
  },
  {
    id: "4",
    question: "Which method adds elements to the end of an array?",
    options: ["shift()", "unshift()", "push()", "pop()"],
    correct: 2,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "5",
    question: "What is the output? `console.log(typeof typeof 1)`",
    options: ["'number'", "'string'", "'object'", "'undefined'"],
    correct: 1,
    category: "JavaScript Basics",
    difficulty: "Medium"
  },
  
  // Code Snippet Questions
  {
    id: "6",
    question: "What is the output?\n```js\nconsole.log(1 + '2' + 3);\n```",
    options: ["'123'", "6", "'15'", "NaN"],
    correct: 0,
    category: "Type Coercion",
    difficulty: "Easy"
  },
  {
    id: "7",
    question: "What is the output?\n```js\nconsole.log([1, 2, 3] + [4, 5, 6]);\n```",
    options: ["[1,2,3,4,5,6]", "'1,2,34,5,6'", "'1,2,3,4,5,6'", "Error"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Medium"
  },
  {
    id: "8",
    question: "What is the output?\n```js\nlet a = [1, 2, 3];\nlet b = a;\nb.push(4);\nconsole.log(a);\n```",
    options: ["[1, 2, 3]", "[1, 2, 3, 4]", "undefined", "Error"],
    correct: 1,
    category: "References",
    difficulty: "Medium"
  },
  {
    id: "9",
    question: "What is the output?\n```js\nconsole.log(0.1 + 0.2 === 0.3);\n```",
    options: ["true", "false", "undefined", "NaN"],
    correct: 1,
    category: "Numbers",
    difficulty: "Medium"
  },
  {
    id: "10",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nObject.freeze(obj);\nobj.a = 2;\nconsole.log(obj.a);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 0,
    category: "Objects",
    difficulty: "Medium"
  },
  {
    id: "11",
    question: "What is the output?\n```js\nconsole.log([] == ![]);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 0,
    category: "Type Coercion",
    difficulty: "Hard"
  },
  {
    id: "12",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\narr[10] = 99;\nconsole.log(arr.length);\n```",
    options: ["3", "4", "10", "11"],
    correct: 3,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "13",
    question: "What is the output?\n```js\nfunction test() {\n  console.log(a);\n  var a = 1;\n}\ntest();\n```",
    options: ["1", "undefined", "ReferenceError", "null"],
    correct: 1,
    category: "Hoisting",
    difficulty: "Medium"
  },
  {
    id: "14",
    question: "What is the output?\n```js\nconst obj = { a: 1, b: 2, a: 3 };\nconsole.log(obj.a);\n```",
    options: ["1", "2", "3", "Error"],
    correct: 2,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "15",
    question: "What is the output?\n```js\nconsole.log(+'10' + +'20');\n```",
    options: ["'1020'", "30", "'30'", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Medium"
  },
  {
    id: "16",
    question: "What is the output?\n```js\nlet x = 1;\nfunction test() {\n  console.log(x);\n  let x = 2;\n}\ntest();\n```",
    options: ["1", "2", "undefined", "ReferenceError"],
    correct: 3,
    category: "Hoisting",
    difficulty: "Hard"
  },
  {
    id: "17",
    question: "What is the output?\n```js\nconsole.log([...'hello']);\n```",
    options: ["'hello'", "['hello']", "['h','e','l','l','o']", "Error"],
    correct: 2,
    category: "Spread Operator",
    difficulty: "Easy"
  },
  {
    id: "18",
    question: "What is the output?\n```js\nconst obj = { x: 1 };\nconst arr = [obj, obj];\narr[0].x = 2;\nconsole.log(arr[1].x);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 1,
    category: "References",
    difficulty: "Medium"
  },
  {
    id: "19",
    question: "What is the output?\n```js\nconsole.log(1 < 2 < 3);\nconsole.log(3 > 2 > 1);\n```",
    options: ["true, true", "true, false", "false, true", "false, false"],
    correct: 1,
    category: "Comparisons",
    difficulty: "Hard"
  },
  {
    id: "20",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\ndelete arr[1];\nconsole.log(arr.length);\n```",
    options: ["2", "3", "undefined", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "21",
    question: "What is the output?\n```js\nconst a = {};\nconst b = { key: 'b' };\na[b] = 123;\nconsole.log(a['[object Object]']);\n```",
    options: ["undefined", "123", "'[object Object]'", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Hard"
  },
  {
    id: "22",
    question: "What is the output?\n```js\nconsole.log(!!null);\n```",
    options: ["true", "false", "null", "undefined"],
    correct: 1,
    category: "Boolean Conversion",
    difficulty: "Easy"
  },
  {
    id: "23",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3].map(num => {\n  if (typeof num === 'number') return;\n  return num * 2;\n});\nconsole.log(arr);\n```",
    options: ["[2, 4, 6]", "[undefined, undefined, undefined]", "[]", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "24",
    question: "What is the output?\n```js\nconst person = { name: 'John' };\nObject.seal(person);\nperson.age = 30;\nconsole.log(person.age);\n```",
    options: ["30", "undefined", "null", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Medium"
  },
  {
    id: "25",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3, 4, 5];\narr.length = 2;\nconsole.log(arr);\n```",
    options: ["[1, 2, 3, 4, 5]", "[1, 2]", "[3, 4, 5]", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "26",
    question: "What is the output?\n```js\nconst x = 1;\n(() => {\n  x = 2;\n  console.log(x);\n})();\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 3,
    category: "Scope",
    difficulty: "Medium"
  },
  {
    id: "27",
    question: "What is the output?\n```js\nconsole.log(3 + 4 + '5');\n```",
    options: ["'345'", "'75'", "12", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Easy"
  },
  {
    id: "28",
    question: "What is the output?\n```js\nconst obj = { a: 1, b: 2 };\nconst { a, ...rest } = obj;\nconsole.log(rest);\n```",
    options: ["{ a: 1, b: 2 }", "{ b: 2 }", "{ a: 1 }", "Error"],
    correct: 1,
    category: "Destructuring",
    difficulty: "Easy"
  },
  {
    id: "29",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst [a, , c] = arr;\nconsole.log(c);\n```",
    options: ["1", "2", "3", "undefined"],
    correct: 2,
    category: "Destructuring",
    difficulty: "Easy"
  },
  {
    id: "30",
    question: "What is the output?\n```js\nconst func = () => arguments;\nconsole.log(func(1, 2, 3));\n```",
    options: ["[1, 2, 3]", "{ 0: 1, 1: 2, 2: 3 }", "undefined", "ReferenceError"],
    correct: 3,
    category: "Arrow Functions",
    difficulty: "Hard"
  },
  {
    id: "31",
    question: "What is the output?\n```js\nconst num = 123;\nconsole.log(num.toString(2));\n```",
    options: ["'123'", "'1111011'", "123", "Error"],
    correct: 1,
    category: "Numbers",
    difficulty: "Medium"
  },
  {
    id: "32",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\narr.forEach((num, i) => {\n  arr[i] = num * 2;\n});\nconsole.log(arr);\n```",
    options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 2, 3, 2, 4, 6]", "Infinite loop"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "33",
    question: "What is the output?\n```js\nconst promise = new Promise((resolve) => {\n  console.log(1);\n  resolve(2);\n});\npromise.then(console.log);\nconsole.log(3);\n```",
    options: ["1, 2, 3", "1, 3, 2", "3, 1, 2", "2, 1, 3"],
    correct: 1,
    category: "Promises",
    difficulty: "Hard"
  },
  {
    id: "34",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst result = arr.map(x => x * 2).filter(x => x > 3);\nconsole.log(result);\n```",
    options: ["[2, 4, 6]", "[4, 6]", "[2, 3]", "[1, 2, 3]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "35",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconst copy = obj;\ncopy.a = 2;\nconsole.log(obj.a);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 1,
    category: "References",
    difficulty: "Easy"
  },
  {
    id: "36",
    question: "What is the output?\n```js\nconst str = 'hello';\nstr[0] = 'H';\nconsole.log(str);\n```",
    options: ["'Hello'", "'hello'", "Error", "undefined"],
    correct: 1,
    category: "Strings",
    difficulty: "Easy"
  },
  {
    id: "37",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.slice(1, 2));\n```",
    options: ["[1]", "[2]", "[1, 2]", "[2, 3]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "38",
    question: "What is the output?\n```js\nconst x = 10;\nfunction test() {\n  console.log(x);\n  const x = 20;\n}\ntest();\n```",
    options: ["10", "20", "undefined", "ReferenceError"],
    correct: 3,
    category: "Hoisting",
    difficulty: "Hard"
  },
  {
    id: "39",
    question: "What is the output?\n```js\nconsole.log([...[1, 2], ...[3, 4]]);\n```",
    options: ["[[1, 2], [3, 4]]", "[1, 2, 3, 4]", "Error", "undefined"],
    correct: 1,
    category: "Spread Operator",
    difficulty: "Easy"
  },
  {
    id: "40",
    question: "What is the output?\n```js\nconst obj = { x: 1, y: 2 };\nconst { x: a, y: b } = obj;\nconsole.log(a, b);\n```",
    options: ["undefined undefined", "x y", "1 2", "Error"],
    correct: 2,
    category: "Destructuring",
    difficulty: "Medium"
  },
  {
    id: "41",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3, 4, 5];\nconsole.log(arr.splice(2, 1));\n```",
    options: ["[1, 2]", "[3]", "[4, 5]", "[1, 2, 4, 5]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "42",
    question: "What is the output?\n```js\nconst x = { a: 1 };\nconst y = { a: 1 };\nconsole.log(x == y);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "43",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.includes(2));\n```",
    options: ["true", "false", "1", "undefined"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "44",
    question: "What is the output?\n```js\nconst func = (a, b = a) => a + b;\nconsole.log(func(5));\n```",
    options: ["5", "10", "NaN", "Error"],
    correct: 1,
    category: "Functions",
    difficulty: "Easy"
  },
  {
    id: "45",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\narr.length = 0;\nconsole.log(arr);\n```",
    options: ["[1, 2, 3]", "[]", "[0]", "undefined"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "46",
    question: "What is the output?\n```js\nconsole.log(typeof null);\n```",
    options: ["'null'", "'object'", "'undefined'", "'number'"],
    correct: 1,
    category: "JavaScript Basics",
    difficulty: "Easy"
  },
  {
    id: "47",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst newArr = arr.reverse();\nconsole.log(arr === newArr);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "48",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\ndelete obj.a;\nconsole.log(obj.a);\n```",
    options: ["1", "null", "undefined", "Error"],
    correct: 2,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "49",
    question: "What is the output?\n```js\nconsole.log(parseInt('10', 2));\n```",
    options: ["10", "2", "5", "Error"],
    correct: 1,
    category: "Numbers",
    difficulty: "Medium"
  },
  {
    id: "50",
    question: "What is the output?\n```js\nconst x = [1, 2, 3];\nconst y = x;\ny = [4, 5, 6];\nconsole.log(x);\n```",
    options: ["[1, 2, 3]", "[4, 5, 6]", "Error", "undefined"],
    correct: 2,
    category: "References",
    difficulty: "Medium"
  },
  {
    id: "51",
    question: "What is the output?\n```js\nconsole.log('5' - 3);\n```",
    options: ["'53'", "2", "'2'", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Easy"
  },
  {
    id: "52",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.find(x => x > 1));\n```",
    options: ["[2, 3]", "2", "true", "undefined"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "53",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconst arr = [obj];\narr[0].a = 2;\nconsole.log(obj.a);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 1,
    category: "References",
    difficulty: "Easy"
  },
  {
    id: "54",
    question: "What is the output?\n```js\nconsole.log([] + []);\n```",
    options: ["[]", "''", "'[][]'", "Error"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Medium"
  },
  {
    id: "55",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.indexOf(2));\n```",
    options: ["0", "1", "2", "-1"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "56",
    question: "What is the output?\n```js\nconst x = 5;\nconst y = x++;\nconsole.log(x, y);\n```",
    options: ["5 5", "6 5", "5 6", "6 6"],
    correct: 1,
    category: "Operators",
    difficulty: "Medium"
  },
  {
    id: "57",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.some(x => x > 2));\n```",
    options: ["true", "false", "[3]", "3"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "58",
    question: "What is the output?\n```js\nconst obj = { a: 1, b: 2 };\nfor (let key in obj) {\n  console.log(key);\n}\n```",
    options: ["1 2", "a b", "'a' 'b'", "undefined"],
    correct: 1,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "59",
    question: "What is the output?\n```js\nconsole.log(Math.max());\n```",
    options: ["0", "undefined", "-Infinity", "Infinity"],
    correct: 2,
    category: "Math",
    difficulty: "Hard"
  },
  {
    id: "60",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.every(x => x > 0));\n```",
    options: ["true", "false", "[1, 2, 3]", "undefined"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "61",
    question: "What is the output?\n```js\nconst str = 'hello';\nconsole.log(str.repeat(2));\n```",
    options: ["'hello'", "'hellohello'", "'hheelllloo'", "Error"],
    correct: 1,
    category: "Strings",
    difficulty: "Easy"
  },
  {
    id: "62",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3, 2, 1];\nconsole.log([...new Set(arr)]);\n```",
    options: ["[1, 2, 3, 2, 1]", "[1, 2, 3]", "[1, 2]", "Error"],
    correct: 1,
    category: "Sets",
    difficulty: "Easy"
  },
  {
    id: "63",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconst copy = { ...obj };\ncopy.a = 2;\nconsole.log(obj.a);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 0,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "64",
    question: "What is the output?\n```js\nconsole.log(!'');\n```",
    options: ["true", "false", "''", "undefined"],
    correct: 0,
    category: "Boolean Conversion",
    difficulty: "Easy"
  },
  {
    id: "65",
    question: "What is the output?\n```js\nconst arr = [1, [2, [3]]];\nconsole.log(arr.flat());\n```",
    options: ["[1, 2, 3]", "[1, [2, [3]]]", "[1, 2, [3]]", "Error"],
    correct: 2,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "66",
    question: "What is the output?\n```js\nconst x = 1;\nconst y = '1';\nconsole.log(x == y && x === y);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 1,
    category: "Comparisons",
    difficulty: "Easy"
  },
  {
    id: "67",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.join('-'));\n```",
    options: ["'1-2-3'", "'123'", "[1-2-3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "68",
    question: "What is the output?\n```js\nconst obj = { a: { b: 1 } };\nconst copy = { ...obj };\ncopy.a.b = 2;\nconsole.log(obj.a.b);\n```",
    options: ["1", "2", "undefined", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Hard"
  },
  {
    id: "69",
    question: "What is the output?\n```js\nconsole.log(true + false);\n```",
    options: ["'truefalse'", "1", "0", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Medium"
  },
  {
    id: "70",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.reduce((a, b) => a + b, 0));\n```",
    options: ["0", "6", "[1, 2, 3]", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "71",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nObject.preventExtensions(obj);\nobj.b = 2;\nconsole.log(obj.b);\n```",
    options: ["2", "undefined", "null", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Medium"
  },
  {
    id: "72",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.at(-1));\n```",
    options: ["1", "2", "3", "undefined"],
    correct: 2,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "73",
    question: "What is the output?\n```js\nconst x = 10;\nconst y = x.toString();\nconsole.log(typeof y);\n```",
    options: ["'number'", "'string'", "'object'", "'undefined'"],
    correct: 1,
    category: "Type Conversion",
    difficulty: "Easy"
  },
  {
    id: "74",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst [, b] = arr;\nconsole.log(b);\n```",
    options: ["1", "2", "3", "undefined"],
    correct: 1,
    category: "Destructuring",
    difficulty: "Easy"
  },
  {
    id: "75",
    question: "What is the output?\n```js\nconsole.log([] == false);\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 0,
    category: "Type Coercion",
    difficulty: "Hard"
  },
  {
    id: "76",
    question: "What is the output?\n```js\nconst func = function test() {};\nconsole.log(typeof test);\n```",
    options: ["'function'", "'undefined'", "'object'", "ReferenceError"],
    correct: 1,
    category: "Functions",
    difficulty: "Hard"
  },
  {
    id: "77",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.fill(0, 1, 2));\n```",
    options: ["[0, 0, 0]", "[1, 0, 3]", "[0, 2, 3]", "[1, 2, 0]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "78",
    question: "What is the output?\n```js\nconst x = { a: 1 };\nconst y = Object.create(x);\nconsole.log(y.a);\n```",
    options: ["undefined", "1", "null", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Medium"
  },
  {
    id: "79",
    question: "What is the output?\n```js\nconsole.log('5' * '2');\n```",
    options: ["'52'", "10", "'10'", "NaN"],
    correct: 1,
    category: "Type Coercion",
    difficulty: "Easy"
  },
  {
    id: "80",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.concat([4, 5]));\n```",
    options: ["[1, 2, 3, 4, 5]", "[[1,2,3],[4,5]]", "[1, 2, 3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "81",
    question: "What is the output?\n```js\nconst x = 1;\nconst y = 2;\nconsole.log(`${x}${y}`);\n```",
    options: ["3", "'12'", "12", "Error"],
    correct: 1,
    category: "Template Literals",
    difficulty: "Easy"
  },
  {
    id: "82",
    question: "What is the output?\n```js\nconst obj = { a: 1, b: 2 };\nconsole.log(Object.keys(obj));\n```",
    options: ["[1, 2]", "['a', 'b']", "{ a: 1, b: 2 }", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "83",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.flatMap(x => [x, x * 2]));\n```",
    options: ["[1, 2, 2, 4, 3, 6]", "[[1, 2], [2, 4], [3, 6]]", "[1, 2, 3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "84",
    question: "What is the output?\n```js\nconsole.log(Number(''));\n```",
    options: ["0", "NaN", "undefined", "null"],
    correct: 0,
    category: "Type Conversion",
    difficulty: "Medium"
  },
  {
    id: "85",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconst result = arr.filter(() => false);\nconsole.log(result);\n```",
    options: ["[1, 2, 3]", "[]", "false", "undefined"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "86",
    question: "What is the output?\n```js\nconst x = { a: 1 };\nconst y = { b: 2 };\nconst z = { ...x, ...y };\nconsole.log(z);\n```",
    options: ["{ a: 1 }", "{ b: 2 }", "{ a: 1, b: 2 }", "Error"],
    correct: 2,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "87",
    question: "What is the output?\n```js\nconsole.log(Boolean('false'));\n```",
    options: ["true", "false", "'false'", "undefined"],
    correct: 0,
    category: "Boolean Conversion",
    difficulty: "Easy"
  },
  {
    id: "88",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.lastIndexOf(2));\n```",
    options: ["0", "1", "2", "-1"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "89",
    question: "What is the output?\n```js\nconst x = null;\nconsole.log(x ?? 'default');\n```",
    options: ["null", "'default'", "undefined", "Error"],
    correct: 1,
    category: "Nullish Coalescing",
    difficulty: "Easy"
  },
  {
    id: "90",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.shift());\n```",
    options: ["1", "[1]", "[2, 3]", "3"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "91",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconsole.log('a' in obj);\n```",
    options: ["true", "false", "1", "undefined"],
    correct: 0,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "92",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\narr.unshift(0);\nconsole.log(arr);\n```",
    options: ["[0, 1, 2, 3]", "[1, 2, 3, 0]", "[1, 2, 3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "93",
    question: "What is the output?\n```js\nconsole.log(10 / 0);\n```",
    options: ["0", "NaN", "Infinity", "Error"],
    correct: 2,
    category: "Numbers",
    difficulty: "Easy"
  },
  {
    id: "94",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.slice(-2));\n```",
    options: ["[1]", "[2, 3]", "[3]", "[-2]"],
    correct: 1,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "95",
    question: "What is the output?\n```js\nconst x = 'hello';\nconsole.log(x.charAt(0));\n```",
    options: ["'h'", "0", "'hello'", "undefined"],
    correct: 0,
    category: "Strings",
    difficulty: "Easy"
  },
  {
    id: "96",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.pop());\n```",
    options: ["1", "2", "3", "[1, 2]"],
    correct: 2,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "97",
    question: "What is the output?\n```js\nconsole.log(Object.values({ a: 1, b: 2 }));\n```",
    options: ["['a', 'b']", "[1, 2]", "{ a: 1, b: 2 }", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "98",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.findIndex(x => x > 1));\n```",
    options: ["0", "1", "2", "-1"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "99",
    question: "What is the output?\n```js\nconsole.log(String(123));\n```",
    options: ["123", "'123'", "Error", "undefined"],
    correct: 1,
    category: "Type Conversion",
    difficulty: "Easy"
  },
  {
    id: "100",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3, 4, 5];\nconsole.log(arr.slice(1, -1));\n```",
    options: ["[2, 3, 4]", "[1, 2, 3, 4]", "[2, 3, 4, 5]", "[1]"],
    correct: 0,
    category: "Arrays",
    difficulty: "Medium"
  },
  {
    id: "101",
    question: "What is the output?\n```js\nconst x = [1, 2];\nconst y = [3, 4];\nconsole.log([...x, ...y]);\n```",
    options: ["[[1,2],[3,4]]", "[1, 2, 3, 4]", "Error", "undefined"],
    correct: 1,
    category: "Spread Operator",
    difficulty: "Easy"
  },
  {
    id: "102",
    question: "What is the output?\n```js\nconsole.log(parseInt('10px'));\n```",
    options: ["10", "NaN", "'10px'", "Error"],
    correct: 0,
    category: "Numbers",
    difficulty: "Medium"
  },
  {
    id: "103",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconsole.log(obj.hasOwnProperty('a'));\n```",
    options: ["true", "false", "1", "undefined"],
    correct: 0,
    category: "Objects",
    difficulty: "Easy"
  },
  {
    id: "104",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.toString());\n```",
    options: ["'[1,2,3]'", "'1,2,3'", "[1, 2, 3]", "Error"],
    correct: 1,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "105",
    question: "What is the output?\n```js\nconsole.log(!!0);\n```",
    options: ["true", "false", "0", "undefined"],
    correct: 1,
    category: "Boolean Conversion",
    difficulty: "Easy"
  },
  {
    id: "106",
    question: "What is the output?\n```js\nconst arr = [1, 2, 3];\nconsole.log(arr.copyWithin(0, 1, 2));\n```",
    options: ["[2, 2, 3]", "[1, 1, 2]", "[1, 2, 3]", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Hard"
  },
  {
    id: "107",
    question: "What is the output?\n```js\nconsole.log(Array.isArray([]));\n```",
    options: ["true", "false", "undefined", "Error"],
    correct: 0,
    category: "Arrays",
    difficulty: "Easy"
  },
  {
    id: "108",
    question: "What is the output?\n```js\nconst x = 5;\nconsole.log(x.toFixed(2));\n```",
    options: ["5", "'5.00'", "5.00", "Error"],
    correct: 1,
    category: "Numbers",
    difficulty: "Easy"
  },
  {
    id: "109",
    question: "What is the output?\n```js\nconst obj = { a: 1 };\nconsole.log(Object.entries(obj));\n```",
    options: ["['a', 1]", "[['a', 1]]", "{ a: 1 }", "Error"],
    correct: 1,
    category: "Objects",
    difficulty: "Medium"
  },
  {
    id: "110",
    question: "What is the output?\n```js\nconsole.log('hello'.toUpperCase());\n```",
    options: ["'hello'", "'HELLO'", "'Hello'", "Error"],
    correct: 1,
    category: "Strings",
    difficulty: "Easy"
  },
  
  // CSS Questions
  {
    id: "C1",
    question: "Which CSS property controls text size?",
    options: ["font-style", "text-style", "font-size", "text-size"],
    correct: 2,
    category: "CSS",
    difficulty: "Easy"
  },
  {
    id: "C2",
    question: "What does 'display: flex' do?",
    options: ["Makes text flexible", "Creates a flexbox container", "Hides element", "Makes element inline"],
    correct: 1,
    category: "CSS",
    difficulty: "Easy"
  },
  {
    id: "C3",
    question: "Which property controls element stacking order?",
    options: ["z-index", "stack-order", "layer", "position"],
    correct: 0,
    category: "CSS",
    difficulty: "Easy"
  },
  
  // Riddles
  {
    id: "R1",
    question: "Bridge and torch: 1,2,7,10 min to cross; one torch; two max per trip; slowest sets pace. Minimum total time?",
    options: ["17 minutes", "19 minutes", "21 minutes", "23 minutes"],
    correct: 0,
    category: "Logic Puzzles",
    difficulty: "Hard"
  },
  {
    id: "R2",
    question: "You see a boat filled with people, yet there isn't a single person on board. How?",
    options: ["They are invisible", "They are all married", "It's a ghost ship", "It's a painting"],
    correct: 1,
    category: "Logic Puzzles",
    difficulty: "Medium"
  },
  {
    id: "R3",
    question: "A farmer needs to carry a wolf, a goat, and a cabbage across a river with a boat that holds one item at a time. He can't leave the wolf with the goat or the goat with the cabbage. Minimum number of crossings?",
    options: ["7 crossings", "9 crossings", "11 crossings", "13 crossings"],
    correct: 0,
    category: "Logic Puzzles",
    difficulty: "Hard"
  },
  {
    id: "R4",
    question: "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?",
    options: ["Echo", "Whistle", "Shadow", "Thought"],
    correct: 0,
    category: "Logic Puzzles",
    difficulty: "Medium"
  },
  {
    id: "R5",
    question: "What gets wetter the more it dries?",
    options: ["Sponge", "Towel", "Sun", "Cloud"],
    correct: 1,
    category: "Logic Puzzles",
    difficulty: "Easy"
  },
];

module.exports = { quizQuestions };

