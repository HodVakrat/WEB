# Design: No Coins on Assisted Questions

**Date:** 2026-07-05
**Status:** Implemented 2026-07-05 (all 5 files edited; ESLint verified — zero new issues vs. pre-change baseline). Pending Yaniv's manual test run.

## Problem

Today a kid can ask MathBuddy for a Hint or the full Answer on every question and still
earn full coins for a correct answer. Help is effectively free, which defeats the purpose
of the coin reward.

## Solution Overview

1. **Warn before help:** the first time a kid clicks Hint (or Answer) on a question, a
   confirmation pop-up explains that getting help forfeits the coins for that question.
   The kid can cancel (no penalty) or confirm (help is given, coins forfeited).
2. **Enforce on the server:** the server — the only trusted party — must not award coins
   for questions where help was used, no matter what the client sends.

## Decisions (agreed with Yaniv)

| # | Decision |
|---|----------|
| 1 | Pop-up is a **confirmation dialog with Cancel** ("Yes, help me!" / "No thanks"). |
| 2 | Only **coins** are forfeited. Score (X/5), streak, and adaptive level are unaffected. |
| 3 | Pop-up appears **once per question** (on the first help click). After confirming, further help clicks on the same question show no pop-up. Cancelling means the pop-up re-appears on the next help click. |
| 4 | After confirming, a small **badge** near the bot reads "💫 No coins for this question" until the next question. |
| 5 | **Hint/Answer buttons are disabled once the question is locked** (answered or timed out). They become available again on the next question. |
| 6 | **Timer behavior unchanged:** paused while the pop-up is open and while waiting for/reading the bot reply; "Continue" resumes the clock. Cancel in the pop-up also resumes the clock. |
| 7 | Server-side enforcement via **Approach A**: `correctLevels` changes meaning to "levels of correct answers WITHOUT help" + a new `assistedCorrect` counter. |
| 8 | MathDashboard "Coins per correct answer" legend text stays as-is (Yaniv's decision). |

## UX Flow

- Kid clicks Hint (or Answer) for the first time on a question:
  - Timer pauses; a kid-friendly modal appears (matches app style, light/dark aware):
    *"💡 MathBuddy can help you! But if you get help, you won't earn coins for this
    question. Do you still want help?"* → **"Yes, help me!"** / **"No thanks"**.
  - The modal has a **full-screen click-blocking backdrop** — clicking outside does
    nothing. This also prevents clicking the existing "Continue" button while the
    modal is open.
  - **Cancel:** modal closes, timer resumes, nothing is marked. Full coins still possible.
  - **Confirm:** question is marked as assisted (`helpUsed`), badge appears, and the
    normal help flow runs (Gemini request; timer stays paused until "Continue").
- Everything else is unchanged: Answer stays gated until a Hint was requested,
  correct/wrong animations, CORRECT ANSWERS counter, finish screen (shows server-computed
  coins, which now exclude assisted questions).

## Client Changes

### `src/UsersManager/QuizPage.jsx` (owns the business state)
- New state: `helpUsed` (boolean, current question), `assistedCorrect` (count, whole quiz).
- `handleAnswerClick`, when the answer is correct:
  - if `helpUsed` → `assistedCorrect + 1` (do NOT push to `correctLevels`);
  - else → push `currentLevel` to `correctLevels` (as today).
- `handleNext`: reset `helpUsed` to false.
- `handleRestart`: reset both `helpUsed` and `assistedCorrect`.
- Save effect: pass `assistedCorrect` to `saveQuizResult`.
- BotHelper props: add `locked`, `helpUsed`, `onHelpUsed`.

### `src/UsersManager/BotHelper.jsx`
- New internal state: `showConfirm`.
- Click on Hint/Answer when `helpUsed === false` → open modal + `onPause()`
  (instead of calling Gemini directly).
  - Confirm → `onHelpUsed()`, close modal, run the existing `askBot` flow.
  - Cancel → close modal, `onResume()`.
- When `helpUsed === true` → exactly today's flow (no modal).
- Hint/Answer buttons `disabled` when `locked === true` (in addition to existing
  `isLoading` / `!hintGiven` conditions).
- Render the badge ("💫 No coins for this question") when `helpUsed === true`.
- Reset `showConfirm` on question change (same block that resets messages/hintGiven).

## API Contract Change

`POST /api/results` body:
- `correctLevels` — **new meaning:** levels of correct answers *without* help
  (only these earn coins).
- `assistedCorrect` — **new field:** number of correct answers *with* help.
  Optional; missing/undefined is treated as **0** (backward compatibility: an old
  client tab loaded before the update still sends the old shape, and its results
  must not be rejected).

### `src/services/ResultService.js`
- `saveQuizResult` adds `assistedCorrect` to the JSON body.

## Server Changes

### `server/controllers/resultController.js`
- Read `assistedCorrect` from the body, defaulting to 0 when missing.
- Validation (replaces `correctLevels.length === score`):
  - `assistedCorrect` must be an integer ≥ 0;
  - `correctLevels.length + assistedCorrect === score`;
  - every `correctLevels` entry must be a valid level (unchanged).
- Coins computation **unchanged**: sum of `POINTS_PER_LEVEL` over `correctLevels`.
- Store `assistedCorrect` on the created Result document.

### `server/models/Result.js`
- Add `assistedCorrect: { type: Number, default: 0, min: 0 }`.
- Old documents in the DB read back as 0 automatically (Mongoose default).

## Non-Changes (verified against the repo)

- **HistoryPage** — displays only known fields; nothing to change (assistedCorrect is
  stored but not displayed for now). "TOTAL POINTS" stays consistent because `points`
  already excludes assisted questions at earn time.
- **ComponentSwitcher / onCoinsUpdated** — wallet updates from the server response; untouched.
- **MathDashboard** — legend text unchanged (decision #8).
- **StrictMode** — all new state changes happen in event handlers, not effects; the
  existing `saved` flag already guards the save effect.
- **Vercel** (`api/index.js`) — server change is stateless; identical locally and serverless.
- **questionLevels / "Highest level reached"** — unaffected (assisted questions still count).

## Edge Cases

| Case | Behavior |
|------|----------|
| Help used, then wrong answer or timeout | No coins anyway; `assistedCorrect` NOT incremented (counts correct answers only). |
| Pop-up cancelled, kid answers alone | Full coins. `hintGiven` was never set, so Answer stays gated. |
| Answer clicked after Hint on same question | No second pop-up (price already paid). |
| Question locked (answered / timed out) | Hint/Answer disabled entirely until the next question. |
| Play Again | Both new states reset. |
| Old client tab (no `assistedCorrect` in body) | Treated as 0; old validation semantics hold. |
| Forged request (`assistedCorrect` negative / mismatched) | 400 from validation. |

## Manual Test Plan (Yaniv runs, Claude guides)

1. Clean quiz, no help → full coins (unchanged behavior).
2. Hint on one question, confirm, answer correctly → badge shows, X/5 counts it,
   finish-screen coins exclude that question.
3. Click Hint → Cancel → answer alone → full coins; Answer button still gated.
4. Confirm Hint, then click Answer → no second pop-up.
5. Confirm Hint, let the timer run out → no coins, no crash, `assistedCorrect` not bumped.
6. Answer a question, verify Hint/Answer are disabled until the next question.
7. Play Again → everything resets.
8. Server: POST /api/results with `assistedCorrect` mismatch → 400; without the field → 201.
