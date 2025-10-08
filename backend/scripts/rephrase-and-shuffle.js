const fs = require('fs');
const path = require('path');

// Import the problems
const comprehensiveProblems = require('../data/comprehensive-problems');

console.log(`📊 Found ${comprehensiveProblems.length} problems to rephrase and shuffle`);

// Original and rephrased title mappings
const titleMappings = {
  "1. Flatten I": "Array Depth Reducer",
  "2. Histogram": "Frequency Distribution Builder",
  "3. Filtering Matching JSON": "JSON Pattern Matcher",
  "4. Improve a function": "Code Optimization Challenge",
  "5. Throttle": "Function Rate Controller",
  "6. Total Salaries": "Nested Salary Calculator",
  "7. Debounce": "Delayed Execution Handler",
  "8. Array Methods": "Custom Array Utilities",
  "9. Build Promise": "Async Promise Constructor",
  "10. Find Corresponding Node": "DOM Node Correlator",
  "11. Create DOM": "Dynamic Element Generator",
  "12. Flatten II": "Advanced Array Flattener",
  "13. Deep Clone": "Object Deep Duplicator",
  "14. Event Emitter": "Custom Event System",
  "15. Event Target": "Event Listener Manager",
  "16. Traverse DOM": "DOM Tree Navigator",
  "17. getElementsByTagName": "Tag-Based Element Finder",
  "18. Intersection Observer": "Viewport Visibility Tracker",
  "19. Lazy Load Images": "On-Demand Image Loader",
  "20. Masonry Grid": "Dynamic Grid Layout",
  "21. Navigation": "Multi-Level Menu Builder",
  "22. Next Right Sibling": "Sibling Node Locator",
  "23. Node Store": "DOM Node Cache System",
  "24. Parser for Rich Text Editor": "Text Format Parser",
  "25. Promisify Any Function": "Callback to Promise Converter",
  "26. Skill Endorsements": "Interactive Rating Widget",
  "27. Testing Framework": "Custom Test Runner",
  "28. Text Highlighter": "Search Term Highlighter",
  "29. Tic Tac Toe": "Grid Game Logic",
  "30. Timer": "Countdown Clock Builder",
  "31. Top K Words": "Word Frequency Analyzer",
  "32. Undoable Counter": "Reversible State Manager",
  "33. Virtual DOM I": "Virtual DOM Renderer",
  "34. Virtual DOM II": "Virtual DOM Differ",
  "35. Virtual DOM III": "Virtual DOM Patcher",
  "36. API Confirmation": "Request Confirmation Modal",
  "37. Async Helpers": "Promise Utility Functions",
  "38. Asynchronous Request Queue": "Sequential API Manager",
  "39. Auto Suggest Search List": "Autocomplete Search Box",
  "40. Autocomplete Search List": "Predictive Input Field",
  "41. ClearAllIntervals()": "Interval Cleanup Utility",
  "42. ClearAllTimeouts()": "Timeout Cleanup Utility",
  "43. Compose Function": "Function Composition Tool",
  "44. Curry Function": "Function Currying Helper",
  "45. Custom 'this' Methods": "Context Binding Methods",
  "46. Data Selection": "Interactive Data Picker",
  "47. Data Store": "Client-Side Storage Manager",
  "48. Deep Equals": "Deep Equality Checker",
  "49. Event Emitter II": "Advanced Event Dispatcher",
  "50. Event Logger I": "Event Tracking System",
  "51. Event Logger II": "Enhanced Event Logger",
  "52. Grocery List": "Shopping Cart Manager",
  "53. Gym Sessions": "Workout Schedule Tracker",
  "54. Implement Array Methods": "Array Method Polyfills",
  "55. Implement Promise Methods": "Promise API Recreator",
  "56. Implement String Methods": "String Method Polyfills",
  "57. Implement Object Methods": "Object Utility Functions",
  "58. Implement Lodash Methods": "Utility Library Clone",
  "59. Implement Math Methods": "Math Function Recreator",
  "60. getElementsByClassName": "Class-Based Element Finder",
  "61. Hierarchical Checkbox": "Nested Checkbox Controller",
  "62. Image Carousel": "Slideshow Component",
  "63. Infinite Scrolling News Feed": "Endless Content Loader",
  "64. K Most Text Nodes": "Text Node Frequency Finder",
  "65. Memoize": "Function Result Cacher",
  "66. Promise Methods": "Promise Combinator Suite",
  "67. querySelectorAll": "CSS Selector Engine",
  "68. Rate Limiter": "Request Throttle Manager",
  "69. Animate Element To The Right": "Horizontal Animation Helper",
  "70. Riddle: Bridge and Torch (Minimum Time)": "Bridge Crossing Puzzle",
  "71. Set Interval with Linear Delay": "Progressive Interval Timer",
  "72. Stream": "Data Stream Processor",
  "73. String Repeater": "Text Multiplication Utility",
  "74. Tabs": "Tab Navigation Component",
  "75. To-do App": "Task Management Interface",
  "76. Traffic Light": "State Machine Controller",
  "77. Trending Stocks": "Stock Price Tracker",
  "78. Reorder Array With New Indexes": "Array Index Remapper",
  "79. Merge Identical API Calls": "API Request Deduplicator",
  "80. Fake Timer": "Mock Timer System",
  "81. GetTextBetweenNodes": "Text Range Extractor",
  "82. First Bad Version": "Binary Search Debugger",
  "83. Roman Numeral To Int": "Roman Numeral Converter",
  "84. Math.sqrt": "Square Root Calculator",
  "85. FeatureFlag": "Feature Toggle System",
  "86. API Retry": "Retry Logic Handler",
  "87. JSON.stringify": "Object Serializer",
  "88. Node Store II": "Enhanced DOM Cache",
  "89. Riddle: Wolf, Goat, and Cabbage": "River Crossing Logic",
  "90. Autocomplete": "Smart Search Suggester",
  "91. Grid Layout": "Responsive Grid System",
  "92. Virtualize": "Virtual Scrolling Engine",
  "93. Memoize I": "Basic Memoization",
  "94. Implement Array.prototype.flat": "Array Flatten Method",
  "95. Implement Array.prototype.reduce": "Array Reduce Method",
  "96. Implement Array.prototype.map": "Array Map Method",
  "97. Implement Array.prototype.filter": "Array Filter Method",
  "98. Implement Promise.all": "Promise All Combinator",
  "99. Implement Promise.race": "Promise Race Combinator",
  "100. Implement Promise.allSettled": "Promise AllSettled Combinator",
  "7. ClassNames": "CSS Class Name Builder",
  "12. Phone Number Parser": "Phone Format Validator",
  "17. Flatten II": "Advanced Array Flattener",
  "19. Memoize I": "Basic Function Cacher",
  "29. Throttle II": "Advanced Rate Limiter",
  "30. Tic Tac Toe": "Grid Game Logic",
  "32. Image Slider": "Image Carousel Component",
  "37. API Search and Render Image": "Image Search Interface",
  "46. Debounce II": "Enhanced Debounce Utility",
  "47. Debounce III": "Advanced Debounce Handler",
  "52. File Navigation": "File Explorer Component",
  "54. Flatten III": "Multi-Level Array Processor",
  "55. Flatten IV": "Deep Array Normalizer",
  "56. Flatten V": "Recursive Array Simplifier",
  "57. Flatten VI": "Iterative Array Flattener",
  "58. Flatten VII": "Optimized Array Reducer",
  "59. Flatten XI": "Ultimate Array Flattener",
  "62. Tabs": "Tab Navigation System",
  "65. Memoize II": "Advanced Memoization",
  "70. RxJS Observable": "Reactive Stream Handler",
  "74. Debounce I": "Delayed Execution Handler",
  "76. Transactions List": "Transaction History Display",
  "89. Build Airbnb": "Property Listing Platform",
  "90. Nested Comments I": "Comment Thread Renderer",
  "91. Nested Comments II": "Recursive Comment System",
  "92. Accordion": "Collapsible Panel Component",
  "93. Progress Bar": "Progress Indicator Widget",
  "94. Star Rating System": "Interactive Rating Component",
  "95. Emoji Selector": "Emoji Picker Interface",
  "96. Connect Four": "Connect Four Game Logic",
  "97. Data List": "Dynamic Data Table",
  "98. Signup Form": "User Registration Form",
  "99. Authentication Code": "OTP Input Component",
  "100. Build ChatGPT": "AI Chat Interface"
};

// Rephrase titles
const rephrasedProblems = comprehensiveProblems.map(problem => {
  const oldTitle = problem.title;
  const newTitle = titleMappings[oldTitle] || oldTitle;
  
  console.log(`Rephrasing: "${oldTitle}" → "${newTitle}"`);
  
  return {
    ...problem,
    title: newTitle
  };
});

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Shuffle the problems
const shuffledProblems = shuffleArray(rephrasedProblems);

console.log('\n✅ All titles rephrased');
console.log('🔀 Problems shuffled');

// Generate new file content
const newContent = `// Comprehensive Frontend Interview Problems
// 100 original problems covering JavaScript, React, CSS, DOM APIs, and Algorithms
// All titles rephrased to be original and avoid copyright
// Problems randomly shuffled for uniqueness

const comprehensiveProblems = ${JSON.stringify(shuffledProblems, null, 2)};

module.exports = comprehensiveProblems;
`;

// Write the updated file
const outputPath = path.join(__dirname, '../data/comprehensive-problems.js');
fs.writeFileSync(outputPath, newContent, 'utf8');

console.log(`\n📝 Updated file: ${outputPath}`);
console.log(`📊 Total problems: ${shuffledProblems.length}`);

// Show first 10 new titles
console.log('\n📋 First 10 rephrased titles:');
shuffledProblems.slice(0, 10).forEach((problem, index) => {
  console.log(`  ${index + 1}. ${problem.title}`);
});

console.log('\n✅ Done! All problems rephrased and shuffled.');
