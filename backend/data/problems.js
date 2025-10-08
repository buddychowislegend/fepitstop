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
  },
];

module.exports = { problems };

