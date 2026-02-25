# V1 Prompt Pack (Roast My Landing Page)

This folder contains the v1 two-pass prompt pack for the "Roast My Landing Page" pipeline.

## Files

- `pass1-system.txt`
  - System prompt for Pass 1 (analysis JSON)
  - Emphasizes analysis fidelity, impact-ranked issues, and partial-evidence handling
- `pass1-analysis-template.txt`
  - Invocation/template prompt for Pass 1 with placeholders for extracted evidence
- `pass2-system.txt`
  - System prompt for Pass 2 (UI composition JSON)
  - Enforces frozen v1 UI contract and pass-boundary fidelity
- `pass2-compose-template.txt`
  - Invocation/template prompt for Pass 2 with schema-count constraints and JSON skeleton

## Source of Truth Used

Prompt content was written to match these project artifacts:

- `../context.md`
- `../docs/v1-decisions.md`
- `../schemas/pass2-ui-contract.json`

Key constraints carried forward:

- Desktop-first v1 (mobile still analyzed)
- Two-pass pipeline (Pass 1 analysis, Pass 2 presentation copy)
- Frozen Pass 2 UI contract for v1 (no schema changes)
- Pass 1 schema intentionally loose/flexible for real-world evidence variance
- No UI changes in prompt behavior

## Intent by Pass

### Pass 1 (analysis)

Pass 1 should produce fact-focused analysis JSON that can tolerate partial evidence:

- Keeps the required top-level placeholder keys for current integration compatibility
- Allows extra fields if useful (the pass1 schema is intentionally loose)
- Explicitly marks missing evidence and lowers confidence instead of hallucinating
- Ranks issues by conversion impact and includes a fix for each criticism

### Pass 2 (composition)

Pass 2 should transform Pass 1 analysis into UI-ready copy without changing facts:

- Exact `pass2-ui` contract shape
- No extra keys / no missing keys
- Preserves scores, rankings, and evidence intent from Pass 1
- Keeps wording concise for the existing desktop-first results UI

## Integration Notes

- These templates use `{{placeholders}}`; replace them in your app/server before calling the model.
- Pass 2 should receive the full Pass 1 JSON payload.
- Validate Pass 2 output against `schemas/pass2-ui-contract.json` before rendering.
- Pass 1 validation can remain light in v1 (placeholder contract + sanity checks).
