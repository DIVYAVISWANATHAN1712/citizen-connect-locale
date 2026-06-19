# Plan

## Task 1 — Fix citizen "Stall Permission" form (dropdown overlap)

**Where:** `src/components/citizen/RequestsCard.tsx` (the `stallDialogOpen` Dialog, lines ~228–271).

**Problem today:** the citizen form uses shadcn `Select` for "Select Event" inside a small Dialog. On a 799px viewport its popover renders on top of (or behind) the Textarea below it, so the options aren't usable.

**Fix:** Replace that mini-form with the same field layout used by the admin `AdminStallsManager` "Add New Stall" dialog (which works reliably because it uses a native `<select>` element and a clean two-column grid):

New citizen stall-permission dialog fields:
- Stall Name *
- Category * — native `<select>` with presets (Grocery, Restaurant, Pharmacy, Electronics, Clothing, Services) + "Other" → reveals a free-text `Input` (exactly like admin)
- Description (textarea)
- Address / Phone (2-col grid)
- Select Event * — also a native `<select>` listing existing events, so it can't be hidden by adjacent fields
- Proposed Discount % / Discount Info (optional, 2-col)

Submission keeps using the existing `requestEventStall(eventId, description)` hook. The extra fields (name, category, address, phone, discount) are concatenated into the `description` string sent to admin so no schema/migration is needed — admin still sees one approval row with all the details. This is the smallest change that fixes the overlap and matches the admin form's look.

No other files change. The admin `AdminStallsManager` stays as-is (you said it's perfect).

## Task 2 — Explain the "Edit with Lovable" badge

This is documentation only, no code change. Short answer to include in chat after the plan is approved:

- **What it is:** a small floating "Edit with Lovable" pill that appears on the **published** version of a Lovable app (e.g. `your-app.lovable.app` or a custom domain). It links visitors back to the project in Lovable.
- **Where the code lives:** it is **not** in your project's source code. It is injected by Lovable's hosting/runtime when the published site is served, so you won't find a component for it in `src/` and you cannot remove it by editing files.
- **When it appears:** only on **published** deployments — never inside the in-editor preview, and never on your localhost build. It's also hidden on routes like `/auth` flows where it would obstruct UI.
- **How to control it:** visibility is a project-level publish setting. On paid plans you can toggle "Hide Lovable badge" in **Project → Settings → Publish** (or via the publish dialog). On the free plan the badge is required. I can flip that setting for you in a follow-up turn if you're on a plan that allows it — just say the word.

## Out of scope
- No changes to admin dashboard, schema, or other request forms.
- No GitHub sync changes.
