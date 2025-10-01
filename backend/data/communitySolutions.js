const communitySolutions = [
  {
    id: "1",
    problemTitle: "Implement debounce()",
    author: "alex_dev",
    upvotes: 42,
    snippet: "function debounce(fn, delay) { let id; return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), delay); }; }",
    tags: ["js", "performance"],
  },
  {
    id: "2",
    problemTitle: "Two Sum Variant",
    author: "code_ninja",
    upvotes: 38,
    snippet: "const twoSum = (nums, target) => { const map = {}; for (let i = 0; i < nums.length; i++) { if (map[target - nums[i]] !== undefined) return [map[target - nums[i]], i]; map[nums[i]] = i; } };",
    tags: ["arrays", "hash-map"],
  },
  {
    id: "3",
    problemTitle: "Autocomplete Component",
    author: "react_master",
    upvotes: 55,
    snippet: "const Autocomplete = () => { const [query, setQuery] = useState(''); const debouncedQuery = useDebounce(query, 300); /* fetch suggestions */ };",
    tags: ["react", "hooks"],
  },
];

module.exports = { communitySolutions };

