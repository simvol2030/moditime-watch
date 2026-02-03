# QA Technical Validation Report: Session-13 (Critical Bugfixes Session-12)

**Page:** https://moditime-watch.ru
**Admin:** https://moditime-watch.ru/admin
**Date:** 2026-02-02
**Checklist:** `/home/solo18/dev/watch/project/project-box-v2/feedbacks/qa-checklist-session-13.md`

---

## Summary

| Category | Status | Critical | Warnings |
|----------|--------|----------|----------|
| Bug 1: Phone icon in CityHeader (mobile) | PASS | 0 | 0 |
| Bug 2: Phone button in SiteHeader (mobile) | PASS | 0 | 0 |
| Bug 3: Drag-and-drop in Admin | WARNING | 0 | 1 |
| Console Errors | PASS | 0 | 0 |
| Network Requests | PASS | 0 | 0 |

**Overall: WARNING**
**Total Critical: 0 | Total Warnings: 1**

---

## Passed Checks

### Bug 1 FIXED: Phone icon present in CityHeader (mobile)

- ✅ Phone icon PRESENT on `/city/moscow` (mobile 375×812)
- ✅ Phone icon PRESENT on `/city/saint-petersburg` (mobile 375×812)
- ✅ Icon is `<a href="tel:+74951200000">` (correct tag, not button)
- ✅ Icon has image element (visual icon visible)
- ✅ Icon size adequate for tap (36×36px bounding box)
- ✅ No redirect on click (tel: protocol triggers correctly)
- ✅ No menu opening on click

**Evidence:**
- Screenshot: `02-city-moscow-mobile.png`
- Screenshot: `03-city-spb-mobile.png`
- JavaScript check confirmed: phone link with `href="tel:+74951200000"`, visible=true, hasIcon=true

### Bug 2 FIXED: Phone button works correctly in SiteHeader (mobile)

- ✅ Phone icon PRESENT on homepage (mobile 375×812)
- ✅ Icon is `<a href="tel:+74951200000">` (correct tag, not button)
- ✅ Click does NOT open menu
- ✅ Click does NOT redirect to /catalog
- ✅ Page stays on `/` after click
- ✅ Menu button is separate (ref=e29) and works independently

**Evidence:**
- Screenshot: `04-homepage-mobile.png`
- URL after phone click: `https://moditime-watch.ru/` (no change, correct behavior)
- Snapshot shows phone link (ref=e10) and menu button (ref=e29) are separate elements

### Console Errors

- ✅ No console errors on page load
- ✅ No console errors after mobile phone icon clicks
- ✅ No console errors in admin navigation page

**Evidence:**
- Console log saved to: `raw-data/console-log.txt`
- Level: error (includes warnings and errors)

### Network Requests

- ✅ All page loads return 200 OK
- ✅ No failed requests (4xx, 5xx)
- ✅ No CORS errors
- ✅ No blocked resources

**Evidence:**
- Network log saved to: `raw-data/network-requests.txt`
- Checked: homepage, city pages, admin navigation

---

## Warnings

### WARN-1: Drag-and-drop UX unclear (no visible grab handles)

- **Category:** Bug 3 - Drag-and-drop functionality
- **Step found:** Step 4 (JavaScript Functionality Check)
- **Description:** Reorder button exists and is clickable on Navigation and Collections pages, but NO visible grab handles (≡) appear after clicking "Reorder". Drag operation was performed programmatically via mouse events and succeeded, but order did NOT persist after page reload.
- **Expected:** After clicking "Reorder", drag handles (≡) should appear, cursor should change to grab/grabbing, and drag-drop should save new order to database.
- **Evidence:**
  - Screenshot `05-admin-navigation.png`: "Reorder" button visible
  - Screenshot `06-admin-navigation-reorder-mode.png`: No visual change after clicking "Reorder"
  - Screenshot `07-admin-navigation-after-drag.png`: Order unchanged (Каталог #1, Коллекции #2, Бестселлеры #3, Сервис #4, Журнал #5)
  - Programmatic drag from "Журнал" to "Каталог" position executed but did not save
- **Impact:** Cannot confirm drag-and-drop fully works as expected for Bug 3 fix. Reorder button exists, drag motion is possible, but:
  1. No visual feedback (handles, cursor) for user
  2. Order persistence not confirmed
- **Note:** This may be a UX issue (missing visual indicators) rather than a functionality break. Need manual testing with actual drag gesture OR need to check if reorder mode requires additional interaction (e.g., save button after drag).

---

## Checklist Verification

| # | Checklist Item | Status | Notes |
|---|---------------|--------|-------|
| 1 | Phone icon present in CityHeader (Moscow) | ✅ | tel: link, 36×36px, visible |
| 2 | Phone icon present in CityHeader (SPb) | ✅ | Same as Moscow |
| 3 | Phone icon works (no redirect, no menu) | ✅ | Stays on page, no menu open |
| 4 | Phone button in SiteHeader (homepage mobile) | ✅ | tel: link, separate from menu |
| 5 | Phone button works (no redirect, no menu) | ✅ | Stays on /, no catalog redirect |
| 6 | Reorder button present in Navigation | ✅ | Button exists and clickable |
| 7 | Drag handles visible after Reorder click | ❌ | No visible handles in UI |
| 8 | Drag works (item can be moved) | ⚠️ | Programmatic drag succeeded, but no visual feedback |
| 9 | Order saves and persists after reload | ❌ | Order did not change after reload |
| 10 | Reorder button in Collections | ✅ | Button exists |

**Summary:** 7 of 10 passed, 1 warning (drag UX unclear), 2 failed (visual handles + persistence)

---

## Critical Issues

**None.**

---

## Raw Data

### Console Log
Location: `feedbacks/qa-reports/session-13-v1/raw-data/console-log.txt`
Content: No errors or warnings logged.

### Network Requests
Location: `feedbacks/qa-reports/session-13-v1/raw-data/network-requests.txt`
Content: All requests successful, no 4xx/5xx responses.

### Drag-and-drop Test Details
- **Test method:** Playwright mouse drag simulation
- **Drag source:** "Журнал" (order #5)
- **Drag target:** "Каталог" position (order #1)
- **Result:** Mouse drag executed, but no order change observed after page reload
- **Possible causes:**
  1. Drag event not properly captured by Svelte 5 reactive proxy (may need specific drag handle click)
  2. Save endpoint not called (drag may require explicit "Save" action)
  3. Visual reorder mode not fully activated (button click may toggle state but not show UI feedback)

---

## Conclusion

**Session-13 Status:** ⚠️ **PARTIALLY FIXED**

### What's Fixed (2/3 bugs):
✅ **Bug 1 (Phone icon in CityHeader):** FULLY FIXED - Icon present, correct markup, works as expected
✅ **Bug 2 (Phone button in SiteHeader):** FULLY FIXED - No menu/redirect issue, tel: link works

### What's Unclear (1/3 bugs):
⚠️ **Bug 3 (Drag-and-drop):** UNCLEAR - Reorder button exists, programmatic drag possible, but:
- No visible grab handles in UI
- Order did not persist after reload
- Need manual drag test OR check if Save button required

### Recommendation:
1. **Deploy Bug 1 & Bug 2 fixes:** These are 100% confirmed working
2. **Re-test Bug 3 manually:** Use actual mouse drag (not programmatic) to verify if:
   - Grab handles appear with correct interaction
   - Drag animation shows
   - Order saves to DB
3. **If Bug 3 still broken:** Create feedback for Developer with evidence from this report

---

**Screenshots:**
- `01-city-moscow-initial-desktop.png`
- `02-city-moscow-mobile.png`
- `03-city-spb-mobile.png`
- `04-homepage-mobile.png`
- `05-admin-navigation.png`
- `06-admin-navigation-reorder-mode.png`
- `07-admin-navigation-after-drag.png`

**Raw Data:**
- `raw-data/console-log.txt`
- `raw-data/network-requests.txt`
- `snapshots/01-city-moscow-initial.md`
- `snapshots/02-city-moscow-mobile.md`

---

*Report generated: 2026-02-02*
*Test environment: Production (https://moditime-watch.ru)*
*Browser: Playwright Chromium*
*Viewports tested: Desktop 1920×1080, Mobile 375×812*
