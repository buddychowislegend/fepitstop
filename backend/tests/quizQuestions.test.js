const path = require('path');
const { quizQuestions } = require(path.join('..', 'data', 'quizQuestions'));

describe('Quiz Questions Dataset', () => {
  test('contains required fields and valid indices', () => {
    expect(Array.isArray(quizQuestions)).toBe(true);
    expect(quizQuestions.length).toBeGreaterThan(0);

    for (const q of quizQuestions) {
      expect(typeof q.id).toBe('string');
      expect(typeof q.question).toBe('string');
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(Number.isInteger(q.correct)).toBe(true);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(q.options.length);
    }
  });

  test('includes bridge crossing riddle with correct answer', () => {
    const riddle = quizQuestions.find(q => q.id === 'R1');
    expect(riddle).toBeDefined();
    expect(riddle.options[riddle.correct]).toMatch(/17 minutes/i);
  });

  test('includes river crossing wolf-goat-cabbage riddle with correct crossings', () => {
    const riddle = quizQuestions.find(q => q.id === 'R3');
    expect(riddle).toBeDefined();
    expect(riddle.options[riddle.correct]).toMatch(/7 crossings/i);
  });

  test('riddle semantic correctness spot checks', () => {
    const r2 = quizQuestions.find(q => q.id === 'R2');
    expect(r2).toBeDefined();
    expect(r2.options[r2.correct]).toMatch(/married/i);

    const r4 = quizQuestions.find(q => q.id === 'R4');
    expect(r4).toBeDefined();
    expect(r4.options[r4.correct]).toMatch(/echo/i);

    const r5 = quizQuestions.find(q => q.id === 'R5');
    expect(r5).toBeDefined();
    expect(r5.options[r5.correct]).toMatch(/towel/i);
  });
});


