# Skill: design-critique

**Name:** design-critique
**Description:** Structured design feedback using a 5-section critique framework — First Impression, Usability, Visual Hierarchy, Consistency, and Accessibility. Produces actionable, prioritized feedback for UI/UX work.

---

## When to Activate

Use this skill when the user asks for design feedback, a design review, a critique of a screen or component, or when evaluating UI/UX quality of any interface.

Trigger phrases:
- "critique this design"
- "review this screen"
- "give me design feedback"
- "what's wrong with this UI"
- "design review"

---

## Critique Framework

For every critique, evaluate across all 5 sections. Rate each section **Good / Needs Work / Critical**. Then produce a prioritized action list at the end.

---

### 1. First Impression (0–5 seconds)

**What to assess:**
- Does the screen communicate its purpose instantly?
- Is there a clear visual focal point that draws the eye?
- Does the emotional tone match the product's brand?
- Would a first-time user understand what to do next?

**Questions to ask:**
- What is the single most prominent element — should it be?
- Does the color palette feel right for the context (trust, energy, warmth, luxury)?
- Is there visual clutter fighting for attention above the fold?

**Output format:**
> **First Impression — [Rating]**
> [1-3 sentences on immediate read. What lands, what doesn't.]

---

### 2. Usability

**What to assess:**
- Are interactive elements obviously tappable/clickable (affordance)?
- Touch targets ≥ 44×44px (iOS HIG / Android Material)?
- Is the primary action clear and reachable without thought?
- Are error states, loading states, and empty states handled?
- Is there any friction in the core user flow?

**Questions to ask:**
- Can a user complete the key action in under 3 taps?
- Are there any dead ends or confusing states?
- Does disabled state look visibly disabled (not just grayed out text)?

**Output format:**
> **Usability — [Rating]**
> [Specific friction points with suggested fixes. Use numbered list if multiple.]

---

### 3. Visual Hierarchy

**What to assess:**
- Is there a clear H1 → H2 → Body type scale?
- Does size, weight, and color create an obvious reading order?
- Are secondary/tertiary elements visually subordinate?
- Is whitespace used to group related elements and separate unrelated ones?

**Questions to ask:**
- If you blur your eyes slightly, what stands out? Should it?
- Are there competing elements of equal visual weight pulling against each other?
- Does the layout guide the eye toward the conversion/action?

**Output format:**
> **Visual Hierarchy — [Rating]**
> [What the reading order actually is vs. what it should be. Specific element sizing suggestions.]

---

### 4. Consistency

**What to assess:**
- Are spacing values from a consistent scale (4/8/12/16/24/32)?
- Are border radii consistent across card, button, input types?
- Are identical actions styled identically everywhere?
- Are typography choices limited to 2–3 sizes per level?
- Do icon styles (filled vs. outline, stroke weight) match?

**Questions to ask:**
- Could this screen have been made by a different designer than the others?
- Are there "one-off" styles that break the system?
- Is the component language (buttons, chips, cards) internally consistent?

**Output format:**
> **Consistency — [Rating]**
> [List specific inconsistencies found. Name the element and the deviation.]

---

### 5. Accessibility

**What to assess:**
- Text contrast ratio ≥ 4.5:1 (WCAG AA) for body; ≥ 3:1 for large text (18px+)
- Are interactive elements distinguishable beyond color alone?
- Are tap targets large enough and spaced far enough apart (≥ 8px gap)?
- Is text legible at default system font size (no reliance on tiny text)?
- Are important actions keyboard/screen-reader navigable?

**Questions to ask:**
- Would someone with low vision be able to use this?
- Does the design rely on color as the sole meaning carrier?
- Are ghost/placeholder text items too low contrast to read?

**Output format:**
> **Accessibility — [Rating]**
> [Contrast ratios where measurable. Specific elements that fail. Ordered by severity.]

---

## Prioritized Action List

After all 5 sections, produce:

```
## Priority Fixes

🔴 Critical (ship blockers)
- [Fix X — reason]

🟡 High (next sprint)
- [Fix Y — reason]

🟢 Polish (nice to have)
- [Fix Z — reason]
```

---

## Output Rules

- Be specific: name the element, not just "the button"
- Be constructive: pair every problem with a solution direction
- Be concise: 1–3 sentences per section finding, not paragraphs
- Use real measurements when possible (e.g., "this text is ~#666 on #fff — approximately 3.1:1, fails AA")
- Never pad with praise unless it's genuinely informative ("the gradient works well here because X")
