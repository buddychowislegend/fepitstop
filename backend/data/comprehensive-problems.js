// Comprehensive Frontend Interview Problems
// 50+ problems covering JavaScript, React, CSS, and more

const comprehensiveProblems = [
  // JavaScript Fundamentals (15 problems)
  {
    id: "two-sum",
    title: "Two Sum Variant (JS)",
    difficulty: "Easy",
    tags: ["arrays", "js"],
    prompt: "Given an array and a target, return indices of two numbers that add to target.",
    starterHtml: "",
    starterCss: "",
    starterJs: "function twoSum(nums, target){\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\nconsole.log(twoSum([2,7,11,15],9));",
    timeLimit: "10mins",
    completionCount: "45.2k done",
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
        expected: "[0,1]"
      },
      {
        input: "[[3,2,4], 6]",
        expected: "[1,2]"
      },
      {
        input: "[[3,3], 6]",
        expected: "[0,1]"
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
    starterJs: "function debounce(func, delay){\n  let id;\n  return (...args)=>{\n    clearTimeout(id);\n    id = setTimeout(()=>func.apply(this,args), delay);\n  };\n}"
  },
  {
    id: "throttle",
    title: "Implement throttle()",
    difficulty: "Medium",
    tags: ["js", "functions"],
    prompt: "Implement throttle that ensures a function is called at most once in N ms.",
    starterHtml: "",
    starterCss: "",
    starterJs: "function throttle(func, delay){\n  let last = 0;\n  return (...args)=>{\n    const now = Date.now();\n    if(now - last >= delay){\n      last = now;\n      func.apply(this,args);\n    }\n  };\n}"
  },
  {
    id: "closure-counter",
    title: "Closure Counter",
    difficulty: "Easy",
    tags: ["js", "closures"],
    prompt: "Create a counter using closure that increments and returns the count.",
    starterHtml: "",
    starterCss: "",
    starterJs: "function createCounter() {\n  let count = 0;\n  return function() {\n    return count++;\n  };\n}\nconst counter = createCounter();\nconsole.log(counter()); // 0\nconsole.log(counter()); // 1",
    timeLimit: "5mins",
    completionCount: "17.6k done",
    examples: [
      {
        input: "const counter = createCounter();\ncounter();\ncounter();\ncounter();",
        output: "0\n1\n2",
        explanation: "The counter starts at 0 and increments by 1 each time it's called."
      }
    ],
    testCases: [
      {
        input: "[]",
        expected: "0"
      },
      {
        input: "[]",
        expected: "1"
      },
      {
        input: "[]",
        expected: "2"
      }
    ]
  },
  {
    id: "promise-all",
    title: "Implement Promise.all()",
    difficulty: "Medium",
    tags: ["js", "promises"],
    prompt: "Implement your own version of Promise.all() that handles an array of promises.",
    starterHtml: "",
    starterCss: "",
    starterJs: "function myPromiseAll(promises) {\n  // your code\n}\n\n// Test with:\n// myPromiseAll([Promise.resolve(1), Promise.resolve(2)]).then(console.log);"
  },
  {
    id: "deep-clone",
    title: "Deep Clone Object",
    difficulty: "Medium",
    tags: ["js", "objects"],
    prompt: "Implement a deep clone function that handles nested objects and arrays.",
    starterHtml: "",
    starterCss: "",
    starterJs: "function deepClone(obj) {\n  // your code\n}\n\nconst original = { a: 1, b: { c: 2 } };\nconst cloned = deepClone(original);"
  },
  {
    id: "curry-function",
    title: "Curry Function",
    difficulty: "Medium",
    tags: ["js", "functions"],
    prompt: "Implement a curry function that allows partial application of arguments.",
    starterHtml: "",
    starterCss: "",
    starterJs: "function curry(fn) {\n  // your code\n}\n\nconst add = (a, b, c) => a + b + c;\nconst curriedAdd = curry(add);\nconsole.log(curriedAdd(1)(2)(3)); // 6"
  },
  {
    id: "memoization",
    title: "Memoization",
    difficulty: "Medium",
    tags: ["js", "optimization"],
    prompt: "Implement a memoization function that caches results of expensive computations.",
    starterHtml: "",
    starterCss: "",
    starterJs: "function memoize(fn) {\n  // your code\n}\n\nconst expensiveFunction = (n) => {\n  console.log('Computing...');\n  return n * n;\n};\nconst memoizedFn = memoize(expensiveFunction);"
  },
  {
    id: "event-emitter",
    title: "Event Emitter",
    difficulty: "Medium",
    tags: ["js", "events"],
    prompt: "Implement a simple event emitter with on, off, and emit methods.",
    starterHtml: "",
    starterCss: "",
    starterJs: "class EventEmitter {\n  // your code\n}\n\nconst emitter = new EventEmitter();\nemitter.on('test', (data) => console.log(data));\nemitter.emit('test', 'Hello World');"
  },
  {
    id: "async-queue",
    title: "Async Queue",
    difficulty: "Hard",
    tags: ["js", "async"],
    prompt: "Implement a queue that processes async tasks with concurrency limit.",
    starterHtml: "",
    starterCss: "",
    starterJs: "class AsyncQueue {\n  constructor(concurrency = 1) {\n    // your code\n  }\n  \n  add(task) {\n    // your code\n  }\n}"
  },
  {
    id: "bind-implementation",
    title: "Implement Function.bind()",
    difficulty: "Medium",
    tags: ["js", "functions"],
    prompt: "Implement your own version of Function.prototype.bind()",
    starterHtml: "",
    starterCss: "",
    starterJs: "Function.prototype.myBind = function(context, ...args) {\n  // your code\n};\n\nconst obj = { name: 'John' };\nfunction greet(greeting) {\n  return `${greeting}, ${this.name}`;\n}\nconst boundGreet = greet.myBind(obj, 'Hello');"
  },
  {
    id: "flatten-array",
    title: "Flatten Nested Array",
    difficulty: "Easy",
    tags: ["js", "arrays"],
    prompt: "Flatten a nested array of any depth.",
    starterHtml: "",
    starterCss: "",
    starterJs: "function flatten(arr) {\n  // your code\n}\n\nconsole.log(flatten([1, [2, [3, 4]], 5])); // [1, 2, 3, 4, 5]"
  },
  {
    id: "group-by",
    title: "Group By Function",
    difficulty: "Medium",
    tags: ["js", "arrays"],
    prompt: "Implement a groupBy function that groups array elements by a key function.",
    starterHtml: "",
    starterCss: "",
    starterJs: "function groupBy(array, keyFn) {\n  // your code\n}\n\nconst people = [\n  { name: 'John', age: 25 },\n  { name: 'Jane', age: 25 },\n  { name: 'Bob', age: 30 }\n];\nconsole.log(groupBy(people, person => person.age));"
  },
  {
    id: "pipe-compose",
    title: "Pipe and Compose",
    difficulty: "Medium",
    tags: ["js", "functions"],
    prompt: "Implement pipe and compose functions for function composition.",
    starterHtml: "",
    starterCss: "",
    starterJs: "const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);\nconst compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);\n\n// Test:\nconst add1 = x => x + 1;\nconst multiply2 = x => x * 2;\nconst result = pipe(add1, multiply2)(5); // 12"
  },
  {
    id: "lazy-evaluation",
    title: "Lazy Evaluation",
    difficulty: "Hard",
    tags: ["js", "advanced"],
    prompt: "Implement a lazy evaluation system for expensive computations.",
    starterHtml: "",
    starterCss: "",
    starterJs: "class LazyValue {\n  constructor(computeFn) {\n    // your code\n  }\n  \n  get value() {\n    // your code\n  }\n}"
  },

  // React Problems (15 problems)
  {
    id: "virtualize",
    title: "List Virtualization",
    difficulty: "Hard",
    tags: ["react", "performance"],
    prompt: "Render a long list efficiently by virtualizing rows.",
    starterHtml: "<div id=app></div>",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "autocomplete",
    title: "Autocomplete Component",
    difficulty: "Medium",
    tags: ["react", "ui"],
    prompt: "Build an autocomplete input with suggestions and keyboard navigation.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "infinite-scroll",
    title: "Infinite Scroll",
    difficulty: "Medium",
    tags: ["react", "ui"],
    prompt: "Implement infinite scroll for a list of items with loading states.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "custom-hooks",
    title: "Custom Hooks",
    difficulty: "Medium",
    tags: ["react", "hooks"],
    prompt: "Create custom hooks for common functionality like API calls, local storage, and form handling.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "context-provider",
    title: "Context Provider",
    difficulty: "Medium",
    tags: ["react", "state"],
    prompt: "Implement a context provider for theme management with dark/light mode.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "error-boundary",
    title: "Error Boundary",
    difficulty: "Medium",
    tags: ["react", "error-handling"],
    prompt: "Create an error boundary component to catch and handle React errors gracefully.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "render-props",
    title: "Render Props Pattern",
    difficulty: "Medium",
    tags: ["react", "patterns"],
    prompt: "Implement a render props component for data fetching and loading states.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "higher-order-component",
    title: "Higher Order Component",
    difficulty: "Medium",
    tags: ["react", "patterns"],
    prompt: "Create a HOC for authentication that wraps components with auth logic.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "compound-components",
    title: "Compound Components",
    difficulty: "Hard",
    tags: ["react", "patterns"],
    prompt: "Build a compound component pattern for a flexible modal system.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "state-machine",
    title: "State Machine",
    difficulty: "Hard",
    tags: ["react", "state"],
    prompt: "Implement a state machine for complex component state management.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "optimization-techniques",
    title: "React Optimization",
    difficulty: "Medium",
    tags: ["react", "performance"],
    prompt: "Optimize a React component using memo, useMemo, useCallback, and other techniques.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "suspense-boundary",
    title: "Suspense Boundary",
    difficulty: "Hard",
    tags: ["react", "async"],
    prompt: "Implement React Suspense for data fetching with loading and error states.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "portal-component",
    title: "Portal Component",
    difficulty: "Medium",
    tags: ["react", "dom"],
    prompt: "Create a portal component for rendering outside the component tree.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "forward-ref",
    title: "Forward Ref",
    difficulty: "Medium",
    tags: ["react", "refs"],
    prompt: "Implement forwardRef for accessing DOM elements in custom components.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },
  {
    id: "concurrent-features",
    title: "Concurrent Features",
    difficulty: "Hard",
    tags: ["react", "advanced"],
    prompt: "Use React 18 concurrent features like useTransition and useDeferredValue.",
    starterHtml: "",
    starterCss: "",
    starterJs: ""
  },

  // CSS Problems (10 problems)
  {
    id: "grid-layout",
    title: "Responsive Grid Layout",
    difficulty: "Easy",
    tags: ["css", "layout"],
    prompt: "Create a responsive grid that maintains aspect ratio cards.",
    starterHtml: "<div class=grid></div>",
    starterCss: ".grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}",
    starterJs: ""
  },
  {
    id: "flexbox-center",
    title: "Flexbox Centering",
    difficulty: "Easy",
    tags: ["css", "layout"],
    prompt: "Center content both horizontally and vertically using flexbox.",
    starterHtml: "<div class=container><div class=content>Centered</div></div>",
    starterCss: ".container{height:100vh;display:flex;align-items:center;justify-content:center}",
    starterJs: ""
  },
  {
    id: "css-animations",
    title: "CSS Animations",
    difficulty: "Medium",
    tags: ["css", "animations"],
    prompt: "Create smooth animations for hover effects, loading states, and transitions.",
    starterHtml: "<div class=animated-box></div>",
    starterCss: ".animated-box{width:100px;height:100px;background:blue;transition:all 0.3s ease}",
    starterJs: ""
  },
  {
    id: "responsive-design",
    title: "Responsive Design",
    difficulty: "Medium",
    tags: ["css", "responsive"],
    prompt: "Create a responsive layout that works on mobile, tablet, and desktop.",
    starterHtml: "<div class=responsive-container></div>",
    starterCss: "@media (max-width: 768px) { /* mobile styles */ }",
    starterJs: ""
  },
  {
    id: "css-variables",
    title: "CSS Custom Properties",
    difficulty: "Easy",
    tags: ["css", "variables"],
    prompt: "Use CSS custom properties for theming and dynamic styling.",
    starterHtml: "<div class=themed-box></div>",
    starterCss: ":root{--primary-color:blue;--spacing:16px}",
    starterJs: ""
  },
  {
    id: "css-grid-complex",
    title: "Complex CSS Grid",
    difficulty: "Hard",
    tags: ["css", "grid"],
    prompt: "Create a complex grid layout with named grid lines and areas.",
    starterHtml: "<div class=complex-grid></div>",
    starterCss: ".complex-grid{display:grid;grid-template-areas:'header header' 'sidebar main' 'footer footer'}",
    starterJs: ""
  },
  {
    id: "css-clip-path",
    title: "CSS Clip Path",
    difficulty: "Medium",
    tags: ["css", "shapes"],
    prompt: "Create interesting shapes using CSS clip-path property.",
    starterHtml: "<div class=shaped-element></div>",
    starterCss: ".shaped-element{clip-path:polygon(50% 0%, 0% 100%, 100% 100%)}",
    starterJs: ""
  },
  {
    id: "css-scroll-snap",
    title: "Scroll Snap",
    difficulty: "Medium",
    tags: ["css", "scroll"],
    prompt: "Implement smooth scroll snapping for a carousel or gallery.",
    starterHtml: "<div class=scroll-container></div>",
    starterCss: ".scroll-container{scroll-snap-type:x mandatory;overflow-x:scroll}",
    starterJs: ""
  },
  {
    id: "css-backdrop-filter",
    title: "Backdrop Filter",
    difficulty: "Medium",
    tags: ["css", "effects"],
    prompt: "Create glassmorphism effects using backdrop-filter.",
    starterHtml: "<div class=glass-card></div>",
    starterCss: ".glass-card{backdrop-filter:blur(10px);background:rgba(255,255,255,0.1)}",
    starterJs: ""
  },
  {
    id: "css-container-queries",
    title: "Container Queries",
    difficulty: "Hard",
    tags: ["css", "responsive"],
    prompt: "Use container queries for component-based responsive design.",
    starterHtml: "<div class=container><div class=component></div></div>",
    starterCss: "@container (min-width: 300px) { .component { /* styles */ } }",
    starterJs: ""
  },

  // Advanced Problems (10 problems)
  {
    id: "web-workers",
    title: "Web Workers",
    difficulty: "Hard",
    tags: ["js", "performance"],
    prompt: "Implement Web Workers for heavy computations without blocking the UI.",
    starterHtml: "",
    starterCss: "",
    starterJs: "// main.js\nconst worker = new Worker('worker.js');\nworker.postMessage({ data: [1,2,3,4,5] });"
  },
  {
    id: "service-worker",
    title: "Service Worker",
    difficulty: "Hard",
    tags: ["js", "pwa"],
    prompt: "Implement a service worker for caching and offline functionality.",
    starterHtml: "",
    starterCss: "",
    starterJs: "// service-worker.js\nself.addEventListener('fetch', event => {\n  // your code\n});"
  },
  {
    id: "intersection-observer",
    title: "Intersection Observer",
    difficulty: "Medium",
    tags: ["js", "performance"],
    prompt: "Use Intersection Observer for lazy loading images and infinite scroll.",
    starterHtml: "",
    starterCss: "",
    starterJs: "const observer = new IntersectionObserver((entries) => {\n  // your code\n});"
  },
  {
    id: "drag-drop",
    title: "Drag and Drop",
    difficulty: "Medium",
    tags: ["js", "ui"],
    prompt: "Implement drag and drop functionality for reorderable lists.",
    starterHtml: "<div class=drag-container></div>",
    starterCss: ".draggable{cursor:move;user-select:none}",
    starterJs: ""
  },
  {
    id: "websocket-chat",
    title: "WebSocket Chat",
    difficulty: "Hard",
    tags: ["js", "websockets"],
    prompt: "Build a real-time chat application using WebSockets.",
    starterHtml: "<div id=chat-container></div>",
    starterCss: "",
    starterJs: "const socket = new WebSocket('ws://localhost:8080');"
  },
  {
    id: "file-upload",
    title: "File Upload with Progress",
    difficulty: "Medium",
    tags: ["js", "file-handling"],
    prompt: "Implement file upload with progress tracking and drag-and-drop support.",
    starterHtml: "<input type=file id=file-input>",
    starterCss: "",
    starterJs: "const fileInput = document.getElementById('file-input');"
  },
  {
    id: "canvas-drawing",
    title: "Canvas Drawing",
    difficulty: "Hard",
    tags: ["js", "canvas"],
    prompt: "Create a drawing application using HTML5 Canvas with brush tools.",
    starterHtml: "<canvas id=drawing-canvas></canvas>",
    starterCss: "",
    starterJs: "const canvas = document.getElementById('drawing-canvas');"
  },
  {
    id: "audio-visualizer",
    title: "Audio Visualizer",
    difficulty: "Hard",
    tags: ["js", "audio"],
    prompt: "Create an audio visualizer using Web Audio API and Canvas.",
    starterHtml: "<canvas id=visualizer></canvas>",
    starterCss: "",
    starterJs: "const audioContext = new AudioContext();"
  },
  {
    id: "pwa-manifest",
    title: "PWA Manifest",
    difficulty: "Medium",
    tags: ["js", "pwa"],
    prompt: "Create a Progressive Web App with manifest and install prompts.",
    starterHtml: "",
    starterCss: "",
    starterJs: "// manifest.json and service worker implementation"
  },
  {
    id: "micro-frontend",
    title: "Micro Frontend",
    difficulty: "Hard",
    tags: ["js", "architecture"],
    prompt: "Design a micro frontend architecture with module federation.",
    starterHtml: "",
    starterCss: "",
    starterJs: "// Module federation configuration"
  }
];

module.exports = comprehensiveProblems;
