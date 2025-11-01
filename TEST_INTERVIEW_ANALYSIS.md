# Interview Analysis Test Guide

## Overview

The `test-interview-analysis.js` file tests the accuracy and relevance of the interview analysis system by:

1. **Simulating a complete interview** with 7 detailed, accurate answers to JavaScript questions
2. **Submitting Q&A pairs** to the analysis endpoint
3. **Validating feedback quality** by checking:
   - Feedback references specific questions and answers
   - Strengths cite actual examples from responses
   - Improvements identify real gaps (not generic)
   - Scores are reasonable for accurate answers
   - Per-question analysis is detailed and relevant

## Test Data

The test includes 7 comprehensive JavaScript questions with accurate answers covering:

1. **Closures** - Detailed explanation with practical examples
2. **let, const, var** - Complete comparison with use cases
3. **Event Loop** - In-depth explanation of async execution
4. **async/await** - Error handling and best practices
5. **Promises** - Comparison with callbacks, chaining, methods
6. **'this' binding** - All binding rules with examples
7. **Prototype Chain** - Inheritance explanation with modern alternatives

All answers are technically accurate and comprehensive, suitable for a mid-level interview.

## Running the Test

### Prerequisites

1. **Start the development server**:
   ```bash
   npm run dev
   ```
   Wait for the server to be ready (usually on http://localhost:3000)

2. **Run the test**:
   ```bash
   npm run test:analysis
   ```
   
   Or directly:
   ```bash
   node test-interview-analysis.js
   ```

### Custom API URL

If testing against a different endpoint:
```bash
API_URL=https://your-api-url.com npm run test:analysis
```

## What the Test Validates

### ✅ Overall Feedback Validation

- **Summary Quality**: Checks if summary references specific Q&A pairs
- **Strengths**: Validates that each strength cites specific examples from answers
- **Improvements**: Ensures improvements identify actual gaps, not generic advice
- **Categories**: Verifies category scores are provided

### ✅ Per-Question Analysis Validation

For each question, validates:
- **Score**: Should be 7+/10 for accurate answers
- **Feedback**: Must be specific to the answer given
- **Strengths**: Should reference what the candidate said well
- **Improvements**: Should identify specific gaps or missing elements

### ✅ Specificity Checks

The test verifies that feedback:
- References question numbers (e.g., "In Q2...")
- Mentions specific technical terms from answers
- Cites actual content from the candidate's responses
- Avoids generic statements like "good answer" or "needs improvement"

## Expected Output

When the test passes, you should see:

```
🧪 Testing Interview Analysis Accuracy
============================================================
Testing with 7 Q&A pairs
Profile: frontend, Framework: React, Level: mid

✅ Server is running

📤 Sending Q&A pairs for analysis...

✅ Analysis Generated Successfully
============================================================

📊 OVERALL ANALYSIS
------------------------------------------------------------
📝 Summary:
[Summary that references specific Q&A pairs]

💪 Strengths:
   1. [Strength referencing specific answer] ✅
   2. [Another specific strength] ✅

🔧 Improvements:
   1. [Improvement citing actual gap] ✅

📈 Category Scores:
   javascript_knowledge: 9/10
   framework_expertise: 8/10
   ...

📋 PER-QUESTION ANALYSIS
------------------------------------------------------------
🔹 Question 1:
   Q: Explain how JavaScript closures work...
   Score: 9/10
   Feedback: [Specific feedback about the closure answer]
   ✓ Feedback is specific: YES ✅
   Strengths:
     - [Specific strength] ✅
   Improvements:
     - [Specific improvement if any] ✅

... (for each question)

🎯 VALIDATION SUMMARY
============================================================
✅ has feedback
✅ has question analysis
✅ has specific references
✅ scores provided
✅ reasonable scores

✅ ALL VALIDATIONS PASSED
📊 Validation Score: 5/5 passed
```

## Troubleshooting

### Server Not Running

If you see:
```
⚠️  Server is not running or not accessible.
```

**Solution**: Start the dev server with `npm run dev` and wait for it to be ready.

### API Errors

If you see HTTP errors:
- Check that the API endpoint is correct
- Verify environment variables are set (GEMINI_API_KEY for analysis)
- Check server logs for detailed error messages

### Generic Feedback Detected

If the test shows "NO ❌" for specificity:
- The analysis might not be referencing actual answers
- Check the prompt engineering in `src/app/api/ai-interview/route.ts`
- Ensure the `generateEndSummary` function receives Q&A pairs

### Low Scores for Accurate Answers

If scores are below 7/10 for accurate answers:
- Check the scoring logic in `generateQuestionAnalysis`
- Verify that AI analysis is working correctly
- Review the answer quality - they should be comprehensive

## Integration with CI/CD

To add this to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Start dev server
  run: npm run dev &
  
- name: Wait for server
  run: sleep 10
  
- name: Run analysis test
  run: npm run test:analysis
  env:
    API_URL: http://localhost:3000
```

## Manual Testing

You can also test manually by:

1. Going through an actual interview
2. Providing accurate, detailed answers
3. Checking the analysis page feedback
4. Verifying that:
   - Strengths reference what you actually said
   - Improvements identify real gaps
   - Question analysis is specific to each answer

## Files

- **Test File**: `test-interview-analysis.js`
- **API Route**: `src/app/api/ai-interview/route.ts`
- **Analysis Functions**: `generateEndSummary()` and `generateQuestionAnalysis()`

## Notes

- The test uses realistic interview Q&A pairs
- All answers are technically accurate and comprehensive
- The test validates both structure and content quality
- Results help identify if AI analysis is working correctly
- Regular testing ensures feedback quality remains high

