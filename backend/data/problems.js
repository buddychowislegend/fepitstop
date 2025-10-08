const problems = [
  {
    id: "two-sum",
    title: "Two Sum Variant (JS)",
    difficulty: "Easy",
    tags: ["arrays", "js"],
    prompt: "Given an array and a target, return indices of two numbers that add to target.",
    starterHtml: "",
    starterCss: "",
    starterJs: `function twoSum(nums, target){\n  // your code\n}\nconsole.log(twoSum([2,7,11,15],9));`,
    timeLimit: "10mins",
    examples: [
      {
        input: "twoSum([2,7,11,15], 9)",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1]."
      },
      {
        input: "twoSum([3,2,4], 6)",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6, so we return [1, 2]."
      }
    ],
    testCases: [
      {
        input: "[[2,7,11,15], 9]",
        expected: "[0,1]",
        explanation: "2 + 7 = 9"
      },
      {
        input: "[[3,2,4], 6]",
        expected: "[1,2]",
        explanation: "2 + 4 = 6"
      },
      {
        input: "[[3,3], 6]",
        expected: "[0,1]",
        explanation: "3 + 3 = 6, same value but different indices"
      }
    ]
  },
  {
    id: "debounce",
    title: "Implement debounce()",
    difficulty: "Easy",
    tags: ["js", "functions"],
    prompt: "Implement a debounce utility that delays invoking a function until after wait ms.",
    starterHtml: "",
    starterCss: "",
    starterJs: `function debounce(func, delay){\n  let id;\n  return (...args)=>{\n    clearTimeout(id);\n    id = setTimeout(()=>func.apply(this,args), delay);\n  };\n}\n`,
    timeLimit: "15mins",
    examples: [
      {
        input: "Rapid calls within delay period",
        output: "Only the last call executes after delay",
        explanation: "If debounce(fn, 300) is called 5 times within 300ms, only the last call will execute after 300ms from the last invocation."
      }
    ],
    testCases: [
      {
        input: "Multiple rapid calls",
        expected: "Function executes only once after delay",
        explanation: "Debounce should cancel previous timers and only execute the last call"
      },
      {
        input: "Call, wait for delay, call again",
        expected: "Function executes twice (once per delayed period)",
        explanation: "Each call after the delay period should execute independently"
      },
      {
        input: "Pass arguments to debounced function",
        expected: "Arguments are correctly passed to the original function",
        explanation: "Debounce should preserve function arguments"
      }
    ]
  },
  {
    id: "throttle",
    title: "Implement throttle()",
    difficulty: "Medium",
    tags: ["js", "functions"],
    prompt: "Implement throttle that ensures a function is called at most once in N ms.",
    starterHtml: "",
    starterCss: "",
    starterJs: `function throttle(func, delay){\n  let last = 0;\n  return (...args)=>{\n    const now = Date.now();\n    if(now - last >= delay){\n      last = now;\n      func.apply(this,args);\n    }\n  };\n}\n`,
    timeLimit: "15mins",
    examples: [
      {
        input: "10 rapid calls with 100ms throttle",
        output: "Function executes immediately, then waits 100ms between subsequent calls",
        explanation: "First call executes immediately, subsequent calls are throttled to execute at most once per 100ms."
      }
    ],
    testCases: [
      {
        input: "Rapid scroll events",
        expected: "Function executes at regular intervals (e.g., every 100ms)",
        explanation: "Throttle should execute the function at the start and then at fixed intervals"
      },
      {
        input: "First call",
        expected: "Executes immediately",
        explanation: "The first call to a throttled function should execute right away"
      },
      {
        input: "Multiple calls within throttle window",
        expected: "Only first call executes, others are ignored",
        explanation: "Calls made before the throttle period expires should be ignored"
      }
    ]
  },
  {
    id: "virtualize",
    title: "List Virtualization",
    difficulty: "Hard",
    tags: ["react", "performance"],
    prompt: "Render a long list efficiently by virtualizing rows.",
    starterHtml: `<div id=app></div>`,
    starterCss: "",
    starterJs: "",
    timeLimit: "45mins",
    examples: [
      {
        input: "Array of 10,000 items",
        output: "Only visible items (e.g., 20) are rendered in DOM",
        explanation: "Virtual scrolling only renders items that are visible in the viewport, improving performance dramatically for large lists."
      }
    ],
    testCases: [
      {
        input: "List with 10,000 items, viewport shows 20",
        expected: "Only ~20-30 DOM nodes rendered",
        explanation: "Should render visible items plus a buffer for smooth scrolling"
      },
      {
        input: "Scroll to bottom",
        expected: "DOM nodes are recycled, new items rendered",
        explanation: "As user scrolls, old items are removed and new ones added"
      },
      {
        input: "Variable height items",
        expected: "Correctly calculates positions and renders items",
        explanation: "Advanced: Handle items with different heights dynamically"
      }
    ]
  },
  {
    id: "autocomplete",
    title: "Autocomplete Component",
    difficulty: "Medium",
    tags: ["react", "ui"],
    prompt: "Build an autocomplete input with suggestions and keyboard navigation.",
    starterHtml: "",
    starterCss: "",
    starterJs: "",
    timeLimit: "30mins",
    examples: [
      {
        input: "User types 'ja'",
        output: "Shows suggestions: ['JavaScript', 'Java', 'Jakarta']",
        explanation: "Filter suggestions based on input and display them in a dropdown below the input field."
      }
    ],
    testCases: [
      {
        input: "Type 'react'",
        expected: "Shows filtered suggestions containing 'react'",
        explanation: "Should filter and display matching suggestions"
      },
      {
        input: "Press Arrow Down",
        expected: "Highlights first suggestion",
        explanation: "Keyboard navigation should work with arrow keys"
      },
      {
        input: "Press Enter on highlighted suggestion",
        expected: "Fills input with selected suggestion",
        explanation: "Should select highlighted item on Enter key"
      },
      {
        input: "Click outside autocomplete",
        expected: "Closes suggestion dropdown",
        explanation: "Should handle click outside to close suggestions"
      }
    ]
  },
  {
    id: "grid-layout",
    title: "Responsive Grid Layout",
    difficulty: "Easy",
    tags: ["css", "layout"],
    prompt: "Create a responsive grid that maintains aspect ratio cards.",
    starterHtml: `<div class=grid></div>`,
    starterCss: `.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}`,
    starterJs: "",
    timeLimit: "20mins",
    examples: [
      {
        input: "Container width: 1200px",
        output: "Grid shows 4-6 columns with equal-width cards",
        explanation: "CSS Grid auto-fill creates responsive columns that adjust based on container width."
      }
    ],
    testCases: [
      {
        input: "Desktop viewport (1200px)",
        expected: "4-6 columns displayed",
        explanation: "Should show multiple columns on wide screens"
      },
      {
        input: "Tablet viewport (768px)",
        expected: "2-3 columns displayed",
        explanation: "Should adapt to medium-sized screens"
      },
      {
        input: "Mobile viewport (375px)",
        expected: "1-2 columns displayed",
        explanation: "Should stack nicely on mobile devices"
      },
      {
        input: "Cards with images",
        expected: "Maintains aspect ratio (e.g., 16:9 or 1:1)",
        explanation: "Cards should maintain consistent aspect ratio across all sizes"
      }
    ]
  },
  // Riddles as problems (non-coding)
  {
    id: "riddle-bridge-crossing",
    title: "Riddle: Bridge and Torch (Minimum Time)",
    difficulty: "Easy",
    tags: ["riddle", "logic"],
    prompt: "Four people take 1, 2, 7, and 10 minutes to cross a bridge at night. One torch, at most two can cross at a time, and the crossing time is the slower person's time. What is the minimum total time?",
    starterHtml: "",
    starterCss: "",
    starterJs: "",
    timeLimit: "2mins",
    examples: [
      {
        input: "People with crossing times: [1, 2, 7, 10] minutes",
        output: "17 minutes",
        explanation: "Optimal strategy:\n1. Person 1 and 2 cross together (2 min) - Total: 2\n2. Person 1 returns (1 min) - Total: 3\n3. Person 7 and 10 cross together (10 min) - Total: 13\n4. Person 2 returns (2 min) - Total: 15\n5. Person 1 and 2 cross together (2 min) - Total: 17"
      }
    ],
    testCases: [
      {
        input: "[1, 2, 7, 10]",
        expected: "17",
        explanation: "The two slowest people (7, 10) should cross together to minimize their impact"
      },
      {
        input: "[1, 2, 5, 10]",
        expected: "17",
        explanation: "Similar strategy: 1&2 cross (2), 1 returns (1), 5&10 cross (10), 2 returns (2), 1&2 cross (2) = 17"
      },
      {
        input: "[5, 10, 20, 25]",
        expected: "60",
        explanation: "Strategy: 5&10 cross (10), 5 returns (5), 20&25 cross (25), 10 returns (10), 5&10 cross (10) = 60"
      }
    ]
  },
  {
    id: "riddle-wolf-goat-cabbage",
    title: "Riddle: Wolf, Goat, Cabbage (Min Crossings)",
    difficulty: "Easy",
    tags: ["riddle", "logic"],
    prompt: "A farmer must carry a wolf, a goat, and a cabbage across a river. The boat holds only one item with the farmer. He cannot leave the wolf with the goat, or the goat with the cabbage. What is the minimum number of crossings?",
    starterHtml: "",
    starterCss: "",
    starterJs: "",
    timeLimit: "5mins",
    examples: [
      {
        input: "Items: Wolf, Goat, Cabbage",
        output: "7 crossings",
        explanation: "Optimal solution:\n1. Take goat across → \n2. Return alone ←\n3. Take wolf across →\n4. Bring goat back ←\n5. Take cabbage across →\n6. Return alone ←\n7. Take goat across →\nTotal: 7 crossings"
      }
    ],
    testCases: [
      {
        input: "[Wolf, Goat, Cabbage]",
        expected: "7",
        explanation: "The goat must be moved twice (across and back) to prevent it from being left with either wolf or cabbage"
      },
      {
        input: "Why can't wolf be left with goat?",
        expected: "Wolf will eat the goat",
        explanation: "Constraint: Wolf cannot be left alone with goat"
      },
      {
        input: "Why can't goat be left with cabbage?",
        expected: "Goat will eat the cabbage",
        explanation: "Constraint: Goat cannot be left alone with cabbage"
      }
    ]
  },
];

module.exports = { problems };

