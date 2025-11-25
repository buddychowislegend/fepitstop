# 📊 Interview Score Calculation Explained

## Overview

The interview evaluation system calculates **three main scores**:
1. **Overall Score** (0-10 scale)
2. **Technical Score** (0-100 scale, displayed as 0-10)
3. **Communication Score** (0-100 scale, displayed as 0-10)

## Score Calculation Flow

```
Interview Answers
    ↓
Per-Question AI Analysis (0-10 each)
    ↓
Technical Score Calculation
    ↓
Communication Score Calculation
    ↓
Overall Score Calculation
```

---

## 1. Per-Question Analysis (0-10 scale)

**Location:** `src/app/api/ai-interview/route.ts` → `generateQuestionAnalysis()`

### How it works:

1. **AI Analysis**: Each question-answer pair is analyzed by AI (Llama/Gemini) with this prompt:
   ```
   Analyze this specific question and answer:
   1. Score the answer (0-10) based on accuracy, depth, and relevance
   2. Provide specific feedback about what they did well or poorly
   3. Identify specific strengths in their answer
   4. Identify specific improvements needed
   ```

2. **Scoring Criteria** (AI evaluates based on):
   - **Accuracy**: Is the answer technically correct?
   - **Depth**: Does it show deep understanding?
   - **Relevance**: Does it directly address the question?
   - **Examples**: Are concrete examples provided?
   - **Trade-offs**: Are pros/cons discussed?
   - **Structure**: Is the answer well-organized?

3. **Fallback Scoring** (if AI fails):
   - Answer length > 50 chars: **5 points**
   - Answer length ≤ 50 chars: **2 points**

4. **Response Classification**:
   - **Valid**: Normal technical answer
   - **Empty**: No answer provided → **0 points**
   - **Nonsense/Inappropriate**: → **0-1 points**
   - **Joke/Off-topic**: → **1 point**
   - **Incomplete**: Partial answer → **scored normally**

---

## 2. Technical Score (0-100 scale)

**Location:** `src/app/api/ai-interview/route.ts` (lines 1172-1181)

### Formula:

```javascript
// Step 1: Calculate average of all per-question scores (0-10 scale)
technicalRaw = sum of all question scores
technicalAvg10 = technicalRaw / number of questions

// Step 2: Apply penalties for non-technical responses
penalty = 0
for each question:
  if responseType === 'nonsense' or 'inappropriate': penalty += 2
  if responseType === 'joke' or 'off-topic': penalty += 1

// Step 3: Calculate final technical score (0-100)
technicalScore = (technicalAvg10 * 10) - (penalty * 3)
technicalScore = max(0, min(100, technicalScore))
```

### Example:

**Scenario:** 3 questions answered
- Question 1: Score 8/10 (valid response)
- Question 2: Score 6/10 (valid response)
- Question 3: Score 0/10 (nonsense response)

**Calculation:**
```
technicalAvg10 = (8 + 6 + 0) / 3 = 4.67
penalty = 2 (for nonsense response)
technicalScore = (4.67 * 10) - (2 * 3) = 46.7 - 6 = 40.7 → 41/100
```

**Displayed as:** 4.1/10 (41 ÷ 10)

### Key Points:

- ✅ **Based on AI analysis** of technical accuracy and depth
- ✅ **Averages all question scores** (0-10 each)
- ✅ **Converts to 0-100 scale** (multiply by 10)
- ⚠️ **Penalties applied** for non-technical responses:
  - Nonsense/Inappropriate: -6 points per occurrence
  - Joke/Off-topic: -3 points per occurrence
- ✅ **Capped at 0-100** (displayed as 0-10)

---

## 3. Communication Score (0-100 scale)

**Location:** `src/app/api/ai-interview/route.ts` (lines 1183-1189)

### Formula:

```javascript
// Combine all answers into one text
allAnswers = join all answers with " \n "

// 1. Length Score (0-40 points)
lengthScore = min(40, floor(totalCharacters / 150))
// Example: 600 chars = 4 points, 6000 chars = 40 points

// 2. Structure Score (0-32 points)
structureScore = 0
if (contains bullet points "- "): structureScore += 8
if (contains numbered list "\n1."): structureScore += 8
if (contains transitions "first/second/finally"): structureScore += 8
if (contains examples "for example/e.g."): structureScore += 8
// Max: 32 points

// 3. Filler Word Penalty
fillerPenalty = count of ("um", "uk", "like", "you know", "kinda")

// 4. Clarity Penalty
clarityPenalty = count of ("idk", "dont know", "no idea") * 2

// 5. Final Communication Score
communicationScore = lengthScore + structureScore - fillerPenalty - clarityPenalty + 20
communicationScore = max(0, min(100, communicationScore))
```

### Example:

**Scenario:** Candidate answered 3 questions
- Total characters: 1,200
- Has bullet points: ✅
- Has "for example": ✅
- Has "first/second": ✅
- Has numbered list: ❌
- Filler words: "um" (2 times), "like" (3 times)
- Clarity issues: "idk" (1 time)

**Calculation:**
```
lengthScore = min(40, floor(1200 / 150)) = min(40, 8) = 8 points

structureScore = 8 (bullet points) + 8 (transitions) + 8 (examples) = 24 points

fillerPenalty = 2 + 3 = 5 points

clarityPenalty = 1 * 2 = 2 points

communicationScore = 8 + 24 - 5 - 2 + 20 = 45/100
```

**Displayed as:** 4.5/10 (45 ÷ 10)

### Key Points:

- ✅ **Length Score (0-40)**: Rewards detailed answers
  - ~150 chars = 1 point
  - ~6,000 chars = 40 points (max)
  
- ✅ **Structure Score (0-32)**: Rewards organized answers
  - Bullet points: +8
  - Numbered lists: +8
  - Transition words: +8
  - Examples: +8
  
- ⚠️ **Filler Word Penalty**: Deducts for verbal fillers
  - "um", "uk", "like", "you know", "kinda"
  - Each occurrence: -1 point
  
- ⚠️ **Clarity Penalty**: Deducts for uncertainty
  - "idk", "dont know", "no idea"
  - Each occurrence: -2 points
  
- ✅ **Baseline Bonus**: +20 points (everyone starts with 20)
- ✅ **Capped at 0-100** (displayed as 0-10)

---

## 4. Overall Score (0-10 scale)

**Location:** `src/app/api/ai-interview/route.ts` (lines 1167-1170)

### Formula:

```javascript
// Step 1: Calculate average of all per-question scores
avg = sum of all question scores / number of questions

// Step 2: Calculate coverage (how many questions answered)
coverage = answeredCount / totalQuestions

// Step 3: Calculate overall score with coverage factor
overallScore = avg * (0.6 + 0.4 * coverage)
overallScore = max(1, min(10, round(overallScore)))
```

### Example:

**Scenario:** 5 questions total, 4 answered
- Question scores: 8, 7, 6, 5 (4 questions)
- 1 question not answered

**Calculation:**
```
avg = (8 + 7 + 6 + 5) / 4 = 6.5
coverage = 4 / 5 = 0.8
overallScore = 6.5 * (0.6 + 0.4 * 0.8) = 6.5 * 0.92 = 5.98 → 6/10
```

### Key Points:

- ✅ **Based on average question score** (0-10)
- ✅ **Coverage factor**: Rewards answering more questions
  - 100% coverage: multiplier = 1.0
  - 50% coverage: multiplier = 0.8
  - 0% coverage: multiplier = 0.6 
- ✅ **Minimum score**: 1 (even if all answers are poor)
- ✅ **Maximum score**: 10

---

## Score Display

All scores are displayed on a **0-10 scale** in the UI:

- **Technical Score**: `technicalScore / 10` (e.g., 75/100 → 7.5/10)
- **Communication Score**: `communicationScore / 10` (e.g., 60/100 → 6.0/10)
- **Overall Score**: Already on 0-10 scale

---

## Summary Table

| Score Type | Range | Based On | Key Factors |
|------------|-------|----------|-------------|
| **Per-Question** | 0-10 | AI Analysis | Accuracy, depth, relevance, examples |
| **Technical Score** | 0-100 (shown as 0-10) | Average of per-question scores | Technical accuracy, penalties for nonsense |
| **Communication Score** | 0-100 (shown as 0-10) | Text analysis heuristics | Length, structure, fillers, clarity |
| **Overall Score** | 0-10 | Average question score + coverage | Question quality + completion rate |

---

## Tips for Candidates

### To Improve Technical Score:
- ✅ Provide accurate, detailed technical answers
- ✅ Include concrete examples and code snippets
- ✅ Discuss trade-offs and edge cases
- ✅ Avoid nonsense or inappropriate responses
- ✅ Answer all questions (coverage matters)

### To Improve Communication Score:
- ✅ Write detailed answers (aim for 200+ chars per question)
- ✅ Use bullet points or numbered lists
- ✅ Use transition words (first, second, finally)
- ✅ Include examples ("for example", "e.g.")
- ✅ Avoid filler words (um, like, you know)
- ✅ Avoid uncertainty phrases (idk, don't know)

---

## Code References

- **Per-Question Analysis**: `src/app/api/ai-interview/route.ts:853-925`
- **Technical Score**: `src/app/api/ai-interview/route.ts:1172-1181`
- **Communication Score**: `src/app/api/ai-interview/route.ts:1183-1189`
- **Overall Score**: `src/app/api/ai-interview/route.ts:1167-1170`

