# Ourus — Timekeeping Schema
**Document 2 of 2 | Layer: How employee time is recorded, corrected, and summarized**

---

## What This Document Covers

This document covers the second layer of the Ourus database: timekeeping. Think of this layer as the **attendance logbook** — it sits between a biometric punch event and the final payroll computation.

There are **5 tables** in this layer. They must be created **after** the Identity & Access tables in Document 1a, because they reference `users` and `companies`.

---

## Tables Overview

| # | Table | Plain-English Purpose |
|---|---|---|
| 1 | `adjustment_reasons` | Standardized reason codes for supervisor edits (like a dropdown list) |
| 2 | `pay_periods` | Defines the cutoff window per company (semi-monthly or fortnightly) |
| 3 | `time_punches` | Raw biometric tap log — sacred, never modified after insert |
| 4 | `punch_adjustments` | Supervisor correction layer — sits on top of raw punches |
| 5 | `timesheet_summaries` | Computed totals per employee per pay period — what payroll reads |

---

## The Core Design Principle: Raw Punches Are Sacred

This is the most important architectural decision in this layer. When a supervisor needs to correct a time entry, they do **not** touch the original punch record. Instead, they insert a correction in `punch_adjustments`.

The payroll engine follows this rule when computing hours:

```
For each punch pair (IN + OUT):
  IF a punch_adjustment exists → use the adjusted time
  ELSE → use the raw time_punches value
```

This means the original biometric record is preserved forever as legal evidence, while the corrected value is used for payroll computation. In a Philippine labor dispute, you can show both the raw punch and who changed it, when, and why.

---

## Data Flow

```
① Employee taps biometric
        ↓
② time_punches  ← raw event recorded here (never touched again)
        ↓
③ punch_adjustments  ← supervisor adds correction here if needed
        ↓
④ timesheet_summaries  ← system computes totals (regenerated when punches/adjustments change)
        ↓
⑤ payslips  ← Phase 4 Payroll reads from here
```

---

## Table 1 — `adjustment_reasons`

**What it is:** A lookup table of standardized reason codes for supervisor edits. This is the equivalent of a data validation dropdown in Excel — instead of supervisors typing freeform text (which becomes inconsistent and hard to report on), they must pick from an approved list. You and your dev partners define these codes during client onboarding.

```sql
-- Create the adjustment_reasons lookup table.
-- Think of this as a controlled dropdown list for supervisor correction reasons.
-- Only Ourus developers add rows here — not company admins or supervisors.
CREATE TABLE adjustment_reasons (

  -- Unique ID for each reason code. Auto-generated.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Short machine-readable code used in application logic.
  -- Example: "FORGOT_PUNCH_OUT", "DEVICE_DOWNTIME"
  -- UNIQUE means no duplicate codes allowed across the entire system.
  reason_code TEXT NOT NULL UNIQUE,

  -- Human-readable label shown in the UI dropdown.
  reason_label TEXT NOT NULL,

  -- Longer explanation of when this reason should be used.
  description TEXT,

  -- Whether this reason is still available for selection.
  -- FALSE = deprecated reason (hidden from dropdown but kept for historical records).
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamp of when this reason code was added.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the standard reason codes.
-- These are the options supervisors will see in their dropdown when editing a punch.
INSERT INTO adjustment_reasons (reason_code, reason_label, description) VALUES
  ('FORGOT_PUNCH_OUT',  'Forgot to Punch Out',
   'Employee left without completing logout on the kiosk.'),
  ('FORGOT_PUNCH_IN',   'Forgot to Punch In',
   'Employee was present but did not register arrival on the kiosk.'),
  ('DEVICE_DOWNTIME',   'Device / System Downtime',
   'Biometric kiosk was offline or malfunctioning at time of punch.'),
  ('BIOMETRIC_FAILURE', 'Biometric Read Failure',
   'Device could not read fingerprint or face — employee was present but unrecognized.'),
  ('WRONG_PUNCH_TIME',  'Incorrect Punch Time Recorded',
   'System clock or sync error caused an inaccurate timestamp.'),
  ('APPROVED_OVERTIME', 'Approved Overtime Extension',
   'Employee rendered approved OT beyond scheduled shift.'),
  ('OFFICIAL_BUSINESS', 'Official Business / Off-site Work',
   'Employee was on approved off-site duty and could not access the kiosk.'),
  ('DATA_ENTRY_ERROR',  'Supervisor Data Entry Correction',
   'A previous adjustment contained an error and is being corrected.');

COMMENT ON TABLE adjustment_reasons IS
  'Controlled dropdown list for supervisor punch correction reasons. Managed by Ourus devs only.';
```

---

## Table 2 — `pay_periods`

**What it is:** The payroll cutoff calendar per company. Every timesheet computation happens inside one of these windows. Think of each row as a column header in a payroll worksheet — it defines the start date, end date, and current status of one pay cycle for one company.

**Important PH distinction stored here:**
- `SEMI_MONTHLY` — 1st–15th and 16th–end of month. Always aligned to calendar dates. Common in small businesses.
- `FORTNIGHTLY` — rolling 14-day cycles. Does NOT always align to calendar month halves. Common in BPO. Can straddle months (e.g., April 28 – May 11).

```sql
-- Create the pay_periods table.
-- One row = one payroll cutoff cycle for one company.
CREATE TABLE pay_periods (

  -- Unique ID for each pay period. Auto-generated.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which company this pay period belongs to.
  -- Each company manages its own pay cycles independently.
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- The type of pay cycle for this period.
  -- CHECK enforces only these two values are allowed — like data validation in Excel.
  period_type TEXT NOT NULL
    CHECK (period_type IN ('SEMI_MONTHLY', 'FORTNIGHTLY')),

  -- The first day of this pay cycle (inclusive).
  period_start DATE NOT NULL,

  -- The last day of this pay cycle (inclusive).
  period_end DATE NOT NULL,

  -- The deadline date for attendance — usually equals period_end,
  -- but some companies have a processing lag (e.g., period ends May 15 but cutoff is May 14).
  cutoff_date DATE NOT NULL,

  -- The lifecycle status of this pay period.
  -- DRAFT    = being set up, not yet open for punches
  -- OPEN     = active — employees are punching in/out, supervisors can still adjust
  -- FINALIZED = locked — payroll has been computed, no more changes allowed
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'OPEN', 'FINALIZED')),

  -- Timestamp of when this pay period record was created.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevents overlapping pay periods for the same company.
  -- A company cannot have two pay periods with the same start date.
  CONSTRAINT unique_period_per_company UNIQUE (company_id, period_start)
);

COMMENT ON TABLE pay_periods IS
  'Payroll cutoff windows per company. Supports both SEMI_MONTHLY and FORTNIGHTLY cycles.';
```

---

## Table 3 — `time_punches`

**What it is:** The raw biometric event log. Every single tap on the kiosk — whether it's a punch-in or punch-out — creates one row here. This is the most important table in the timekeeping layer. **Once a row is inserted, no application code should ever UPDATE or DELETE it.**

```sql
-- Create the time_punches table.
-- One row = one biometric tap event (either a punch-IN or punch-OUT).
-- ⚠️  SACRED TABLE: Rows are INSERT-only. Never updated. Never deleted.
CREATE TABLE time_punches (

  -- Unique ID for each punch event. Auto-generated.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which employee tapped the kiosk.
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  -- Note: ON DELETE RESTRICT means you cannot delete an employee record
  -- if they have punch history. This protects payroll audit data.

  -- Which pay period this punch belongs to.
  -- The system determines this automatically based on the punch timestamp.
  pay_period_id UUID NOT NULL REFERENCES pay_periods(id) ON DELETE RESTRICT,

  -- Whether this was a punch-IN (arriving) or punch-OUT (leaving).
  punch_type TEXT NOT NULL
    CHECK (punch_type IN ('IN', 'OUT')),

  -- The exact timestamp of the biometric event.
  -- This is the most critical field — it's what hours are computed from.
  punched_at TIMESTAMPTZ NOT NULL,

  -- Which physical device registered this punch.
  -- Example: "kiosk-main-lobby", "tablet-hr-office"
  -- Useful for investigating disputes (e.g., wrong device = possible buddy punching).
  device_id TEXT NOT NULL,

  -- How the punch was made.
  punch_method TEXT NOT NULL
    CHECK (punch_method IN ('BIOMETRIC_FACE', 'BIOMETRIC_FINGERPRINT', 'MANUAL_LOGIN')),
  -- MANUAL_LOGIN is the fallback when biometric is unavailable.
  -- It is only allowed from IP-whitelisted devices (enforced at the application layer).

  -- The IP address of the device that sent the punch.
  -- Used for the IP-whitelisting audit trail.
  ip_address INET,

  -- Optional note — system-generated, not user-typed.
  -- Example: "Orphaned punch — no matching OUT detected"
  notes TEXT,

  -- Timestamp of when this row was inserted into the database.
  -- Different from punched_at — this is the server receipt time.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- This index makes it faster to look up all punches for a specific employee
-- within a specific pay period — which is the most common query in timekeeping.
CREATE INDEX idx_time_punches_user_period
  ON time_punches(user_id, pay_period_id);

COMMENT ON TABLE time_punches IS
  'Raw biometric punch log. INSERT-only — never updated or deleted. The legal record of employee presence.';
```

---

## Table 4 — `punch_adjustments`

**What it is:** The supervisor's correction layer. When a punch is wrong or missing, the supervisor does not touch `time_punches`. Instead, they insert a row here with the corrected value, a reason code, and an optional explanation. The payroll engine reads this table first for every punch, and falls back to the raw punch only if no adjustment exists.

```sql
-- Create the punch_adjustments table.
-- One row = one supervisor correction to one specific punch event.
-- This table NEVER modifies time_punches — it sits on top of it.
CREATE TABLE punch_adjustments (

  -- Unique ID for each adjustment record. Auto-generated.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which raw punch is being corrected.
  -- Links back to time_punches — the adjustment is always tied to a specific original event.
  -- NULL is allowed for one case: when an employee forgot to punch IN entirely
  -- (there is no original punch to reference — the supervisor is adding one from scratch).
  time_punch_id UUID REFERENCES time_punches(id) ON DELETE RESTRICT,

  -- Which employee this adjustment is for.
  -- Stored here directly for easier querying — avoids having to JOIN through time_punches.
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Which pay period this adjustment falls under.
  pay_period_id UUID NOT NULL REFERENCES pay_periods(id) ON DELETE RESTRICT,

  -- The corrected timestamp that payroll should use instead of the original.
  adjusted_time TIMESTAMPTZ NOT NULL,

  -- The corrected punch type (IN or OUT).
  -- Usually matches the original, but included for completeness.
  adjusted_punch_type TEXT NOT NULL
    CHECK (adjusted_punch_type IN ('IN', 'OUT')),

  -- Why the supervisor made this change.
  -- Must match a valid code in the adjustment_reasons table — the "dropdown list."
  reason_id UUID NOT NULL REFERENCES adjustment_reasons(id) ON DELETE RESTRICT,

  -- Optional free-text note for additional context.
  -- Example: "Employee was in a client call and could not leave their desk to punch out."
  supervisor_notes TEXT,

  -- Who made this adjustment — must be a user with a supervisor-level role.
  adjusted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Timestamp of when this adjustment was saved.
  -- This is your full audit trail: you know the original punch time, the corrected time,
  -- the reason, who changed it, and exactly when they changed it.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup: "give me all adjustments for this employee in this pay period."
CREATE INDEX idx_punch_adjustments_user_period
  ON punch_adjustments(user_id, pay_period_id);

COMMENT ON TABLE punch_adjustments IS
  'Supervisor correction layer. Raw punches are never touched — corrections live here instead. Full audit trail.';
```

---

## Table 5 — `timesheet_summaries`

**What it is:** The computed summary per employee per pay period. This is what Phase 4 Payroll will read. The system regenerates this automatically every time a punch or adjustment changes. Think of it as the pivot table output — the raw data (time_punches + punch_adjustments) is the source, and this table is the aggregated result.

```sql
-- Create the timesheet_summaries table.
-- One row = the computed attendance summary for one employee for one pay period.
-- This table is COMPUTED — the system writes it, not humans.
CREATE TABLE timesheet_summaries (

  -- Unique ID. Auto-generated.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which employee this summary is for.
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Which pay period this summary covers.
  pay_period_id UUID NOT NULL REFERENCES pay_periods(id) ON DELETE RESTRICT,

  -- Total regular working hours rendered within the scheduled shift window.
  -- Stored as a decimal — e.g., 8.5 means 8 hours and 30 minutes.
  -- "NUMERIC(6,2)" means up to 6 digits total, 2 of which are after the decimal point.
  regular_hours NUMERIC(6,2) NOT NULL DEFAULT 0,

  -- Total overtime hours rendered beyond the scheduled shift.
  overtime_hours NUMERIC(6,2) NOT NULL DEFAULT 0,

  -- Total late minutes accumulated across the pay period.
  -- Stored in minutes (INTEGER) for precision — easier to compute deductions from.
  late_minutes INTEGER NOT NULL DEFAULT 0,

  -- Total undertime minutes (left early) across the pay period.
  undertime_minutes INTEGER NOT NULL DEFAULT 0,

  -- Number of days the employee was absent (no punches at all).
  absent_days INTEGER NOT NULL DEFAULT 0,

  -- Number of days the employee was present (had at least one valid IN + OUT pair).
  present_days INTEGER NOT NULL DEFAULT 0,

  -- The lifecycle status of this summary.
  -- DRAFT     = being computed, not yet reviewed
  -- REVIEWED  = supervisor has checked it
  -- FINALIZED = locked for payroll processing — no more changes
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'REVIEWED', 'FINALIZED')),

  -- Timestamp of the most recent recomputation.
  -- Every time a punch or adjustment changes, this gets updated.
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamp of when this summary was finalized (locked for payroll).
  -- NULL until the status changes to FINALIZED.
  finalized_at TIMESTAMPTZ,

  -- Who finalized this summary.
  finalized_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Ensures only one summary row exists per employee per pay period.
  -- If you try to insert a second row for the same employee + pay period, the database rejects it.
  CONSTRAINT unique_summary_per_user_period UNIQUE (user_id, pay_period_id)
);

-- Index for the most common payroll query: "get all summaries for this pay period."
CREATE INDEX idx_timesheet_summaries_period
  ON timesheet_summaries(pay_period_id);

COMMENT ON TABLE timesheet_summaries IS
  'Computed attendance totals per employee per pay period. System-generated. Read by Phase 4 Payroll.';
```

---

## Recommended Run Order in Supabase

Run these **after** all tables in Document 1a have been created:

1. `adjustment_reasons` — no dependencies (run the INSERT statements too)
2. `pay_periods` — depends on `companies`
3. `time_punches` — depends on `users` and `pay_periods`
4. `punch_adjustments` — depends on `time_punches`, `users`, `pay_periods`, `adjustment_reasons`
5. `timesheet_summaries` — depends on `users` and `pay_periods`

**Full run order across both documents:**

```
companies → platform_users → users → roles → user_roles
    → adjustment_reasons → pay_periods → time_punches
    → punch_adjustments → timesheet_summaries
```

---

## What Phase 4 Payroll Will Read

When you build the payroll layer, the primary input will be:

```sql
-- Plain-English: "Give me the finalized timesheet for all employees
-- in a specific pay period, along with their names and company."
SELECT
  u.full_name,
  u.employee_id,
  ts.regular_hours,
  ts.overtime_hours,
  ts.late_minutes,
  ts.undertime_minutes,
  ts.absent_days
FROM timesheet_summaries ts
JOIN users u ON ts.user_id = u.id
WHERE ts.pay_period_id = '[the pay period you are running payroll for]'
  AND ts.status = 'FINALIZED';
```

This is the equivalent of your XLOOKUP pulling employee data into the payroll pivot — except the database does it automatically and at scale.

---

*Previous: See Document 1a — Identity & Access Schema for the user, company, and roles tables.*
