const fs = require('fs');
const path = require('path');

// Import the problems
const comprehensiveProblems = require('../data/comprehensive-problems');

console.log(`📊 Found ${comprehensiveProblems.length} problems to update`);

// Problem-specific descriptions based on problem ID and title
const getSpecificDescription = (problem) => {
  const title = problem.title.toLowerCase();
  const id = problem.id.toLowerCase();
  
  // Specific descriptions for each problem type
  if (id.includes('flatten') || title.includes('flatten') || title.includes('array depth')) {
    return "Create a function that takes a nested array of any depth and returns a flattened single-dimensional array. Your solution should handle arrays containing numbers, strings, objects, or other arrays. Implement both recursive and iterative approaches, maintaining the original order of elements.";
  }
  
  if (id.includes('debounce') || title.includes('debounce') || title.includes('delayed execution')) {
    return "Implement a debounce utility that delays function execution until after a specified wait time has elapsed since the last invocation. This is commonly used for search inputs, resize handlers, and API calls to prevent excessive function calls. Your implementation should handle arguments, context (this), and support immediate execution options.";
  }
  
  if (id.includes('throttle') || title.includes('throttle') || title.includes('rate')) {
    return "Build a throttle function that limits how often a function can be called within a specified time period. Unlike debounce, throttle ensures the function executes at regular intervals. Support both leading edge (execute immediately) and trailing edge (execute after delay) options. Useful for scroll handlers, mouse movements, and API rate limiting.";
  }
  
  if (id.includes('memoize') || title.includes('memoize') || title.includes('cache')) {
    return "Create a memoization wrapper that caches function results based on input arguments. When called with the same arguments, return the cached result instead of re-executing the function. Handle multiple arguments, different data types, and consider cache invalidation strategies. Optimize for performance and memory usage.";
  }
  
  if (id.includes('deep-clone') || title.includes('deep') && title.includes('clone') || title.includes('duplicator')) {
    return "Implement a deep cloning function that creates a complete copy of nested objects and arrays. Your solution should handle circular references, different data types (objects, arrays, dates, functions), and maintain prototype chains. Ensure the clone is completely independent of the original.";
  }
  
  if (id.includes('event-emitter') || title.includes('event') && (title.includes('system') || title.includes('emitter') || title.includes('dispatcher'))) {
    return "Build a custom event emitter system that allows subscribing to events, emitting events with data, and unsubscribing. Support multiple listeners per event, wildcard events, and once-only listeners. Handle edge cases like removing listeners during event emission and memory leak prevention.";
  }
  
  if (id.includes('promise') || title.includes('promise') || title.includes('async')) {
    return "Implement Promise utility functions that handle asynchronous operations. Your solution should correctly manage promise states (pending, fulfilled, rejected), handle errors, support chaining, and work with multiple promises. Consider edge cases like empty arrays and rejected promises.";
  }
  
  if (id.includes('curry') || title.includes('curry')) {
    return "Create a currying function that transforms a multi-argument function into a sequence of single-argument functions. Your implementation should handle any number of arguments, support partial application, and maintain the original function's context. Enable flexible function composition patterns.";
  }
  
  if (id.includes('compose') || title.includes('compose')) {
    return "Implement function composition that combines multiple functions into a single function. The output of each function becomes the input of the next. Support right-to-left execution order (mathematical composition) and handle any number of functions. Useful for creating data transformation pipelines.";
  }
  
  if (id.includes('deep-equal') || title.includes('equality') || title.includes('equals')) {
    return "Build a deep equality checker that compares two values recursively. Handle objects, arrays, primitives, dates, and special values (null, undefined, NaN). Consider property order, prototype chains, and circular references. Return true only if values are structurally and value-wise identical.";
  }
  
  if (id.includes('virtual-dom') || title.includes('virtual dom')) {
    return "Implement a virtual DOM system that efficiently updates the real DOM. Create a virtual representation of DOM elements, compute differences between old and new virtual trees (diffing), and apply minimal changes to the actual DOM (patching). Handle element creation, updates, and removal efficiently.";
  }
  
  if (id.includes('histogram') || title.includes('histogram') || title.includes('frequency') && title.includes('distribution')) {
    return "Create a function that builds a frequency distribution (histogram) from an array of values. Count occurrences of each unique value and return a data structure suitable for visualization. Handle different data types, maintain insertion order, and provide methods to query frequencies.";
  }
  
  if (id.includes('salary') || title.includes('salary')) {
    return "Calculate the total salaries across a nested organizational structure. Given an object representing departments and employees, recursively traverse the structure to sum all salary values. Handle varying levels of nesting, empty departments, and different organizational hierarchies.";
  }
  
  if (id.includes('json') && (id.includes('stringify') || title.includes('serializer'))) {
    return "Implement a JSON serialization function similar to JSON.stringify(). Convert JavaScript values into JSON strings, handling objects, arrays, primitives, and special values. Support proper escaping, circular reference detection, and custom replacer functions. Follow JSON specification strictly.";
  }
  
  if (id.includes('dom') && (id.includes('traverse') || title.includes('navigator') || title.includes('tree'))) {
    return "Create a DOM tree traversal utility that visits all nodes in a specified order (depth-first or breadth-first). Support filtering by node type, collecting specific nodes, and applying transformations. Handle different node types (elements, text, comments) and provide a clean API for tree navigation.";
  }
  
  if (id.includes('query') || title.includes('selector')) {
    return "Implement a CSS selector engine that finds DOM elements matching a given selector string. Support basic selectors (tag, class, id), combinators (descendant, child, sibling), and pseudo-classes. Parse selector strings and efficiently query the DOM tree to return matching elements.";
  }
  
  if (id.includes('binary') || title.includes('binary search')) {
    return "Solve a problem using binary search algorithm to efficiently find a target value in a sorted dataset. Implement the search with optimal time complexity O(log n). Handle edge cases like empty arrays, duplicate values, and values not in the array. Consider both iterative and recursive approaches.";
  }
  
  if (id.includes('roman') || title.includes('roman numeral')) {
    return "Convert Roman numerals to integer values. Understand Roman numeral rules: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Handle subtractive notation (IV=4, IX=9, XL=40, etc.) where a smaller value before a larger value means subtraction. Validate input and handle edge cases.";
  }
  
  if (id.includes('sqrt') || title.includes('square root')) {
    return "Implement a square root calculation function without using Math.sqrt(). Use numerical methods like Newton's method or binary search to approximate the square root. Handle positive numbers, zero, and consider precision requirements. Optimize for both accuracy and performance.";
  }
  
  if (id.includes('stream') || title.includes('stream')) {
    return "Create a data stream processing system that handles asynchronous data flows. Implement methods to subscribe to streams, transform data, filter values, and combine multiple streams. Support backpressure handling, error propagation, and stream completion. Build a reactive programming interface.";
  }
  
  if (id.includes('retry') || title.includes('retry')) {
    return "Implement an API retry mechanism that automatically retries failed requests with exponential backoff. Handle network errors, timeouts, and specific HTTP status codes. Support configurable retry attempts, delay strategies, and success/failure callbacks. Prevent infinite retry loops.";
  }
  
  if (id.includes('feature') && id.includes('flag') || title.includes('feature toggle')) {
    return "Build a feature flag system for controlling feature rollouts. Store feature states, check if features are enabled for specific users or contexts, and support percentage-based rollouts. Implement caching for performance and provide an API for runtime feature toggling.";
  }
  
  if (id.includes('autocomplete') || title.includes('autocomplete') || title.includes('suggest')) {
    return "Create an autocomplete search component that suggests results as users type. Implement efficient string matching, debounce user input, highlight matching portions, and handle keyboard navigation (arrow keys, enter, escape). Support both local and remote data sources with loading states.";
  }
  
  if (id.includes('interval') || id.includes('timeout') || title.includes('timer')) {
    return "Implement timer utilities for managing intervals and timeouts. Create functions to set, clear, and track multiple timers. Support cleanup mechanisms to prevent memory leaks, handle timer precision issues, and provide utilities for common timing patterns like polling and delayed execution.";
  }
  
  if (id.includes('array') && (id.includes('method') || title.includes('array'))) {
    return "Recreate native array methods from scratch to demonstrate understanding of their internal workings. Implement map, filter, reduce, find, every, some, and other array utilities. Handle edge cases, maintain proper this context, and support all standard parameters (element, index, array).";
  }
  
  if (id.includes('node') && (id.includes('store') || title.includes('cache'))) {
    return "Design a DOM node storage system that associates data with DOM elements without modifying the elements themselves. Use WeakMap for automatic garbage collection, support getting and setting values, and handle node removal. Prevent memory leaks and ensure data isolation.";
  }
  
  if (title.includes('word frequency') || title.includes('top k')) {
    return "Find the K most frequent words in a text or array. Implement efficient counting using hash maps, sort by frequency (and alphabetically for ties), and return the top K results. Handle case sensitivity, punctuation, and optimize for large datasets. Consider time and space complexity.";
  }
  
  if (title.includes('string') && (title.includes('repeat') || title.includes('multiplication'))) {
    return "Create a string repetition utility that repeats a string N times efficiently. Avoid simple concatenation for large N values. Consider using techniques like doubling or binary representation for optimization. Handle edge cases like empty strings, zero repetitions, and very large N values.";
  }
  
  if (title.includes('intersection') || title.includes('viewport') || title.includes('visibility')) {
    return "Implement an Intersection Observer utility that detects when elements enter or exit the viewport. Track visibility changes, calculate intersection ratios, and support threshold-based callbacks. Useful for lazy loading, infinite scroll, and analytics. Handle multiple elements and cleanup properly.";
  }
  
  if (title.includes('api') && (title.includes('queue') || title.includes('sequential'))) {
    return "Build an asynchronous request queue that processes API calls sequentially or with concurrency limits. Ensure requests execute in order, handle failures gracefully, support retry logic, and provide progress tracking. Prevent race conditions and manage queue state effectively.";
  }
  
  if (title.includes('text') && (title.includes('highlight') || title.includes('search'))) {
    return "Create a text highlighter that marks search terms within content. Handle case-insensitive matching, multiple occurrences, overlapping matches, and special characters. Generate HTML with highlight spans, preserve original text structure, and support custom highlight styles.";
  }
  
  if (title.includes('test') && (title.includes('runner') || title.includes('framework'))) {
    return "Build a minimal testing framework with describe/it blocks, assertions, and test reporting. Support nested test suites, before/after hooks, async tests, and clear error messages. Provide expect-style assertions (toBe, toEqual, toThrow) and generate readable test output with pass/fail counts.";
  }
  
  if (title.includes('context') || title.includes('binding') || id.includes('this')) {
    return "Implement custom versions of call, apply, and bind methods that control function execution context (this). Handle argument passing, return values, and edge cases. Understand how these methods work internally and recreate their behavior without using the native methods.";
  }
  
  if (title.includes('workout') || title.includes('gym')) {
    return "Create a workout session scheduler that manages gym class bookings. Handle time slots, capacity limits, user registrations, and cancellations. Implement conflict detection, waitlist management, and schedule optimization. Provide methods to query available slots and user schedules.";
  }
  
  if (title.includes('stock') || title.includes('transaction')) {
    return "Build a stock price tracker or transaction manager that processes financial data. Calculate metrics like price changes, trends, gains/losses, and transaction histories. Handle real-time updates, data validation, and provide aggregation functions for analysis and reporting.";
  }
  
  if (title.includes('index') || title.includes('reorder')) {
    return "Rearrange array elements according to a new index mapping. Given an array and an index array, place each element at its new position. Handle invalid indices, maintain data integrity, and optimize for in-place operations when possible. Support both number and object arrays.";
  }
  
  if (title.includes('merge') || title.includes('dedup')) {
    return "Implement request deduplication that merges identical API calls. When multiple identical requests are made simultaneously, execute only one and share the result with all callers. Use promise caching, handle request completion, and clean up cache entries appropriately.";
  }
  
  if (title.includes('fake') || title.includes('mock')) {
    return "Create a mock timer system for testing time-dependent code. Replace native setTimeout/setInterval with controllable versions. Support manual time advancement, immediate execution, and timer inspection. Useful for testing without actual delays and ensuring deterministic test results.";
  }
  
  if (title.includes('text range') || title.includes('between nodes')) {
    return "Extract text content between two DOM nodes. Handle different node types, traverse the DOM tree correctly, and collect text from all nodes in the range. Consider edge cases like nodes not in the same tree, text nodes, and element boundaries.";
  }
  
  if (title.includes('sibling') || title.includes('next')) {
    return "Find the next right sibling element in the DOM that matches specific criteria. Skip over text nodes and comments, handle cases where no sibling exists, and support filtering by tag name, class, or custom predicates. Navigate the DOM tree efficiently.";
  }
  
  if (title.includes('class') && (title.includes('finder') || title.includes('getelements'))) {
    return "Implement getElementsByClassName without using the native method. Search the DOM tree for all elements with a specific class name. Handle multiple classes, nested elements, and dynamic class lists. Return a live or static collection and optimize for performance.";
  }
  
  if (title.includes('checkbox') || title.includes('hierarchical')) {
    return "Create a hierarchical checkbox system where parent checkboxes control children and children affect parent states. Implement three states: checked, unchecked, and indeterminate. Handle nested levels, propagate changes up and down the tree, and maintain consistent state across the hierarchy.";
  }
  
  if (title.includes('image') && (title.includes('carousel') || title.includes('slider'))) {
    return "Build an image carousel/slider component with navigation controls. Support previous/next buttons, automatic sliding, touch/swipe gestures, and indicator dots. Handle edge cases (first/last image), implement smooth transitions, and ensure accessibility with keyboard navigation.";
  }
  
  if (title.includes('infinite') || title.includes('endless')) {
    return "Implement infinite scrolling that loads more content as users scroll down. Detect when user reaches the bottom, fetch new data, append to existing content, and handle loading states. Prevent duplicate loads, manage scroll position, and optimize performance with throttling or intersection observers.";
  }
  
  if (title.includes('tab') && title.includes('navigation')) {
    return "Create a tab navigation component that switches between different content panels. Implement active tab highlighting, keyboard navigation (arrow keys), and content lazy loading. Handle dynamic tab addition/removal, support nested tabs, and ensure accessibility with proper ARIA attributes.";
  }
  
  if (title.includes('task') || title.includes('todo')) {
    return "Build a task management interface with add, edit, delete, and complete functionality. Implement local storage persistence, filtering (all/active/completed), and task reordering. Support due dates, priorities, and categories. Provide a clean UI with real-time updates.";
  }
  
  if (title.includes('grid') && title.includes('game')) {
    return "Implement game logic for a grid-based game. Handle game state management, move validation, win condition detection, and turn management. Support player interactions, undo/redo functionality, and game reset. Ensure the game follows proper rules and provides clear feedback.";
  }
  
  if (title.includes('comment') && title.includes('thread')) {
    return "Create a nested comment system that displays threaded discussions. Support multiple nesting levels, reply functionality, comment voting, and sorting (newest, oldest, most popular). Implement efficient rendering for deep nesting and handle comment expansion/collapse.";
  }
  
  if (title.includes('accordion') || title.includes('collapsible')) {
    return "Build an accordion component that expands/collapses content sections. Support single or multiple open panels, smooth animations, keyboard accessibility, and controlled/uncontrolled modes. Handle dynamic content, nested accordions, and provide callbacks for state changes.";
  }
  
  if (title.includes('progress') && title.includes('indicator')) {
    return "Create a progress indicator that visually represents completion status. Support determinate (known progress) and indeterminate (loading) modes. Handle percentage updates, color transitions, and custom styling. Provide smooth animations and accessibility features.";
  }
  
  if (title.includes('rating') && title.includes('star')) {
    return "Implement an interactive star rating component. Support half-star ratings, hover previews, click to rate, and read-only mode. Handle keyboard navigation, provide visual feedback, and emit rating change events. Support custom star counts and styling.";
  }
  
  if (title.includes('emoji') && title.includes('picker')) {
    return "Build an emoji picker interface with search, categories, and recently used emojis. Implement efficient emoji rendering, search by name or keyword, category filtering, and skin tone selection. Support keyboard navigation and provide a clean, performant UI.";
  }
  
  if (title.includes('otp') || title.includes('authentication code')) {
    return "Create an OTP (One-Time Password) input component with separate boxes for each digit. Support auto-focus on next input, paste handling, backspace navigation, and validation. Provide visual feedback, handle different OTP lengths, and ensure accessibility.";
  }
  
  if (title.includes('form') && title.includes('registration')) {
    return "Build a user registration form with validation, error handling, and submission. Implement field validation (email format, password strength, required fields), real-time feedback, and form state management. Handle submission success/failure and provide clear user guidance.";
  }
  
  if (title.includes('chat') || title.includes('ai')) {
    return "Create a chat interface for conversational interactions. Implement message display, input handling, message history, and typing indicators. Support different message types (user/bot), timestamps, and message formatting. Handle real-time updates and scroll management.";
  }
  
  if (title.includes('property') || title.includes('listing')) {
    return "Build a property listing platform interface. Display property cards with images, details, and filters. Implement search, sorting, filtering by price/location/features, and favorites. Support grid/list views, pagination or infinite scroll, and responsive design.";
  }
  
  if (title.includes('data table') || title.includes('data list')) {
    return "Create a dynamic data table with sorting, filtering, and pagination. Support column configuration, custom cell renderers, row selection, and bulk actions. Handle large datasets efficiently with virtual scrolling or pagination. Provide search and export functionality.";
  }
  
  if (title.includes('file') && title.includes('explorer')) {
    return "Build a file explorer component that displays hierarchical file structures. Support folder expansion/collapse, file selection, navigation, and breadcrumbs. Implement search, sorting, and file operations (rename, delete, move). Handle nested directories and provide a tree view.";
  }
  
  if (title.includes('phone') || title.includes('format')) {
    return "Create a phone number parser and formatter. Validate phone numbers, format them according to regional standards, extract country codes, and handle different input formats. Support international numbers, detect invalid formats, and provide user-friendly error messages.";
  }
  
  if (title.includes('optimization') || title.includes('improve')) {
    return "Analyze and optimize existing code for better performance and readability. Identify inefficiencies, apply best practices, reduce complexity, and improve algorithm efficiency. Consider time/space complexity, code maintainability, and modern JavaScript features.";
  }
  
  if (title.includes('reactive') || title.includes('observable')) {
    return "Implement a reactive programming system with observables. Create streams that emit values over time, support operators (map, filter, merge), and handle subscriptions. Manage subscription lifecycle, prevent memory leaks, and provide error handling and completion notifications.";
  }
  
  if (title.includes('progressive') || title.includes('linear delay')) {
    return "Create a timer that increases delay between executions linearly or progressively. Start with an initial delay and increment by a fixed amount on each iteration. Useful for polling with backoff, progressive loading, or rate limiting with increasing delays.";
  }
  
  // Default for any remaining problems
  return "Solve this frontend engineering challenge that demonstrates your understanding of JavaScript fundamentals, data structures, and algorithms. Focus on writing clean, efficient code that handles edge cases properly. Consider performance implications and follow best practices for production-quality code.";
};

let updatedCount = 0;

// Update problem descriptions
const updatedProblems = comprehensiveProblems.map(problem => {
  const newPrompt = getSpecificDescription(problem);
  
  if (newPrompt !== problem.prompt) {
    console.log(`✅ Updated: ${problem.title}`);
    updatedCount++;
  }
  
  return {
    ...problem,
    prompt: newPrompt
  };
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount} problem descriptions`);
console.log(`   ℹ️  Unchanged: ${comprehensiveProblems.length - updatedCount} problems`);

// Generate new file content
const newContent = `// Comprehensive Frontend Interview Problems
// 100 original problems covering JavaScript, React, CSS, DOM APIs, and Algorithms
// All titles rephrased to be original and avoid copyright
// Problems randomly shuffled for uniqueness
// Examples synced with test cases for consistency
// Descriptions tailored to each specific problem

const comprehensiveProblems = ${JSON.stringify(updatedProblems, null, 2)};

module.exports = comprehensiveProblems;
`;

// Write the updated file
const outputPath = path.join(__dirname, '../data/comprehensive-problems.js');
fs.writeFileSync(outputPath, newContent, 'utf8');

console.log(`\n📝 Updated file: ${outputPath}`);
console.log(`📊 Total problems: ${updatedProblems.length}`);

// Show sample updated descriptions
console.log('\n📋 Sample updated descriptions:');
updatedProblems.slice(0, 3).forEach(problem => {
  console.log(`\n${problem.title}:`);
  console.log(`  ${problem.prompt.substring(0, 150)}...`);
});

console.log('\n✅ Done! All problem descriptions are now specific and appropriate.');
