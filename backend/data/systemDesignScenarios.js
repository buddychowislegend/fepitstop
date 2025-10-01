const systemDesignScenarios = [
  {
    id: "news-feed",
    title: "Design a News Feed Component",
    description: "Build a scalable, performant news feed like Facebook or Twitter",
    steps: [
      { title: "Component Architecture", guidance: "Break down into FeedContainer, FeedItem, InfiniteScroll components", complete: false },
      { title: "State Management", guidance: "Choose between Context API, Redux, or Zustand for feed state", complete: false },
      { title: "Performance Optimization", guidance: "Implement virtualization for long lists, lazy loading for images", complete: false },
      { title: "Real-time Updates", guidance: "Design WebSocket integration or polling strategy", complete: false },
      { title: "Error Handling", guidance: "Add retry logic, skeleton loaders, and fallback UI", complete: false },
    ],
  },
  {
    id: "autocomplete",
    title: "Design an Autocomplete Search",
    description: "Create a scalable autocomplete with debouncing and caching",
    steps: [
      { title: "Input Debouncing", guidance: "Implement debounce to reduce API calls", complete: false },
      { title: "Caching Strategy", guidance: "Cache previous search results in memory or localStorage", complete: false },
      { title: "Keyboard Navigation", guidance: "Support arrow keys, Enter, and Escape", complete: false },
      { title: "API Design", guidance: "Design efficient backend query with pagination", complete: false },
    ],
  },
];

module.exports = { systemDesignScenarios };

