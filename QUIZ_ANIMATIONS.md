# Quiz Page Animations - Profile Card Slide-In Effects

## Overview
Added beautiful fade-in and slide-in animations to the quiz profile selection page, where each profile card slides into view with a staggered timing effect.

## Animations Implemented

### 1. **Slide-In From Left** (`slideInLeft`)
- Cards at even indices (0, 2, 4...) slide in from the left
- Starts at: `translateX(-30px)` with `opacity: 0`
- Ends at: `translateX(0)` with `opacity: 1`
- Duration: `0.6s`
- Easing: `ease-out`

### 2. **Slide-In From Right** (`slideInRight`)
- Cards at odd indices (1, 3, 5...) slide in from the right
- Starts at: `translateX(30px)` with `opacity: 0`
- Ends at: `translateX(0)` with `opacity: 1`
- Duration: `0.6s`
- Easing: `ease-out`

### 3. **Fade-In** (`fadeIn`)
- Used for the title and description text
- Smooth opacity transition from 0 to 1
- No transform effect, just fade

### 4. **Existing Animations**
- `fadeUp`: Used for card elements (fade + slide up)
- `slideInDown`: Available for future use (slide from top)

## Files Modified

### 1. **`src/app/globals.css`**
Added four new CSS keyframe animations:

```css
@keyframes slideInLeft {
  0% { opacity: 0; transform: translateX(-30px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  0% { opacity: 0; transform: translateX(30px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes slideInDown {
  0% { opacity: 0; transform: translateY(-30px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

### 2. **`src/app/quiz/page.tsx`**
Updated profile selection screen with:

```tsx
// Title animation
<div className="text-center mb-12 animate-fadeIn" style={{ animationDelay: '0s' }}>

// Profile cards with staggered animations
{profiles.map((profile, index) => (
  <button
    key={profile.id}
    style={{
      animation: `${index % 2 === 0 ? 'slideInLeft' : 'slideInRight'} 0.6s ease-out forwards`,
      animationDelay: `${index * 0.15}s`,
    }}
  >
    {/* card content */}
  </button>
))}
```

## Animation Details

### Staggered Timing
- Each card has a `0.15s` delay multiplied by its index
- Cards appear in sequence rather than all at once
- Creates a flowing, dynamic effect

### Alternating Direction
- Even-indexed cards (Frontend, Product Manager, Sales) slide from LEFT
- Odd-indexed cards (Backend, HR) slide from RIGHT
- Creates a balanced, visually interesting pattern

### Timing Breakdown
```
Card 0 (Frontend):        Start at 0.0s  →  End at 0.6s
Card 1 (Backend):         Start at 0.15s →  End at 0.75s
Card 2 (Product):         Start at 0.30s →  End at 0.90s
Card 3 (HR):              Start at 0.45s →  End at 1.05s
Card 4 (Sales):           Start at 0.60s →  End at 1.20s
```

## Visual Effect

The profile cards now:
1. ✨ Fade in while sliding from opposite directions
2. 🎯 Appear in a staggered sequence
3. 🔄 Alternate between left and right animations
4. ⚡ Create a smooth, professional entrance effect
5. 📱 Maintain performance with CSS animations (GPU-accelerated)

## Browser Support

All animations use standard CSS keyframes and transforms, supported in:
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Mobile browsers

## Performance

- Uses CSS animations (GPU-accelerated)
- No JavaScript animation library required
- Lightweight and smooth
- No impact on page load performance

## Future Enhancements

Additional animations available in globals.css for future use:
- `slideInDown`: Slide from top (for header elements)
- `fadeUp`: Combined fade and slide up (for cards)
- Can be easily extended with more animation variants

## Testing

To see the animations in action:
1. Navigate to `/quiz` page
2. Observe profile cards sliding in with alternating directions
3. Notice the staggered timing creates a flowing effect
4. The animations repeat when returning to profile selection

---

✅ All animations implemented and tested!
