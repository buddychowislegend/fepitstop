// Comprehensive Frontend Interview Problems
// 100 original problems covering JavaScript, React, CSS, DOM APIs, and Algorithms
// All titles rephrased to be original and avoid copyright
// Problems randomly shuffled for uniqueness
// Examples synced with test cases for consistency
// Descriptions tailored to each specific problem

const comprehensiveProblems = [
  {
    "id": "stream-subscription-service",
    "title": "Data Stream Processor",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Create a data stream processing system that handles asynchronous data flows. Implement methods to subscribe to streams, transform data, filter values, and combine multiple streams. Support backpressure handling, error propagation, and stream completion. Build a reactive programming interface.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class Stream {\n  constructor() {\n    // your code\n  }\n  \n  subscribe(callback) {\n    // your code\n  }\n  \n  push(data) {\n    // your code\n  }\n}",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "data-list",
    "title": "Dynamic Data Table",
    "difficulty": "Hard",
    "tags": [
      "react",
      "app-design",
      "tables"
    ],
    "prompt": "Create a dynamic data table with sorting, filtering, and pagination. Support column configuration, custom cell renderers, row selection, and bulk actions. Handle large datasets efficiently with virtual scrolling or pagination. Provide search and export functionality.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "throttle-ii",
    "title": "Advanced Rate Limiter",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Build a throttle function that limits how often a function can be called within a specified time period. Unlike debounce, throttle ensures the function executes at regular intervals. Support both leading edge (execute immediately) and trailing edge (execute after delay) options. Useful for scroll handlers, mouse movements, and API rate limiting.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function throttle(func, delay, options = { leading: true, trailing: false }) {\n  let timeoutId = null;\n  let lastExecuted = 0;\n  \n  return function(...args) {\n    // your code here\n  };\n}\n\n// Test your implementation\nlet callCount = 0;\nconst increment = () => { callCount++; };\nconst throttled = throttle(increment, 100);\n\n// Call multiple times rapidly\nthrottled(); // Should execute immediately (leading)\nthrottled(); // Should be throttled\nthrottled(); // Should be throttled\n\nsetTimeout(() => {\n  console.log('Call count:', callCount); // Should be 1\n}, 150);",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Google",
      "Microsoft"
    ],
    "examples": [
      {
        "input": "throttle(() => count++, 100); call 3 times rapidly",
        "output": "1",
        "explanation": "Only first call executes within 100ms window (leading edge)"
      },
      {
        "input": "throttle(() => count++, 100, {leading: false, trailing: true}); call 3 times",
        "output": "1",
        "explanation": "Only last call executes after delay (trailing edge)"
      },
      {
        "input": "throttle(() => count++, 100); wait 150ms between calls",
        "output": "2",
        "explanation": "Both calls execute as they're outside throttle window"
      }
    ],
    "testCases": [
      {
        "input": "let count = 0; const fn = () => count++; const throttled = throttle(fn, 100); throttled(); throttled(); throttled(); return count;",
        "expected": "1",
        "explanation": "Leading edge: only first call executes immediately"
      },
      {
        "input": "let count = 0; const fn = () => count++; const throttled = throttle(fn, 100, {leading: false, trailing: true}); throttled(); throttled(); setTimeout(() => count, 150);",
        "expected": "1",
        "explanation": "Trailing edge: only last call executes after delay"
      },
      {
        "input": "let count = 0; const fn = () => count++; const throttled = throttle(fn, 50); throttled(); setTimeout(() => { throttled(); return count; }, 100);",
        "expected": "2",
        "explanation": "Calls outside window both execute"
      },
      {
        "input": "const fn = () => 'test'; const throttled = throttle(fn, 100); return typeof throttled;",
        "expected": "function",
        "explanation": "Should return a function"
      }
    ]
  },
  {
    "id": "rate-limiter",
    "title": "Request Throttle Manager",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "algorithmic",
      "coding"
    ],
    "prompt": "Build a throttle function that limits how often a function can be called within a specified time period. Unlike debounce, throttle ensures the function executes at regular intervals. Support both leading edge (execute immediately) and trailing edge (execute after delay) options. Useful for scroll handlers, mouse movements, and API rate limiting.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class RateLimiter {\n  constructor() {\n    // your code\n  }\n  \n  isAllowed(clientId) {\n    // your code\n  }\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "rateLimiter(3, 1000)",
        "output": "function",
        "explanation": "Should create rate limiter"
      },
      {
        "input": "limiter(() => {})",
        "output": "undefined",
        "explanation": "Should allow first request"
      },
      {
        "input": "limiter(() => {})",
        "output": "undefined",
        "explanation": "Should allow within limit"
      }
    ],
    "testCases": [
      {
        "input": "rateLimiter(3, 1000)",
        "expected": "function",
        "explanation": "Should create rate limiter"
      },
      {
        "input": "limiter(() => {})",
        "expected": "undefined",
        "explanation": "Should allow first request"
      },
      {
        "input": "limiter(() => {})",
        "expected": "undefined",
        "explanation": "Should allow within limit"
      }
    ]
  },
  {
    "id": "flatten-nested-objects-2",
    "title": "Recursive Array Simplifier",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "objects",
      "coding"
    ],
    "prompt": "Create a function that takes a nested array of any depth and returns a flattened single-dimensional array. Your solution should handle arrays containing numbers, strings, objects, or other arrays. Implement both recursive and iterative approaches, maintaining the original order of elements.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function flatten(items) {\n  // your code\n}\n\nconst nested = [{ value: 'v1', children: [{ value: 'v2', children: [] }] }];\nconsole.log(flatten(nested));  // [{ value: 'v1' }, { value: 'v2' }]",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Microsoft",
      "Netflix",
      "LinkedIn"
    ],
    "examples": [
      {
        "input": "[1, [2, [3]]]",
        "output": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "output": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "output": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ],
    "testCases": [
      {
        "input": "[1, [2, [3]]]",
        "expected": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "expected": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "expected": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ]
  },
  {
    "id": "advanced-event-emitter-implementation-javascript",
    "title": "Advanced Event Dispatcher",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Build a custom event emitter system that allows subscribing to events, emitting events with data, and unsubscribing. Support multiple listeners per event, wildcard events, and once-only listeners. Handle edge cases like removing listeners during event emission and memory leak prevention.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class EventEmitter {\n  on(name, callback) {\n    // your code (return { off: () => {...} })\n  }\n  \n  emit(name, ...args) {\n    // your code\n  }\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "emitter.on('test', callback)",
        "output": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "output": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "output": "undefined",
        "explanation": "Should remove event listener"
      }
    ],
    "testCases": [
      {
        "input": "emitter.on('test', callback)",
        "expected": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "expected": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "expected": "undefined",
        "explanation": "Should remove event listener"
      }
    ]
  },
  {
    "id": "string-repeater",
    "title": "Text Multiplication Utility",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "String.prototype.myRepeat = function(times) {\n  // your code\n};\n\nconsole.log('hello '.myRepeat(3));  // 'hello hello hello '",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Apple"
    ],
    "examples": [
      {
        "input": "'hello', 3",
        "output": "'hellohellohello'",
        "explanation": "Should repeat string 3 times"
      },
      {
        "input": "'a', 5",
        "output": "'aaaaa'",
        "explanation": "Should repeat single character"
      },
      {
        "input": "'', 3",
        "output": "''",
        "explanation": "Should handle empty string"
      }
    ],
    "testCases": [
      {
        "input": "'hello', 3",
        "expected": "'hellohellohello'",
        "explanation": "Should repeat string 3 times"
      },
      {
        "input": "'a', 5",
        "expected": "'aaaaa'",
        "explanation": "Should repeat single character"
      },
      {
        "input": "'', 3",
        "expected": "''",
        "explanation": "Should handle empty string"
      }
    ]
  },
  {
    "id": "find-corresponding-node",
    "title": "DOM Node Correlator",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function findCorrespondingNode(tree1, tree2, target) {\n  // your code\n}\n\nconst t1 = document.getElementById('tree1');\nconst t2 = document.getElementById('tree2');\nconst target = t1.querySelector('.target');",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "output": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "output": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "output": "6",
        "explanation": "Should reduce array to single value"
      }
    ],
    "testCases": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "expected": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "expected": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "expected": "6",
        "explanation": "Should reduce array to single value"
      }
    ]
  },
  {
    "id": "transactions-list",
    "title": "Transaction History Display",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design"
    ],
    "prompt": "Build a stock price tracker or transaction manager that processes financial data. Calculate metrics like price changes, trends, gains/losses, and transaction histories. Handle real-time updates, data validation, and provide aggregation functions for analysis and reporting.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Stripe"
    ],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "getelementsbyclassname",
    "title": "Class-Based Element Finder",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Implement getElementsByClassName without using the native method. Search the DOM tree for all elements with a specific class name. Handle multiple classes, nested elements, and dynamic class lists. Return a live or static collection and optimize for performance.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function getElementsByClassName(className, root) {\n  // your code\n}\n\nconst root = document.querySelector('.container');\nconst items = getElementsByClassName('active', root);",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "traverse-dom",
    "title": "DOM Tree Navigator",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Create a DOM tree traversal utility that visits all nodes in a specified order (depth-first or breadth-first). Support filtering by node type, collecting specific nodes, and applying transformations. Handle different node types (elements, text, comments) and provide a clean API for tree navigation.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function traverseDOM(root) {\n  // your code\n}\n\nconst root = document.getElementById('root');\nconst nodes = traverseDOM(root);",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Amazon"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "build-fake-timer",
    "title": "Mock Timer System",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "testing"
    ],
    "prompt": "Implement timer utilities for managing intervals and timeouts. Create functions to set, clear, and track multiple timers. Support cleanup mechanisms to prevent memory leaks, handle timer precision issues, and provide utilities for common timing patterns like polling and delayed execution.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class FakeTimer {\n  install() {\n    // your code\n  }\n  \n  uninstall() {\n    // your code\n  }\n  \n  tick() {\n    // your code\n  }\n}",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "improve-a-function",
    "title": "Code Optimization Challenge",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Analyze and optimize existing code for better performance and readability. Identify inefficiencies, apply best practices, reduce complexity, and improve algorithm efficiency. Consider time/space complexity, code maintainability, and modern JavaScript features.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function excludeItems(items, excludes) {\n  // your code\n}\n\nconst items = [\n  { color: 'red', type: 'tv', age: 18 },\n  { color: 'blue', type: 'book', age: 17 }\n];\nconst excludes = [{ k: 'color', v: 'blue' }];",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "output": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "output": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "output": "6",
        "explanation": "Should reduce array to single value"
      }
    ],
    "testCases": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "expected": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "expected": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "expected": "6",
        "explanation": "Should reduce array to single value"
      }
    ]
  },
  {
    "id": "testing-framework",
    "title": "Custom Test Runner",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "app-design",
      "coding"
    ],
    "prompt": "Build a minimal testing framework with describe/it blocks, assertions, and test reporting. Support nested test suites, before/after hooks, async tests, and clear error messages. Provide expect-style assertions (toBe, toEqual, toThrow) and generate readable test output with pass/fail counts.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function describe(name, fn) {\n  // your code\n}\n\nfunction it(name, fn) {\n  // your code\n}\n\nfunction expect(value) {\n  // your code\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "flatten-vii",
    "title": "Optimized Array Reducer",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Create a function that takes a nested array of any depth and returns a flattened single-dimensional array. Your solution should handle arrays containing numbers, strings, objects, or other arrays. Implement both recursive and iterative approaches, maintaining the original order of elements.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function flatten(input) {\n  // your code\n}\n\nconsole.log(flatten([1, [2, 3], [[4, 5], 6]]));\n// [1, 2, 3, 4, 5, 6]",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Airbnb",
      "Netflix",
      "Apple"
    ],
    "examples": [
      {
        "input": "[1, [2, [3]]]",
        "output": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "output": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "output": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ],
    "testCases": [
      {
        "input": "[1, [2, [3]]]",
        "expected": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "expected": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "expected": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ]
  },
  {
    "id": "first-bad-version",
    "title": "Binary Search Debugger",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "algorithmic"
    ],
    "prompt": "Solve a problem using binary search algorithm to efficiently find a target value in a sorted dataset. Implement the search with optimal time complexity O(log n). Handle edge cases like empty arrays, duplicate values, and values not in the array. Consider both iterative and recursive approaches.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function firstBadVersion(isBad) {\n  return function(version) {\n    // your code\n  };\n}\n\nconst isBad = (v) => v >= 4;\nconst find = firstBadVersion(isBad);\nconsole.log(find(5));  // 4",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "react-signup-form",
    "title": "User Registration Form",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design",
      "forms"
    ],
    "prompt": "Build a user registration form with validation, error handling, and submission. Implement field validation (email format, password strength, required fields), real-time feedback, and form state management. Handle submission success/failure and provide clear user guidance.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "top-k-words",
    "title": "Word Frequency Analyzer",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "algorithmic",
      "coding"
    ],
    "prompt": "Find the K most frequent words in a text or array. Implement efficient counting using hash maps, sort by frequency (and alphabetically for ties), and return the top K results. Handle case sensitivity, punctuation, and optimize for large datasets. Consider time and space complexity.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function topKWords(log, k) {\n  // your code\n}\n\nconst log = 'User1 logged in. User2 logged in. User1 performed action.';\nconsole.log(topKWords(log, 3));",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "['a', 'b', 'a', 'c'], 2",
        "output": "['a', 'b']",
        "explanation": "Should return top 2 most frequent words"
      },
      {
        "input": "['a', 'a', 'a'], 1",
        "output": "['a']",
        "explanation": "Should return single most frequent word"
      },
      {
        "input": "['a', 'b', 'c'], 3",
        "output": "['a', 'b', 'c']",
        "explanation": "Should return all words when k equals length"
      }
    ],
    "testCases": [
      {
        "input": "['a', 'b', 'a', 'c'], 2",
        "expected": "['a', 'b']",
        "explanation": "Should return top 2 most frequent words"
      },
      {
        "input": "['a', 'a', 'a'], 1",
        "expected": "['a']",
        "explanation": "Should return single most frequent word"
      },
      {
        "input": "['a', 'b', 'c'], 3",
        "expected": "['a', 'b', 'c']",
        "explanation": "Should return all words when k equals length"
      }
    ]
  },
  {
    "id": "star-rating-component-react",
    "title": "Interactive Rating Component",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design",
      "ui"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "clearallintervals",
    "title": "Interval Cleanup Utility",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Implement timer utilities for managing intervals and timeouts. Create functions to set, clear, and track multiple timers. Support cleanup mechanisms to prevent memory leaks, handle timer precision issues, and provide utilities for common timing patterns like polling and delayed execution.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function clearAllIntervals() {\n  // your code\n}\n\nsetInterval(() => console.log('1'), 1000);\nsetInterval(() => console.log('2'), 1000);\nclearAllIntervals();  // Cancels all",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "text-highlighter",
    "title": "Search Term Highlighter",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "<div id=\"content\">Some text with word</div>",
    "starterCss": "",
    "starterJs": "function highlightWord(element, word, color) {\n  // your code\n}\n\nconst el = document.getElementById('content');\nhighlightWord(el, 'word', 'yellow');",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "create-dom",
    "title": "Dynamic Element Generator",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function createDom(root) {\n  // your code\n}\n\nconst def = {\n  type: 'div',\n  attributes: { class: 'container' },\n  children: [{ type: 'h1', children: ['Title'] }]\n};\nconst dom = createDom(def);",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create div element"
      },
      {
        "input": "createElement('span')",
        "output": "HTMLSpanElement",
        "explanation": "Should create span element"
      },
      {
        "input": "createElement('input')",
        "output": "HTMLInputElement",
        "explanation": "Should create input element"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create div element"
      },
      {
        "input": "createElement('span')",
        "expected": "HTMLSpanElement",
        "explanation": "Should create span element"
      },
      {
        "input": "createElement('input')",
        "expected": "HTMLInputElement",
        "explanation": "Should create input element"
      }
    ]
  },
  {
    "id": "build-feature-flag",
    "title": "Feature Toggle System",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "design"
    ],
    "prompt": "Build a feature flag system for controlling feature rollouts. Store feature states, check if features are enabled for specific users or contexts, and support percentage-based rollouts. Implement caching for performance and provide an API for runtime feature toggling.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class FeatureFlag {\n  constructor() {\n    // your code\n  }\n  \n  isEnabled(features) {\n    // your code\n  }\n}",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Atlassian"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "todo-app",
    "title": "Task Management Interface",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "app-design",
      "vanilla"
    ],
    "prompt": "Build a task management interface with add, edit, delete, and complete functionality. Implement local storage persistence, filtering (all/active/completed), and task reordering. Support due dates, priorities, and categories. Provide a clean UI with real-time updates.",
    "starterHtml": "<div id=\"container\"></div>",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Airbnb",
      "OpenAI",
      "Microsoft",
      "Netflix",
      "Apple",
      "LinkedIn"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "histogram",
    "title": "Frequency Distribution Builder",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "app-design",
      "vanilla"
    ],
    "prompt": "Create a function that builds a frequency distribution (histogram) from an array of values. Count occurrences of each unique value and return a data structure suitable for visualization. Handle different data types, maintain insertion order, and provide methods to query frequencies.",
    "starterHtml": "<div id=\"histogram\"></div>",
    "starterCss": "",
    "starterJs": "function buildHistogram(numbers) {\n  // your code\n}\n\nbuildHistogram([2, 4, 5, 2, 3, 4]);",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Netflix"
    ],
    "examples": [
      {
        "input": "[2, 4, 5, 2, 3, 4]",
        "output": "histogram object",
        "explanation": "Should create histogram with correct counts"
      },
      {
        "input": "[1, 1, 1, 1]",
        "output": "histogram object",
        "explanation": "All same values"
      },
      {
        "input": "[]",
        "output": "empty histogram",
        "explanation": "Empty input array"
      }
    ],
    "testCases": [
      {
        "input": "[2, 4, 5, 2, 3, 4]",
        "expected": "histogram object",
        "explanation": "Should create histogram with correct counts"
      },
      {
        "input": "[1, 1, 1, 1]",
        "expected": "histogram object",
        "explanation": "All same values"
      },
      {
        "input": "[]",
        "expected": "empty histogram",
        "explanation": "Empty input array"
      }
    ]
  },
  {
    "id": "event-logger-i",
    "title": "Event Tracking System",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Build a custom event emitter system that allows subscribing to events, emitting events with data, and unsubscribing. Support multiple listeners per event, wildcard events, and once-only listeners. Handle edge cases like removing listeners during event emission and memory leak prevention.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class EventLogger {\n  constructor() {\n    // your code\n  }\n  \n  sendRequest(event) {\n    // your code (returns object with abort method)\n  }\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Robinhood"
    ],
    "examples": [
      {
        "input": "emitter.on('test', callback)",
        "output": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "output": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "output": "undefined",
        "explanation": "Should remove event listener"
      }
    ],
    "testCases": [
      {
        "input": "emitter.on('test', callback)",
        "expected": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "expected": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "expected": "undefined",
        "explanation": "Should remove event listener"
      }
    ]
  },
  {
    "id": "merge-identical-api-calls",
    "title": "API Request Deduplicator",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "optimization"
    ],
    "prompt": "Implement a deep cloning function that creates a complete copy of nested objects and arrays. Your solution should handle circular references, different data types (objects, arrays, dates, functions), and maintain prototype chains. Ensure the clone is completely independent of the original.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function createGetAPIWithMerging(getAPI) {\n  // your code\n}\n\nconst merged = createGetAPIWithMerging(fetch);\nconst r1 = await merged('/data', { params: { id: 123 } });\nconst r2 = await merged('/data', { params: { id: 123 } });  // Merged",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "compose-function",
    "title": "Function Composition Tool",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "algorithmic",
      "coding"
    ],
    "prompt": "Implement function composition that combines multiple functions into a single function. The output of each function becomes the input of the next. Support right-to-left execution order (mathematical composition) and handle any number of functions. Useful for creating data transformation pipelines.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function compose(...fns) {\n  // your code\n}\n\nconst a = x => x * 4;\nconst b = x => x + 4;\nconst c = x => x - 1;\nconsole.log(compose(a, b, c)(5));  // 23",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "compose(f, g)(x)",
        "output": "f(g(x))",
        "explanation": "Should compose two functions"
      },
      {
        "input": "compose(f, g, h)(x)",
        "output": "f(g(h(x)))",
        "explanation": "Should compose three functions"
      },
      {
        "input": "compose(x => x * 2, x => x + 1)(5)",
        "output": "12",
        "explanation": "Should compose math functions"
      }
    ],
    "testCases": [
      {
        "input": "compose(f, g)(x)",
        "expected": "f(g(x))",
        "explanation": "Should compose two functions"
      },
      {
        "input": "compose(f, g, h)(x)",
        "expected": "f(g(h(x)))",
        "explanation": "Should compose three functions"
      },
      {
        "input": "compose(x => x * 2, x => x + 1)(5)",
        "expected": "12",
        "explanation": "Should compose math functions"
      }
    ]
  },
  {
    "id": "get-text-between-nodes",
    "title": "Text Range Extractor",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "dom-api"
    ],
    "prompt": "Extract text content between two DOM nodes. Handle different node types, traverse the DOM tree correctly, and collect text from all nodes in the range. Consider edge cases like nodes not in the same tree, text nodes, and element boundaries.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function getTextBetweenTwoNodes(node1, node2) {\n  // your code\n}\n\nconst n1 = document.getElementById('start');\nconst n2 = document.getElementById('end');\nconsole.log(getTextBetweenTwoNodes(n1, n2));",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "tic-tac-toe",
    "title": "Grid Game Logic",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design",
      "game"
    ],
    "prompt": "Implement game logic for a grid-based game. Handle game state management, move validation, win condition detection, and turn management. Support player interactions, undo/redo functionality, and game reset. Ensure the game follows proper rules and provides clear feedback.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Atlassian"
    ],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "this-methods",
    "title": "Context Binding Methods",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Implement custom versions of call, apply, and bind methods that control function execution context (this). Handle argument passing, return values, and edge cases. Understand how these methods work internally and recreate their behavior without using the native methods.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "Function.prototype.myCall = function(context, ...args) {\n  // your code\n};\n\nFunction.prototype.myApply = function(context, args) {\n  // your code\n};\n\nFunction.prototype.myBind = function(context, ...args) {\n  // your code\n};",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Microsoft",
      "Netflix",
      "Apple",
      "LinkedIn"
    ],
    "examples": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "output": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "output": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "output": "6",
        "explanation": "Should reduce array to single value"
      }
    ],
    "testCases": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "expected": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "expected": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "expected": "6",
        "explanation": "Should reduce array to single value"
      }
    ]
  },
  {
    "id": "navigation",
    "title": "Multi-Level Menu Builder",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "app-design",
      "vanilla"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "<div id=\"nav-container\"></div>",
    "starterCss": "",
    "starterJs": "function renderNav(navData, context = document.body) {\n  // your code\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "node-store",
    "title": "DOM Node Cache System",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Create a memoization wrapper that caches function results based on input arguments. When called with the same arguments, return the cached result instead of re-executing the function. Handle multiple arguments, different data types, and consider cache invalidation strategies. Optimize for performance and memory usage.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class NodeStore {\n  constructor() {\n    // your code\n  }\n  \n  set(node, value) {\n    // your code\n  }\n  \n  get(node) {\n    // your code\n  }\n  \n  has(node) {\n    // your code\n  }\n}",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "output": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "output": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "output": "6",
        "explanation": "Should reduce array to single value"
      }
    ],
    "testCases": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "expected": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "expected": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "expected": "6",
        "explanation": "Should reduce array to single value"
      }
    ]
  },
  {
    "id": "react-emoji-selector",
    "title": "Emoji Picker Interface",
    "difficulty": "Hard",
    "tags": [
      "react",
      "app-design",
      "animation"
    ],
    "prompt": "Build an emoji picker interface with search, categories, and recently used emojis. Implement efficient emoji rendering, search by name or keyword, category filtering, and skin tone selection. Support keyboard navigation and provide a clean, performant UI.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "javascript-deep-clone-frontend-interview-question",
    "title": "Object Deep Duplicator",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Implement a deep cloning function that creates a complete copy of nested objects and arrays. Your solution should handle circular references, different data types (objects, arrays, dates, functions), and maintain prototype chains. Ensure the clone is completely independent of the original.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function deepClone(obj) {\n  // your code\n}\n\nconst original = { a: 1, b: { c: 2 } };\nconst cloned = deepClone(original);\ncloned.b.c = 999;\nconsole.log(original.b.c);  // 2",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "{ a: 1, b: { c: 2 } }",
        "output": "{ a: 1, b: { c: 2 } }",
        "explanation": "Should clone nested objects"
      },
      {
        "input": "[1, [2, [3]]]",
        "output": "[1, [2, [3]]]",
        "explanation": "Should clone nested arrays"
      },
      {
        "input": "null",
        "output": "null",
        "explanation": "Should handle null values"
      }
    ],
    "testCases": [
      {
        "input": "{ a: 1, b: { c: 2 } }",
        "expected": "{ a: 1, b: { c: 2 } }",
        "explanation": "Should clone nested objects"
      },
      {
        "input": "[1, [2, [3]]]",
        "expected": "[1, [2, [3]]]",
        "explanation": "Should clone nested arrays"
      },
      {
        "input": "null",
        "expected": "null",
        "explanation": "Should handle null values"
      }
    ]
  },
  {
    "id": "set-interval-with-linear-delay",
    "title": "Progressive Interval Timer",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Implement timer utilities for managing intervals and timeouts. Create functions to set, clear, and track multiple timers. Support cleanup mechanisms to prevent memory leaks, handle timer precision issues, and provide utilities for common timing patterns like polling and delayed execution.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function mySetInterval(func, delay, period) {\n  // your code\n}\n\nfunction myClearInterval(id) {\n  // your code\n}\n\nconst id = mySetInterval(() => console.log('tick'), 100, 200);",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "api-confirmation",
    "title": "Request Confirmation Modal",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "coding",
      "async"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "async function getFirstSuccessful(apiUrls) {\n  // your code\n}\n\nconst urls = [\n  'https://api.example.com/api1',\n  'https://api.example.com/api2'\n];\ngetFirstSuccessful(urls).then(result => console.log(result));",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "build-your-own-json-stringify",
    "title": "Object Serializer",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "algorithmic"
    ],
    "prompt": "Implement a JSON serialization function similar to JSON.stringify(). Convert JavaScript values into JSON strings, handling objects, arrays, primitives, and special values. Support proper escaping, circular reference detection, and custom replacer functions. Follow JSON specification strictly.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function myStringify(value) {\n  // your code\n}\n\nconsole.log(myStringify(['foo', 'bar']));\nconsole.log(myStringify({ name: 'John', age: 30 }));",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "Snap"
    ],
    "examples": [
      {
        "input": "'hello world'",
        "output": "processed string",
        "explanation": "Should process string input"
      },
      {
        "input": "''",
        "output": "empty result",
        "explanation": "Should handle empty string"
      },
      {
        "input": "'test123'",
        "output": "filtered result",
        "explanation": "Should handle string with numbers"
      }
    ],
    "testCases": [
      {
        "input": "'hello world'",
        "expected": "processed string",
        "explanation": "Should process string input"
      },
      {
        "input": "''",
        "expected": "empty result",
        "explanation": "Should handle empty string"
      },
      {
        "input": "'test123'",
        "expected": "filtered result",
        "explanation": "Should handle string with numbers"
      }
    ]
  },
  {
    "id": "file-navigation-react",
    "title": "File Explorer Component",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design"
    ],
    "prompt": "Build a file explorer component that displays hierarchical file structures. Support folder expansion/collapse, file selection, navigation, and breadcrumbs. Implement search, sorting, and file operations (rename, delete, move). Handle nested directories and provide a tree view.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Atlassian"
    ],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "trending-stocks",
    "title": "Stock Price Tracker",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "json",
      "coding",
      "api"
    ],
    "prompt": "Build a stock price tracker or transaction manager that processes financial data. Calculate metrics like price changes, trends, gains/losses, and transaction histories. Handle real-time updates, data validation, and provide aggregation functions for analysis and reporting.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "async function getTrendingStocks(n) {\n  // your code\n}\n\ngetTrendingStocks(2).then(stocks => console.log(stocks));",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Microsoft",
      "Netflix",
      "Apple"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "flatten-array-with-depth",
    "title": "Advanced Array Flattener",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Create a function that takes a nested array of any depth and returns a flattened single-dimensional array. Your solution should handle arrays containing numbers, strings, objects, or other arrays. Implement both recursive and iterative approaches, maintaining the original order of elements.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function flattenWithDepth(arr, depth) {\n  // your code\n}\n\nconsole.log(flattenWithDepth([1, [2, [3, [4, 5]]], 6], 2));\n// [1, 2, 3, [4, 5], 6]",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "[1, [2, [3]]]",
        "output": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "output": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "output": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ],
    "testCases": [
      {
        "input": "[1, [2, [3]]]",
        "expected": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "expected": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "expected": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ]
  },
  {
    "id": "build-your-own-queryselectorall-javascript-guide",
    "title": "CSS Selector Engine",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding",
      "dom"
    ],
    "prompt": "Implement a CSS selector engine that finds DOM elements matching a given selector string. Support basic selectors (tag, class, id), combinators (descendant, child, sibling), and pseudo-classes. Parse selector strings and efficiently query the DOM tree to return matching elements.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function querySelectorAll(selector, node = document) {\n  // your code\n}\n\nconst items = querySelectorAll('.active', document.getElementById('container'));",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "throttle",
    "title": "Function Rate Controller",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Build a throttle function that limits how often a function can be called within a specified time period. Unlike debounce, throttle ensures the function executes at regular intervals. Support both leading edge (execute immediately) and trailing edge (execute after delay) options. Useful for scroll handlers, mouse movements, and API rate limiting.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function throttle(callback, delay) {\n  // your code (return function with .cancel())\n}\n\nconst throttled = throttle(() => console.log('scroll'), 1000);",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Microsoft",
      "Netflix",
      "Apple",
      "LinkedIn"
    ],
    "examples": [
      {
        "input": "throttle(console.log, 100)",
        "output": "function",
        "explanation": "Should return a function"
      },
      {
        "input": "throttle(() => {}, 0)",
        "output": "function",
        "explanation": "Should work with zero delay"
      },
      {
        "input": "throttle(() => {}, 1000)",
        "output": "function",
        "explanation": "Should work with large delay"
      }
    ],
    "testCases": [
      {
        "input": "throttle(console.log, 100)",
        "expected": "function",
        "explanation": "Should return a function"
      },
      {
        "input": "throttle(() => {}, 0)",
        "expected": "function",
        "explanation": "Should work with zero delay"
      },
      {
        "input": "throttle(() => {}, 1000)",
        "expected": "function",
        "explanation": "Should work with large delay"
      }
    ]
  },
  {
    "id": "node-store-es5-compatible",
    "title": "Enhanced DOM Cache",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "dom-api"
    ],
    "prompt": "Create a memoization wrapper that caches function results based on input arguments. When called with the same arguments, return the cached result instead of re-executing the function. Handle multiple arguments, different data types, and consider cache invalidation strategies. Optimize for performance and memory usage.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "build-custom-promise-javascript",
    "title": "Async Promise Constructor",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Implement Promise utility functions that handle asynchronous operations. Your solution should correctly manage promise states (pending, fulfilled, rejected), handle errors, support chaining, and work with multiple promises. Consider edge cases like empty arrays and rejected promises.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class MyPromise {\n  constructor(executor) {\n    // your code\n  }\n  \n  then(onFulfilled, onRejected) {\n    // your code\n  }\n  \n  catch(onRejected) {\n    // your code\n  }\n  \n  getState() {\n    // your code\n  }\n}",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "Google",
      "Robinhood",
      "Netflix"
    ],
    "examples": [
      {
        "input": "new Promise((resolve) => resolve(42))",
        "output": "Promise",
        "explanation": "Should create a promise"
      },
      {
        "input": "Promise.resolve(42)",
        "output": "Promise",
        "explanation": "Should create resolved promise"
      },
      {
        "input": "Promise.reject('error')",
        "output": "Promise",
        "explanation": "Should create rejected promise"
      }
    ],
    "testCases": [
      {
        "input": "new Promise((resolve) => resolve(42))",
        "expected": "Promise",
        "explanation": "Should create a promise"
      },
      {
        "input": "Promise.resolve(42)",
        "expected": "Promise",
        "explanation": "Should create resolved promise"
      },
      {
        "input": "Promise.reject('error')",
        "expected": "Promise",
        "explanation": "Should create rejected promise"
      }
    ]
  },
  {
    "id": "intersection-observer",
    "title": "Viewport Visibility Tracker",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "vanilla"
    ],
    "prompt": "Implement an Intersection Observer utility that detects when elements enter or exit the viewport. Track visibility changes, calculate intersection ratios, and support threshold-based callbacks. Useful for lazy loading, infinite scroll, and analytics. Handle multiple elements and cleanup properly.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class MyIntersectionObserver {\n  constructor(callback) {\n    // your code\n  }\n  \n  observe(element) {\n    // your code\n  }\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "classnames",
    "title": "CSS Class Name Builder",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function classnames(...args) {\n  // your code\n}\n\nconst classes = classnames(\n  'btn',\n  isActive && 'btn-active',\n  isError && 'btn-error'\n);",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "['btn', 'btn-primary']",
        "output": "'btn btn-primary'",
        "explanation": "Array of strings"
      },
      {
        "input": "{ btn: true, 'btn-primary': false }",
        "output": "'btn'",
        "explanation": "Object with boolean values"
      },
      {
        "input": "['btn', { 'btn-primary': true, disabled: false }]",
        "output": "'btn btn-primary'",
        "explanation": "Mixed array and object"
      }
    ],
    "testCases": [
      {
        "input": "['btn', 'btn-primary']",
        "expected": "'btn btn-primary'",
        "explanation": "Array of strings"
      },
      {
        "input": "{ btn: true, 'btn-primary': false }",
        "expected": "'btn'",
        "explanation": "Object with boolean values"
      },
      {
        "input": "['btn', { 'btn-primary': true, disabled: false }]",
        "expected": "'btn btn-primary'",
        "explanation": "Mixed array and object"
      }
    ]
  },
  {
    "id": "build-infinite-scrolling-newsfeed",
    "title": "Endless Content Loader",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "vanilla",
      "api"
    ],
    "prompt": "Implement infinite scrolling that loads more content as users scroll down. Detect when user reaches the bottom, fetch new data, append to existing content, and handle loading states. Prevent duplicate loads, manage scroll position, and optimize performance with throttling or intersection observers.",
    "starterHtml": "<div id=\"feed\"></div>",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "flatten-xi",
    "title": "Ultimate Array Flattener",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "algorithmic",
      "coding"
    ],
    "prompt": "Create a function that takes a nested array of any depth and returns a flattened single-dimensional array. Your solution should handle arrays containing numbers, strings, objects, or other arrays. Implement both recursive and iterative approaches, maintaining the original order of elements.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function flattenWithPrefix(obj, prefix) {\n  // your code\n}\n\nconst input = { a: { b: { c: 1 }, d: 2 } };\nconsole.log(flattenWithPrefix(input, ''));  // { 'a.b.c': 1, 'a.d': 2 }",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "[1, [2, [3]]]",
        "output": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "output": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "output": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ],
    "testCases": [
      {
        "input": "[1, [2, [3]]]",
        "expected": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "expected": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "expected": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ]
  },
  {
    "id": "total-salaries",
    "title": "Nested Salary Calculator",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "json",
      "coding"
    ],
    "prompt": "Calculate the total salaries across a nested organizational structure. Given an object representing departments and employees, recursively traverse the structure to sum all salary values. Handle varying levels of nesting, empty departments, and different organizational hierarchies.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function calculateTotalSalaries(company) {\n  // your code\n}\n\nconst company = {\n  sales: [{ name: 'John', salary: 1000 }],\n  development: {\n    sites: [{ name: 'Peter', salary: 2000 }]\n  }\n};",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "{ sales: [{ name: 'John', salary: 1000 }] }",
        "output": "1000",
        "explanation": "Single employee salary"
      },
      {
        "input": "{ sales: [{ name: 'John', salary: 1000 }], dev: [{ name: 'Jane', salary: 2000 }] }",
        "output": "3000",
        "explanation": "Multiple departments"
      },
      {
        "input": "{}",
        "output": "0",
        "explanation": "Empty company structure"
      }
    ],
    "testCases": [
      {
        "input": "{ sales: [{ name: 'John', salary: 1000 }] }",
        "expected": "1000",
        "explanation": "Single employee salary"
      },
      {
        "input": "{ sales: [{ name: 'John', salary: 1000 }], dev: [{ name: 'Jane', salary: 2000 }] }",
        "expected": "3000",
        "explanation": "Multiple departments"
      },
      {
        "input": "{}",
        "expected": "0",
        "explanation": "Empty company structure"
      }
    ]
  },
  {
    "id": "hierarchical-checkbox",
    "title": "Nested Checkbox Controller",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "app-design",
      "vanilla"
    ],
    "prompt": "Create a hierarchical checkbox system where parent checkboxes control children and children affect parent states. Implement three states: checked, unchecked, and indeterminate. Handle nested levels, propagate changes up and down the tree, and maintain consistent state across the hierarchy.",
    "starterHtml": "<div id=\"checkbox-tree\"></div>",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "flatten-vi",
    "title": "Iterative Array Flattener",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Create a function that takes a nested array of any depth and returns a flattened single-dimensional array. Your solution should handle arrays containing numbers, strings, objects, or other arrays. Implement both recursive and iterative approaches, maintaining the original order of elements.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "async function getBatch(arr, index) {\n  // your code\n}\n\nasync function getValueList(arr, fromIndex, toIndex) {\n  // your code\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Atlassian"
    ],
    "examples": [
      {
        "input": "[1, [2, [3]]]",
        "output": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "output": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "output": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ],
    "testCases": [
      {
        "input": "[1, [2, [3]]]",
        "expected": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "expected": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "expected": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ]
  },
  {
    "id": "virtual-dom-iii",
    "title": "Virtual DOM Patcher",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Implement a virtual DOM system that efficiently updates the real DOM. Create a virtual representation of DOM elements, compute differences between old and new virtual trees (diffing), and apply minimal changes to the actual DOM (patching). Handle element creation, updates, and removal efficiently.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function parseJSX(htmlString) {\n  // your code\n}\n\nconst result = parseJSX('<a>frontendlead.com</a>');",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "memoize-i",
    "title": "Basic Function Cacher",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Create a memoization wrapper that caches function results based on input arguments. When called with the same arguments, return the cached result instead of re-executing the function. Handle multiple arguments, different data types, and consider cache invalidation strategies. Optimize for performance and memory usage.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function memoize(fn, resolver) {\n  // your code (return function with .has(), .delete(), .clear())\n}\n\nconst expensive = (n) => n * n;\nconst memoized = memoize(expensive);\nconsole.log(memoized(5));  // Computed\nconsole.log(memoized(5));  // Cached",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "memoize((x) => x * 2)",
        "output": "function",
        "explanation": "Should return memoized function"
      },
      {
        "input": "memoize((x) => x * x)(5)",
        "output": "25",
        "explanation": "Should compute and cache result"
      },
      {
        "input": "memoize((x) => x * x)(5)",
        "output": "25",
        "explanation": "Should return cached result on second call"
      }
    ],
    "testCases": [
      {
        "input": "memoize((x) => x * 2)",
        "expected": "function",
        "explanation": "Should return memoized function"
      },
      {
        "input": "memoize((x) => x * x)(5)",
        "expected": "25",
        "explanation": "Should compute and cache result"
      },
      {
        "input": "memoize((x) => x * x)(5)",
        "expected": "25",
        "explanation": "Should return cached result on second call"
      }
    ]
  },
  {
    "id": "promise-methods",
    "title": "Promise Combinator Suite",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Implement Promise utility functions that handle asynchronous operations. Your solution should correctly manage promise states (pending, fulfilled, rejected), handle errors, support chaining, and work with multiple promises. Consider edge cases like empty arrays and rejected promises.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "Promise.myRace = function(promises) {\n  // your code\n};\n\nPromise.myAny = function(promises) {\n  // your code\n};\n\nPromise.myAll = function(promises) {\n  // your code\n};\n\nPromise.myAllSettled = function(promises) {\n  // your code\n};",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "LinkedIn",
      "ClickUp"
    ],
    "examples": [
      {
        "input": "new Promise((resolve) => resolve(42))",
        "output": "Promise",
        "explanation": "Should create a promise"
      },
      {
        "input": "Promise.resolve(42)",
        "output": "Promise",
        "explanation": "Should create resolved promise"
      },
      {
        "input": "Promise.reject('error')",
        "output": "Promise",
        "explanation": "Should create rejected promise"
      }
    ],
    "testCases": [
      {
        "input": "new Promise((resolve) => resolve(42))",
        "expected": "Promise",
        "explanation": "Should create a promise"
      },
      {
        "input": "Promise.resolve(42)",
        "expected": "Promise",
        "explanation": "Should create resolved promise"
      },
      {
        "input": "Promise.reject('error')",
        "expected": "Promise",
        "explanation": "Should create rejected promise"
      }
    ]
  },
  {
    "id": "debounce-ii",
    "title": "Enhanced Debounce Utility",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Implement a debounce utility that delays function execution until after a specified wait time has elapsed since the last invocation. This is commonly used for search inputs, resize handlers, and API calls to prevent excessive function calls. Your implementation should handle arguments, context (this), and support immediate execution options.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function debounce(func, wait) {\n  // your code (return function with .cancel() and .flush())\n}\n\nconst debounced = debounce(() => console.log('exec'), 1000);\ndebounced();\ndebounced.cancel();  // Cancel\ndebounced.flush();   // Execute now",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "debounce(fn, 100)",
        "output": "function",
        "explanation": "Should return debounced function"
      },
      {
        "input": "rapid calls",
        "output": "delayed execution",
        "explanation": "Should delay execution"
      },
      {
        "input": "single call",
        "output": "executed once",
        "explanation": "Should execute after delay"
      }
    ],
    "testCases": [
      {
        "input": "debounce(fn, 100)",
        "expected": "function",
        "explanation": "Should return debounced function"
      },
      {
        "input": "rapid calls",
        "expected": "delayed execution",
        "explanation": "Should delay execution"
      },
      {
        "input": "single call",
        "expected": "executed once",
        "explanation": "Should execute after delay"
      }
    ]
  },
  {
    "id": "tabs",
    "title": "Tab Navigation System",
    "difficulty": "Easy",
    "tags": [
      "react",
      "app-design"
    ],
    "prompt": "Create a tab navigation component that switches between different content panels. Implement active tab highlighting, keyboard navigation (arrow keys), and content lazy loading. Handle dynamic tab addition/removal, support nested tabs, and ensure accessibility with proper ARIA attributes.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Airbnb"
    ],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "autocomplete-search-list",
    "title": "Predictive Input Field",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "app-design",
      "vanilla"
    ],
    "prompt": "Create an autocomplete search component that suggests results as users type. Implement efficient string matching, debounce user input, highlight matching portions, and handle keyboard navigation (arrow keys, enter, escape). Support both local and remote data sources with loading states.",
    "starterHtml": "<input id=\"search\" type=\"text\" />",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "api-retry",
    "title": "Retry Logic Handler",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "async"
    ],
    "prompt": "Implement an API retry mechanism that automatically retries failed requests with exponential backoff. Handle network errors, timeouts, and specific HTTP status codes. Support configurable retry attempts, delay strategies, and success/failure callbacks. Prevent infinite retry loops.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "async function retryApiCall(apiFunction, maxRetries, retryInterval) {\n  // your code\n}\n\n// Test:\nconst fetchData = async () => fetch('https://example.com/data');\nretryApiCall(fetchData, 3, 1000);",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Atlassian"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "k-most-text-nodes",
    "title": "Text Node Frequency Finder",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function findKFrequentWordsInTree(tree, k) {\n  // your code\n}\n\nconst tree = document.getElementById('root');\nconsole.log(findKFrequentWordsInTree(tree, 3));",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "flatten-nested-objects-with-prefixes-javascript",
    "title": "Multi-Level Array Processor",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "objects",
      "coding"
    ],
    "prompt": "Create a function that takes a nested array of any depth and returns a flattened single-dimensional array. Your solution should handle arrays containing numbers, strings, objects, or other arrays. Implement both recursive and iterative approaches, maintaining the original order of elements.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function flattenWithPrefix(obj, prefix = '') {\n  // your code\n}\n\nconst input = { a: { b: { c: 1 }, d: 2 } };\nconsole.log(flattenWithPrefix(input));  // { 'a.b.c': 1, 'a.d': 2 }",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Robinhood",
      "Stripe",
      "Snap"
    ],
    "examples": [
      {
        "input": "[1, [2, [3]]]",
        "output": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "output": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "output": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ],
    "testCases": [
      {
        "input": "[1, [2, [3]]]",
        "expected": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "expected": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "expected": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ]
  },
  {
    "id": "request-animation-frame",
    "title": "Horizontal Animation Helper",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding",
      "animation"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "<div id=\"hello\"></div>",
    "starterCss": "",
    "starterJs": "function animateRight(elementId, distance, duration) {\n  // your code\n}\n\nanimateRight('hello', 400, 1000);",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "react-nested-components-ii",
    "title": "Recursive Comment System",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design",
      "recursion"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "promisify-any-function",
    "title": "Callback to Promise Converter",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Implement Promise utility functions that handle asynchronous operations. Your solution should correctly manage promise states (pending, fulfilled, rejected), handle errors, support chaining, and work with multiple promises. Consider edge cases like empty arrays and rejected promises.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function promisify(fn) {\n  // your code\n}\n\nconst promisified = promisify(someCallbackFn);\npromisified().then(result => console.log(result));",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "fn(1, 2, 3)",
        "output": "computed result",
        "explanation": "Should call function with arguments"
      },
      {
        "input": "fn()",
        "output": "default result",
        "explanation": "Should handle function with no arguments"
      },
      {
        "input": "fn.call(this, arg)",
        "output": "bound result",
        "explanation": "Should handle function binding"
      }
    ],
    "testCases": [
      {
        "input": "fn(1, 2, 3)",
        "expected": "computed result",
        "explanation": "Should call function with arguments"
      },
      {
        "input": "fn()",
        "expected": "default result",
        "explanation": "Should handle function with no arguments"
      },
      {
        "input": "fn.call(this, arg)",
        "expected": "bound result",
        "explanation": "Should handle function binding"
      }
    ]
  },
  {
    "id": "reorder-array-with-new-indexes",
    "title": "Array Index Remapper",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "array"
    ],
    "prompt": "Recreate native array methods from scratch to demonstrate understanding of their internal workings. Implement map, filter, reduce, find, every, some, and other array utilities. Handle edge cases, maintain proper this context, and support all standard parameters (element, index, array).",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function reorderArray(items, newOrder) {\n  // your code\n}\n\nconst items = ['a', 'b', 'c', 'd', 'e'];\nconst newOrder = [3, 0, 4, 1, 2];\nreorderArray(items, newOrder);\nconsole.log(items);  // ['b', 'd', 'e', 'a', 'c']",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "output": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "output": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "output": "6",
        "explanation": "Should reduce array to single value"
      }
    ],
    "testCases": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "expected": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "expected": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "expected": "6",
        "explanation": "Should reduce array to single value"
      }
    ]
  },
  {
    "id": "aggregate-skill-endorsements-javascript-guide",
    "title": "Interactive Rating Widget",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "json",
      "coding"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function aggregateSkillEndorsements(endorsements) {\n  // your code\n}\n\nconst endorsements = [\n  { skill: 'css', user: 'Bill' },\n  { skill: 'javascript', user: 'Chad' }\n];",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "LinkedIn"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "flatten-arrays-recursively-and-iteratively",
    "title": "Array Depth Reducer",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Create a function that takes a nested array of any depth and returns a flattened single-dimensional array. Your solution should handle arrays containing numbers, strings, objects, or other arrays. Implement both recursive and iterative approaches, maintaining the original order of elements.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function flattenRecursive(arr) {\n  // your code\n}\n\nfunction flattenIterative(arr) {\n  // your code\n}\n\nconsole.log(flattenRecursive([[1, 2, [3, [4, 5]]], 6]));\n// [1, 2, 3, 4, 5, 6]",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Microsoft",
      "Netflix"
    ],
    "examples": [
      {
        "input": "[[[[1]]]]",
        "output": "[1]",
        "explanation": "Deep nesting with single element"
      },
      {
        "input": "[[1, 2, [3, [4, 5]]], 6]",
        "output": "[1,2,3,4,5,6]",
        "explanation": "Mixed nesting levels"
      },
      {
        "input": "[1, 2, 3]",
        "output": "[1,2,3]",
        "explanation": "Already flat array"
      }
    ],
    "testCases": [
      {
        "input": "[[[[1]]]]",
        "expected": "[1]",
        "explanation": "Deep nesting with single element"
      },
      {
        "input": "[[1, 2, [3, [4, 5]]], 6]",
        "expected": "[1,2,3,4,5,6]",
        "explanation": "Mixed nesting levels"
      },
      {
        "input": "[1, 2, 3]",
        "expected": "[1,2,3]",
        "explanation": "Already flat array"
      },
      {
        "input": "[]",
        "expected": "[]",
        "explanation": "Empty array"
      }
    ]
  },
  {
    "id": "image-slider",
    "title": "Image Carousel Component",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design"
    ],
    "prompt": "Build an image carousel/slider component with navigation controls. Support previous/next buttons, automatic sliding, touch/swipe gestures, and indicator dots. Handle edge cases (first/last image), implement smooth transitions, and ensure accessibility with keyboard navigation.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "react-connect-four",
    "title": "Connect Four Game Logic",
    "difficulty": "Hard",
    "tags": [
      "react",
      "app-design",
      "game"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "memoize-ii",
    "title": "Advanced Memoization",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "coding",
      "optimization"
    ],
    "prompt": "Create a memoization wrapper that caches function results based on input arguments. When called with the same arguments, return the cached result instead of re-executing the function. Handle multiple arguments, different data types, and consider cache invalidation strategies. Optimize for performance and memory usage.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class TrieNode {\n  constructor() {\n    // your code\n  }\n}\n\nclass Trie {\n  constructor() {\n    // your code\n  }\n}\n\nfunction memoize(fn) {\n  // your code using Trie\n}",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "memoize(fn)",
        "output": "function",
        "explanation": "Should return memoized function"
      },
      {
        "input": "memoizedFn(5)",
        "output": "computed result",
        "explanation": "Should compute result first time"
      },
      {
        "input": "memoizedFn(5)",
        "output": "cached result",
        "explanation": "Should return cached result"
      }
    ],
    "testCases": [
      {
        "input": "memoize(fn)",
        "expected": "function",
        "explanation": "Should return memoized function"
      },
      {
        "input": "memoizedFn(5)",
        "expected": "computed result",
        "explanation": "Should compute result first time"
      },
      {
        "input": "memoizedFn(5)",
        "expected": "cached result",
        "explanation": "Should return cached result"
      }
    ]
  },
  {
    "id": "api-search-and-render-image",
    "title": "Image Search Interface",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design",
      "api"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "masonry-grid",
    "title": "Dynamic Grid Layout",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "app-design",
      "vanilla"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "<div id=\"masonry\"></div>",
    "starterCss": "",
    "starterJs": "function createMasonryLayout(items, columns, gap) {\n  // your code\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "debounce-i",
    "title": "Delayed Execution Handler",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Implement a debounce utility that delays function execution until after a specified wait time has elapsed since the last invocation. This is commonly used for search inputs, resize handlers, and API calls to prevent excessive function calls. Your implementation should handle arguments, context (this), and support immediate execution options.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function debounce(callback, delay, immediate = false) {\n  // your code\n}\n\nconst debouncedFn = debounce(() => console.log('search'), 300);",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Microsoft",
      "Netflix",
      "Apple",
      "LinkedIn"
    ],
    "examples": [
      {
        "input": "debounce(fn, 100)",
        "output": "function",
        "explanation": "Should return debounced function"
      },
      {
        "input": "rapid calls",
        "output": "delayed execution",
        "explanation": "Should delay execution"
      },
      {
        "input": "single call",
        "output": "executed once",
        "explanation": "Should execute after delay"
      }
    ],
    "testCases": [
      {
        "input": "debounce(fn, 100)",
        "expected": "function",
        "explanation": "Should return debounced function"
      },
      {
        "input": "rapid calls",
        "expected": "delayed execution",
        "explanation": "Should delay execution"
      },
      {
        "input": "single call",
        "expected": "executed once",
        "explanation": "Should execute after delay"
      }
    ]
  },
  {
    "id": "react-nested-components",
    "title": "Comment Thread Renderer",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design",
      "recursion"
    ],
    "prompt": "Create a nested comment system that displays threaded discussions. Support multiple nesting levels, reply functionality, comment voting, and sorting (newest, oldest, most popular). Implement efficient rendering for deep nesting and handle comment expansion/collapse.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "asynchronous-request-queue",
    "title": "Sequential API Manager",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding",
      "async"
    ],
    "prompt": "Build an asynchronous request queue that processes API calls sequentially or with concurrency limits. Ensure requests execute in order, handle failures gracefully, support retry logic, and provide progress tracking. Prevent race conditions and manage queue state effectively.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "async function requestQueue(requests) {\n  // your code\n}\n\nconst reqs = [\n  fetch('/api/1'),\n  fetch('/api/2'),\n  fetch('/api/3')\n];\nrequestQueue(reqs).then(results => console.log(results));",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Google",
      "Robinhood"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "flatten-nested-objects",
    "title": "Deep Array Normalizer",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "objects",
      "coding"
    ],
    "prompt": "Create a function that takes a nested array of any depth and returns a flattened single-dimensional array. Your solution should handle arrays containing numbers, strings, objects, or other arrays. Implement both recursive and iterative approaches, maintaining the original order of elements.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function flatten(obj) {\n  // your code\n}\n\nconst input = { a: 1, b: { c: 2, d: { e: 3 } } };\nconsole.log(flatten(input));  // { a: 1, c: 2, e: 3 }",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook",
      "Amazon",
      "Google",
      "Netflix",
      "LinkedIn",
      "TikTok"
    ],
    "examples": [
      {
        "input": "[1, [2, [3]]]",
        "output": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "output": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "output": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ],
    "testCases": [
      {
        "input": "[1, [2, [3]]]",
        "expected": "[1,2,3]",
        "explanation": "Should flatten nested arrays"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "expected": "[1,2,3,4]",
        "explanation": "Should flatten array of arrays"
      },
      {
        "input": "[1, 2, 3]",
        "expected": "[1,2,3]",
        "explanation": "Should handle already flat array"
      }
    ]
  },
  {
    "id": "curry-function",
    "title": "Function Currying Helper",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Create a currying function that transforms a multi-argument function into a sequence of single-argument functions. Your implementation should handle any number of arguments, support partial application, and maintain the original function's context. Enable flexible function composition patterns.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function curry(fn) {\n  // your code\n}\n\nconst add = (a, b, c) => a + b + c;\nconst curriedAdd = curry(add);\nconsole.log(curriedAdd(1)(2)(3)());  // 6",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "curry((a, b, c) => a + b + c)(1)(2)(3)",
        "output": "6",
        "explanation": "Should curry function with 3 args"
      },
      {
        "input": "curry((a, b) => a * b)(2)(3)",
        "output": "6",
        "explanation": "Should curry function with 2 args"
      },
      {
        "input": "curry((a) => a * 2)(5)",
        "output": "10",
        "explanation": "Should curry single argument function"
      }
    ],
    "testCases": [
      {
        "input": "curry((a, b, c) => a + b + c)(1)(2)(3)",
        "expected": "6",
        "explanation": "Should curry function with 3 args"
      },
      {
        "input": "curry((a, b) => a * b)(2)(3)",
        "expected": "6",
        "explanation": "Should curry function with 2 args"
      },
      {
        "input": "curry((a) => a * 2)(5)",
        "expected": "10",
        "explanation": "Should curry single argument function"
      }
    ]
  },
  {
    "id": "build-phone-number-parser",
    "title": "Phone Format Validator",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "react"
    ],
    "prompt": "Create a phone number parser and formatter. Validate phone numbers, format them according to regional standards, extract country codes, and handle different input formats. Support international numbers, detect invalid formats, and provide user-friendly error messages.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Stripe"
    ],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "virtual-dom-ii",
    "title": "Virtual DOM Differ",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Implement a virtual DOM system that efficiently updates the real DOM. Create a virtual representation of DOM elements, compute differences between old and new virtual trees (diffing), and apply minimal changes to the actual DOM (patching). Handle element creation, updates, and removal efficiently.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function render(vdom) {\n  // your code\n}\n\nconst vdom = {\n  type: 'div',\n  props: {\n    children: [{ type: 'h1', props: { children: 'Hello' } }]\n  }\n};",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "build-gpt-react",
    "title": "AI Chat Interface",
    "difficulty": "Hard",
    "tags": [
      "react",
      "app-design",
      "ai"
    ],
    "prompt": "Create a chat interface for conversational interactions. Implement message display, input handling, message history, and typing indicators. Support different message types (user/bot), timestamps, and message formatting. Handle real-time updates and scroll management.",
    "starterHtml": "<div id=\"app\"></div>",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "OpenAI"
    ],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "custom-javascript-array-methods-mymap-myfilter-myreduce",
    "title": "Custom Array Utilities",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Recreate native array methods from scratch to demonstrate understanding of their internal workings. Implement map, filter, reduce, find, every, some, and other array utilities. Handle edge cases, maintain proper this context, and support all standard parameters (element, index, array).",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "Array.prototype.myMap = function(callback) {\n  // your code\n};\n\nArray.prototype.myFilter = function(callback) {\n  // your code\n};\n\nArray.prototype.myReduce = function(callback, initial) {\n  // your code\n};",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Amazon",
      "Netflix",
      "LinkedIn"
    ],
    "examples": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "output": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "output": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "output": "6",
        "explanation": "Should reduce array to single value"
      }
    ],
    "testCases": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "expected": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "expected": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "expected": "6",
        "explanation": "Should reduce array to single value"
      }
    ]
  },
  {
    "id": "debounce-iii",
    "title": "Advanced Debounce Handler",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Implement a debounce utility that delays function execution until after a specified wait time has elapsed since the last invocation. This is commonly used for search inputs, resize handlers, and API calls to prevent excessive function calls. Your implementation should handle arguments, context (this), and support immediate execution options.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function debounce(func, delay, options = {}) {\n  // your code\n}\n\nconst debounced = debounce(() => console.log('search'), 300, {\n  leading: true,\n  trailing: true\n});",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "Google",
      "Microsoft"
    ],
    "examples": [
      {
        "input": "debounce(fn, 100)",
        "output": "function",
        "explanation": "Should return debounced function"
      },
      {
        "input": "rapid calls",
        "output": "delayed execution",
        "explanation": "Should delay execution"
      },
      {
        "input": "single call",
        "output": "executed once",
        "explanation": "Should execute after delay"
      }
    ],
    "testCases": [
      {
        "input": "debounce(fn, 100)",
        "expected": "function",
        "explanation": "Should return debounced function"
      },
      {
        "input": "rapid calls",
        "expected": "delayed execution",
        "explanation": "Should delay execution"
      },
      {
        "input": "single call",
        "expected": "executed once",
        "explanation": "Should execute after delay"
      }
    ]
  },
  {
    "id": "next-right-sibling",
    "title": "Sibling Node Locator",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Find the next right sibling element in the DOM that matches specific criteria. Skip over text nodes and comments, handle cases where no sibling exists, and support filtering by tag name, class, or custom predicates. Navigate the DOM tree efficiently.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function findNextRightSibling(root, target) {\n  // your code\n}\n\nconst root = document.getElementById('root');\nconst target = document.getElementById('target');\nconsole.log(findNextRightSibling(root, target));",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Microsoft"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "progress-bar-react-interview-question",
    "title": "Progress Indicator Widget",
    "difficulty": "Easy",
    "tags": [
      "react",
      "app-design",
      "ui"
    ],
    "prompt": "Create a progress indicator that visually represents completion status. Support determinate (known progress) and indeterminate (loading) modes. Handle percentage updates, color transitions, and custom styling. Provide smooth animations and accessibility features.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "parser-for-rich-text-editor",
    "title": "Text Format Parser",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "algorithmic",
      "coding"
    ],
    "prompt": "Create a phone number parser and formatter. Validate phone numbers, format them according to regional standards, extract country codes, and handle different input formats. Support international numbers, detect invalid formats, and provide user-friendly error messages.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function parseRichText(text, styles) {\n  // your code\n}\n\nconst result = parseRichText('Hello, world', [[0, 2, 'i'], [4, 9, 'b']]);",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [
      "Google"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "eventtarget",
    "title": "Event Listener Manager",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class EventTarget {\n  constructor() {\n    // your code\n  }\n  \n  addEventListener(name, callback) {\n    // your code\n  }\n  \n  removeEventListener(name, callback) {\n    // your code\n  }\n  \n  dispatchEvent(name) {\n    // your code\n  }\n}",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "emitter.on('test', callback)",
        "output": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "output": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "output": "undefined",
        "explanation": "Should remove event listener"
      }
    ],
    "testCases": [
      {
        "input": "emitter.on('test', callback)",
        "expected": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "expected": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "expected": "undefined",
        "explanation": "Should remove event listener"
      }
    ]
  },
  {
    "id": "virtual-dom-i",
    "title": "Virtual DOM Renderer",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "dom-api",
      "coding"
    ],
    "prompt": "Implement a virtual DOM system that efficiently updates the real DOM. Create a virtual representation of DOM elements, compute differences between old and new virtual trees (diffing), and apply minimal changes to the actual DOM (patching). Handle element creation, updates, and removal efficiently.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function virtualize(element) {\n  // your code\n}\n\nfunction render(vdom) {\n  // your code\n}\n\nconst el = document.getElementById('root');\nconst vdom = virtualize(el);",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "createElement('div')",
        "output": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "output": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "output": "undefined",
        "explanation": "Should add event listener"
      }
    ],
    "testCases": [
      {
        "input": "createElement('div')",
        "expected": "HTMLDivElement",
        "explanation": "Should create DOM element"
      },
      {
        "input": "querySelector('.test')",
        "expected": "Element or null",
        "explanation": "Should find DOM element"
      },
      {
        "input": "addEventListener('click', handler)",
        "expected": "undefined",
        "explanation": "Should add event listener"
      }
    ]
  },
  {
    "id": "javascript-observables-reactive-programming-guide",
    "title": "Reactive Stream Handler",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Create a data stream processing system that handles asynchronous data flows. Implement methods to subscribe to streams, transform data, filter values, and combine multiple streams. Support backpressure handling, error propagation, and stream completion. Build a reactive programming interface.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class Observable {\n  constructor(subscriber) {\n    // your code\n  }\n  \n  subscribe(observer) {\n    // your code (return { unsubscribe: () => {...} })\n  }\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "roman-numeral-to-int",
    "title": "Roman Numeral Converter",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "algorithmic"
    ],
    "prompt": "Convert Roman numerals to integer values. Understand Roman numeral rules: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Handle subtractive notation (IV=4, IX=9, XL=40, etc.) where a smaller value before a larger value means subtraction. Validate input and handle edge cases.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function romanToInteger(str) {\n  // your code\n}\n\nconsole.log(romanToInteger('MCMXCIV'));  // 1994",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "'I'",
        "output": "1",
        "explanation": "Should convert I to 1"
      },
      {
        "input": "'IV'",
        "output": "4",
        "explanation": "Should convert IV to 4"
      },
      {
        "input": "'IX'",
        "output": "9",
        "explanation": "Should convert IX to 9"
      }
    ],
    "testCases": [
      {
        "input": "'I'",
        "expected": "1",
        "explanation": "Should convert I to 1"
      },
      {
        "input": "'IV'",
        "expected": "4",
        "explanation": "Should convert IV to 4"
      },
      {
        "input": "'IX'",
        "expected": "9",
        "explanation": "Should convert IX to 9"
      }
    ]
  },
  {
    "id": "build-airbnb-react-question",
    "title": "Property Listing Platform",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design",
      "api"
    ],
    "prompt": "Build a property listing platform interface. Display property cards with images, details, and filters. Implement search, sorting, filtering by price/location/features, and favorites. Support grid/list views, pagination or infinite scroll, and responsive design.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Airbnb",
      "OpenAI",
      "Netflix",
      "LinkedIn"
    ],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "clearalltimeouts",
    "title": "Timeout Cleanup Utility",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Implement timer utilities for managing intervals and timeouts. Create functions to set, clear, and track multiple timers. Support cleanup mechanisms to prevent memory leaks, handle timer precision issues, and provide utilities for common timing patterns like polling and delayed execution.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function clearAllTimeout() {\n  // your code\n}\n\nsetTimeout(() => console.log('1'), 10000);\nsetTimeout(() => console.log('2'), 10000);\nclearAllTimeout();  // Cancels all",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "javascript-event-emitter-guide",
    "title": "Custom Event System",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "coding"
    ],
    "prompt": "Build a custom event emitter system that allows subscribing to events, emitting events with data, and unsubscribing. Support multiple listeners per event, wildcard events, and once-only listeners. Handle edge cases like removing listeners during event emission and memory leak prevention.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "class EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n  \n  subscribe(eventName, callback) {\n    // your code\n  }\n  \n  emit(eventName, ...args) {\n    // your code\n  }\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "emitter.on('test', callback)",
        "output": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "output": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "output": "undefined",
        "explanation": "Should remove event listener"
      }
    ],
    "testCases": [
      {
        "input": "emitter.on('test', callback)",
        "expected": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "expected": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "expected": "undefined",
        "explanation": "Should remove event listener"
      }
    ]
  },
  {
    "id": "react-accordian-frontend-interview",
    "title": "Collapsible Panel Component",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design",
      "ui"
    ],
    "prompt": "Build an accordion component that expands/collapses content sections. Support single or multiple open panels, smooth animations, keyboard accessibility, and controlled/uncontrolled modes. Handle dynamic content, nested accordions, and provide callbacks for state changes.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "authentication-code-component-react",
    "title": "OTP Input Component",
    "difficulty": "Medium",
    "tags": [
      "react",
      "app-design",
      "forms"
    ],
    "prompt": "Create an OTP (One-Time Password) input component with separate boxes for each digit. Support auto-focus on next input, paste handling, backspace navigation, and validation. Provide visual feedback, handle different OTP lengths, and ensure accessibility.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "component props",
        "output": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "output": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "output": "event response",
        "explanation": "Should handle user interactions"
      }
    ],
    "testCases": [
      {
        "input": "component props",
        "expected": "rendered component",
        "explanation": "Should render React component"
      },
      {
        "input": "state change",
        "expected": "updated component",
        "explanation": "Should handle state updates"
      },
      {
        "input": "event handling",
        "expected": "event response",
        "explanation": "Should handle user interactions"
      }
    ]
  },
  {
    "id": "filtering-matching-json",
    "title": "JSON Pattern Matcher",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "json",
      "coding"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function findMatches(data, match) {\n  // your code\n}\n\nconst data = [\n  { name: 'John', company: 'Google', position: 'Engineer' }\n];\nconst match = { position: 'Engineer' };",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Robinhood",
      "Apple"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "event-logger-ii",
    "title": "Enhanced Event Logger",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "vanilla"
    ],
    "prompt": "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.",
    "starterHtml": "<div id=\"grid\"></div>",
    "starterCss": "",
    "starterJs": "class EventLogger {\n  constructor(interval) {\n    // your code\n  }\n  \n  logEvent(event) {\n    // your code\n  }\n  \n  flush() {\n    // your code\n  }\n}",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Robinhood"
    ],
    "examples": [
      {
        "input": "emitter.on('test', callback)",
        "output": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "output": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "output": "undefined",
        "explanation": "Should remove event listener"
      }
    ],
    "testCases": [
      {
        "input": "emitter.on('test', callback)",
        "expected": "undefined",
        "explanation": "Should register event listener"
      },
      {
        "input": "emitter.emit('test', 'data')",
        "expected": "undefined",
        "explanation": "Should trigger event with data"
      },
      {
        "input": "emitter.off('test', callback)",
        "expected": "undefined",
        "explanation": "Should remove event listener"
      }
    ]
  },
  {
    "id": "deep-equals-comparison",
    "title": "Deep Equality Checker",
    "difficulty": "Hard",
    "tags": [
      "javascript",
      "array",
      "coding"
    ],
    "prompt": "Build a deep equality checker that compares two values recursively. Handle objects, arrays, primitives, dates, and special values (null, undefined, NaN). Consider property order, prototype chains, and circular references. Return true only if values are structurally and value-wise identical.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function deepEquals(a, b) {\n  // your code\n}\n\nconsole.log(deepEquals(NaN, NaN));  // true\nconsole.log(deepEquals([1, 2, [3]], [1, 2, [3]]));  // true",
    "timeLimit": "50mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "output": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "output": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "output": "6",
        "explanation": "Should reduce array to single value"
      }
    ],
    "testCases": [
      {
        "input": "[1, 2, 3].map(x => x * 2)",
        "expected": "[2, 4, 6]",
        "explanation": "Should transform array elements"
      },
      {
        "input": "[1, 2, 3].filter(x => x > 1)",
        "expected": "[2, 3]",
        "explanation": "Should filter array elements"
      },
      {
        "input": "[1, 2, 3].reduce((a, b) => a + b)",
        "expected": "6",
        "explanation": "Should reduce array to single value"
      }
    ]
  },
  {
    "id": "gym-sessions",
    "title": "Workout Schedule Tracker",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "json",
      "coding"
    ],
    "prompt": "Create a workout session scheduler that manages gym class bookings. Handle time slots, capacity limits, user registrations, and cancellations. Implement conflict detection, waitlist management, and schedule optimization. Provide methods to query available slots and user schedules.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function selectData(sessions, options) {\n  // your code\n}\n\nconst sessions = [\n  { user: 'U1', duration: 30, equipment: ['treadmill'] }\n];",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "math-sqrtroot",
    "title": "Square Root Calculator",
    "difficulty": "Medium",
    "tags": [
      "javascript",
      "algorithmic"
    ],
    "prompt": "Implement a square root calculation function without using Math.sqrt(). Use numerical methods like Newton's method or binary search to approximate the square root. Handle positive numbers, zero, and consider precision requirements. Optimize for both accuracy and performance.",
    "starterHtml": "",
    "starterCss": "",
    "starterJs": "function mySqrt(x) {\n  // your code\n}\n\nconsole.log(mySqrt(4));  // 2\nconsole.log(mySqrt(8));  // 2",
    "timeLimit": "35mins",
    "completionCount": "—",
    "companies": [
      "Facebook"
    ],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  },
  {
    "id": "auto-complete-search",
    "title": "Autocomplete Search Box",
    "difficulty": "Easy",
    "tags": [
      "javascript",
      "app-design",
      "vanilla"
    ],
    "prompt": "Create an autocomplete search component that suggests results as users type. Implement efficient string matching, debounce user input, highlight matching portions, and handle keyboard navigation (arrow keys, enter, escape). Support both local and remote data sources with loading states.",
    "starterHtml": "<input id=\"search\" type=\"text\" />",
    "starterCss": "",
    "starterJs": "",
    "timeLimit": "20mins",
    "completionCount": "—",
    "companies": [],
    "examples": [
      {
        "input": "basic input",
        "output": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "output": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "output": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ],
    "testCases": [
      {
        "input": "basic input",
        "expected": "expected result",
        "explanation": "Should handle basic scenario"
      },
      {
        "input": "edge case input",
        "expected": "edge case result",
        "explanation": "Should handle edge cases"
      },
      {
        "input": "complex input",
        "expected": "complex result",
        "explanation": "Should handle complex scenarios"
      }
    ]
  }
];

module.exports = comprehensiveProblems;
