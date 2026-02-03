# Session-14 Feedback: Reorder Buttons UX Issues

**Date:** 2026-02-03
**Status:** REQUIRES_FIXES
**Severity:** MEDIUM

## Summary

Session-14 implemented Move up/down buttons for reordering items in admin pages. The core functionality is working after a hotfix (table name fix), but there are two remaining issues that need to be addressed.

---

## Issue 1: Visual Styling Inconsistency

**Severity:** MEDIUM
**Pages Affected:** Footer, Brands, Categories, Collections, Testimonials

### Problem
List items (rows) in some admin sections have poor visibility - they appear to blend with the background due to low contrast or missing styling. The Navigation page was fixed during development, but the same fix was not applied to other pages.

### Expected Behavior
All admin pages with reorderable items should have consistent, clearly visible styling for list items with good contrast.

### Where to Fix
Check and unify styles in these page components:
- `/admin/footer/+page.svelte` - item rows poorly visible
- `/admin/brands/+page.svelte`
- `/admin/categories/+page.svelte`
- `/admin/collections/+page.svelte`
- `/admin/testimonials/+page.svelte`

Reference the working styling from:
- `/admin/navigation/+page.svelte` - has correct contrast/styling

### Additional Note
Consider making all admin pages consistent in terms of theme (dark/light). Currently there's a mix of styles across different admin sections.

---

## Issue 2: Page Scroll Resets After Move Action

**Severity:** MEDIUM
**Pages Affected:** All pages with Move up/down buttons

### Problem
When user clicks Move up/down button:
1. The action submits a form
2. Page reloads completely
3. Scroll position resets to top of page
4. User loses context of where they were working

This is especially problematic for pages with many items where user is working in the middle or bottom of the list.

### Expected Behavior
After moving an item, the page should either:
- **Option A (Recommended):** Use progressive enhancement with `use:enhance` to update without full page reload
- **Option B:** Preserve scroll position after the page reload
- **Option C:** Scroll to the moved item after reload

### Technical Suggestion
The current implementation creates a dynamic form and calls `form.submit()`. Instead, use SvelteKit's `use:enhance` with `applyAction` and `invalidateAll` to update the data without full page reload:

```svelte
<form method="POST" action="?/move" use:enhance={() => {
  return async ({ result }) => {
    if (result.type === 'success') {
      await invalidateAll();
    }
  };
}}>
  <input type="hidden" name="id" value={item.id} />
  <input type="hidden" name="direction" value="up" />
  <button type="submit">Move up</button>
</form>
```

Or convert the `submitMove` function to use `fetch` with the form action.

### Where to Fix
Update the `submitMove` function or convert to form-based approach in:
- `ReorderButtons.svelte` component (if used)
- All pages using `submitMove` function pattern

---

## Files to Review

```
frontend-sveltekit/src/routes/(admin)/admin/
├── navigation/+page.svelte     # Reference - has correct styling
├── footer/+page.svelte         # Needs styling fix + enhance
├── brands/+page.svelte         # Needs styling fix + enhance
├── categories/+page.svelte     # Needs styling fix + enhance
├── collections/+page.svelte    # Needs styling fix + enhance
├── testimonials/+page.svelte   # Needs styling fix + enhance

frontend-sveltekit/src/lib/components/admin/
├── ReorderButtons.svelte       # Check if used, may need update
├── DataTable.svelte            # May contain row styling
```

---

## Acceptance Criteria

- [ ] All admin pages with reorderable items have consistent, visible styling
- [ ] Move up/down actions do not cause full page reload (use `enhance`)
- [ ] User scroll position is preserved after move action
- [ ] No visual inconsistencies between admin pages
- [ ] Test all 6 admin pages with reorder functionality

---

## Priority

This is a UX polish issue, not a blocker. The core functionality works. However, these issues significantly impact user experience when managing content with many items.

**Estimated Score:** 8 (multiple files, CSS + JS logic changes, affects UX)

→ **Recommended:** Developer should fix these in a follow-up commit.
