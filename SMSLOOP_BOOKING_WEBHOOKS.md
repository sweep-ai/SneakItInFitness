# SMSLoop × Calendly / Cal.com — booking webhooks guide

> **For AI coding agents:** this document is self-contained. Read it fully, then build the relay
> described in [Build the relay](#build-the-relay) in the project you are working in, and walk the
> human through [Connect the booking tool](#connect-the-booking-tool). Do not guess endpoints or
> payload fields that are not listed here. Companion doc: `SMSLOOP_LEAD_API.md` (how leads get
> into SMSLoop in the first place).

## What this does

SMSLoop is an AI appointment setter that texts leads. Leads usually come in from a landing page in
a **scenario** like `not_booked` — the AI texts them to get a call booked. When the lead books a
call in **Calendly** or **Cal.com**, SMSLoop must move them to the `booked` scenario so the AI
stops pushing for a booking and switches to confirming / getting them to show up.

Calendly and Cal.com can't call SMSLoop directly (different JSON shape, and they can't send the
SMSLoop secret). So you build a small **relay**: one webhook endpoint that

1. receives the booking tool's webhook,
2. verifies its signature,
3. finds the lead's phone number in the payload,
4. calls SMSLoop's `POST /leads/event`.

```
Calendly / Cal.com ──webhook──▶ your relay (/api/booking-webhook/...) ──POST /leads/event──▶ SMSLoop
```

| Booking tool event | Relay sends to SMSLoop |
|---|---|
| Call booked | `set_scenario` → `booked`, with the call time |
| Call rescheduled | `set_scenario` → `booked` again with the new time (SMSLoop only refreshes the time, no extra text) |
| Call cancelled | `ai_off` (default) — or `set_scenario` back to `not_booked` if the owner wants the AI to win them back |

---

<!-- smsloop:values -->
## Values you need from the SMSLoop owner

Ask the human for these. Never hard-code them; read them from environment variables.

| Env var | Example | Where the owner finds it |
|---|---|---|
| `SMSLOOP_URL` | `https://acme-smsloop.up.railway.app` | Their SMSLoop dashboard address without `/dashboard`, no trailing slash. |
| `SMSLOOP_SECRET` | `sk_9f3...` | Dashboard → Integrations → **Lead source webhook** → Secret. |
| `SMSLOOP_BOOKED_SCENARIO` | `booked` | Scenario key for booked leads (Dashboard → AI System Prompt panel → scenario pills). Must already exist. |
<!-- /smsloop:values -->

Plus, per booking tool (you or the owner create these — see [Connect the booking tool](#connect-the-booking-tool)):

| Env var | Used for |
|---|---|
| `CALENDLY_SIGNING_KEY` | Verifying Calendly webhooks. Any long random string you choose when creating the subscription. |
| `CALCOM_WEBHOOK_SECRET` | Verifying Cal.com webhooks. Any long random string you type into Cal.com's webhook form. |
| `SMSLOOP_ON_CANCEL` | Optional. `ai_off` (default) or a scenario key such as `not_booked`. Ask the owner which they want. |

---

## ⚠️ Rules (mandatory)

1. **Verify every webhook signature** before acting. Without it, anyone could post fake bookings to
   your relay and switch leads around. Reject unsigned / badly signed requests with `401`.
2. **Server-side only.** The relay runs on a backend (API route, serverless function, worker). The
   SMSLoop secret never goes to a browser.
3. **Verify against the raw body.** Both tools sign the exact bytes they sent — read the body as
   text first, verify, *then* `JSON.parse`. Re-serialized JSON will not match.
4. **Answer fast.** Return `200` within a few seconds. Unknown/irrelevant events (test pings,
   triggers you don't handle, bookings with no phone) → still `200`, so the tool doesn't retry or
   disable the webhook. Return `5xx` only if SMSLoop itself failed (so the tool retries).

---

## How leads are matched: the phone number

SMSLoop identifies a lead **only by phone number**. The relay must send the same number the lead
gave on the landing page (any format — SMSLoop normalizes it; include `+country code` for
non-US numbers).

So the booking form must collect a phone:
- **Calendly:** on the event type, either turn on **SMS text reminders** (fills
  `text_reminder_number`) or add an invitee question of type **Phone number** (required).
- **Cal.com:** on the event type → Advanced → booking questions, enable **Phone number**
  (`attendeePhoneNumber`) and make it required.

Better still, **pre-fill** it from the landing page so the number matches exactly (Cal.com booking
link: `?name=...&email=...&attendeePhoneNumber=%2B12125551234`; Calendly embeds support
pre-filling name/email and custom answers `a1`, `a2`… in question order).

If the booking has **no phone**, and the project has its own database of form submissions, look the
lead up there by email. If you still have no phone, skip (return `200`) and log it.

**Unknown number:** if the phone isn't a lead in SMSLoop yet, `set_scenario` **creates** the lead in
`booked` and sends that scenario's first text ("saw you booked…"). That's usually what you want
(someone booked directly without filling the form). If the owner doesn't want that, send
`"kickoff": false`.

---

## The SMSLoop call

`POST {SMSLOOP_URL}/leads/event`, headers `X-SMSLoop-Secret: {SMSLOOP_SECRET}` and
`Content-Type: application/json`.

**Booked / rescheduled:**

```json
{
  "phone": "+12125551234",
  "event": "set_scenario",
  "scenario": "booked",
  "name": "Ana Ruiz",
  "email": "ana@example.com",
  "source": "Calendly",
  "context": {
    "call_start": "2026-10-20T15:00:00Z",
    "call_end": "2026-10-20T15:30:00Z",
    "timezone": "America/New_York",
    "meeting_link": "https://zoom.us/j/123",
    "reschedule_link": "https://calendly.com/reschedulings/abc",
    "cancel_link": "https://calendly.com/cancellations/abc",
    "event_name": "Strategy call"
  }
}
```

- `call_start` (ISO 8601 with `Z` or offset) is required for a useful booked flow: SMSLoop shows it
  to the AI, fills `{call_day}` / `{call_time}` in the booked scenario's opener ("Tuesday, Oct 20",
  "11:00 AM"), and stops offering booking times.
- `timezone` = the invitee's IANA zone; `call_start` is shown in it.
- Every other `context` key is optional, free-form, and given to the AI (so it can share the
  meeting or reschedule link if asked). Max 20 keys, 500 chars each, flat strings only.

**Cancelled (default):**

```json
{"phone": "+12125551234", "event": "ai_off", "reason": "Cancelled their call in Calendly"}
```

The AI stops texting the lead; the owner gets a notification + email to follow up by hand.
**Alternative** (if `SMSLOOP_ON_CANCEL` is a scenario key): `set_scenario` to that key (e.g.
`not_booked`) with `context: {"cancelled_call": "<old call_start>"}` so the AI tries to rebook.

**Responses** (`200`): `created` (new lead), `switched` (moved into `booked`), `updated` (already
in `booked` — time refreshed, no text), `ai_off`, `already_off`, `unknown_lead` (ai_off for a number
SMSLoop doesn't know — fine, nothing to do). Errors: `401` wrong secret, `422` bad phone or a
scenario key that doesn't exist (fix config, don't retry), `409`/`5xx` retry.

All calls are **idempotent**: a webhook delivered twice gives `updated` / `already_off` the second
time, never a second text.

**Bookings the SMSLoop AI made itself:** SMSLoop can book calls in Calendly/Cal.com on its own. Those
bookings also fire the webhook → the relay sends `set_scenario booked` → SMSLoop switches the
scenario but sends **no** extra text (it already confirmed in the chat). Nothing special to do.

---

## Payload reference

### Calendly

Webhook body: `{"event": "invitee.created" | "invitee.canceled", "created_at": "...", "payload": {...}}`

| Need | Path in `payload` |
|---|---|
| Phone (1st choice) | `text_reminder_number` (when SMS reminders are on) |
| Phone (2nd) | `questions_and_answers[]` → the item whose `question` contains "phone" → `answer` |
| Phone (3rd) | `scheduled_event.location.location` when `scheduled_event.location.type == "outbound_call"` |
| Name / email | `name` (or `first_name` + `last_name`), `email` |
| Invitee timezone | `timezone` |
| Call start / end | `scheduled_event.start_time`, `scheduled_event.end_time` |
| Event name | `scheduled_event.name` |
| Meeting link | `scheduled_event.location.join_url` (video locations only; may be missing) |
| Reschedule / cancel links | `reschedule_url`, `cancel_url` |
| Was this a reschedule? | On `invitee.canceled`: `rescheduled == true` |

**Reschedules** fire **both** `invitee.canceled` (with `rescheduled: true`) and `invitee.created`
(the new time). Ignore a canceled event with `rescheduled: true`; the created event updates the time.

**Signature:** header `Calendly-Webhook-Signature: t=<unix ts>,v1=<hex>`. Expected
`v1 = HMAC_SHA256(CALENDLY_SIGNING_KEY, "<t>.<raw body>")` as hex. Reject if it doesn't match or if
`t` is more than 3 minutes old.

### Cal.com

Webhook body: `{"triggerEvent": "BOOKING_CREATED" | "BOOKING_RESCHEDULED" | "BOOKING_CANCELLED" | ..., "createdAt": "...", "payload": {...}}`

| Need | Path in `payload` |
|---|---|
| Phone (1st choice) | `responses.attendeePhoneNumber.value` |
| Phone (2nd) | `attendees[0].phoneNumber` |
| Phone (3rd) | `smsReminderNumber` |
| Phone (4th) | `responses.location.value.optionValue` (when the location is "attendee phone") |
| Name / email | `attendees[0].name`, `attendees[0].email` (also `responses.name.value`, `responses.email.value`) |
| Invitee timezone | `attendees[0].timeZone` |
| Call start / end | `startTime`, `endTime` |
| Event name | `title` (or `type`) |
| Meeting link | `metadata.videoCallUrl` (may be missing) |
| Booking id | `uid` |

`BOOKING_RESCHEDULED` carries the new `startTime`. A ping test from the Cal.com UI sends
`triggerEvent: "PING"` — answer `200`.

**Signature:** header `x-cal-signature-256: <hex>` = `HMAC_SHA256(CALCOM_WEBHOOK_SECRET, <raw body>)`.

> Field paths can vary with the account's settings. Before going live, log one real payload of each
> type (with the signature check on) and confirm the phone is found.

---

## Build the relay

Pick the project's stack. Below: a framework-free TypeScript core (works in Next.js, Vercel/Netlify
functions, Cloudflare Workers, Bun, Node 18+) plus thin Next.js routes, and a Python version.

### TypeScript core — `lib/smsloop-booking.ts`

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

type Result = { status: number; body: Record<string, unknown> };
type Json = Record<string, any>;

const env = (k: string) => process.env[k] ?? "";

function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length > 0 && ab.length === bb.length && timingSafeEqual(ab, bb);
}

function hmacHex(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data, "utf8").digest("hex");
}

/** Drop empty values; SMSLoop wants flat strings. */
function clean(obj: Json): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && String(v).trim() !== "") out[k] = String(v);
  }
  return out;
}

async function smsloop(body: Json): Promise<Result> {
  let res: Response;
  try {
    res = await fetch(`${env("SMSLOOP_URL")}/leads/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-SMSLoop-Secret": env("SMSLOOP_SECRET") },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    console.error("SMSLoop unreachable", e);
    return { status: 502, body: { error: "smsloop_unreachable" } }; // booking tool will retry
  }
  const data = await res.json().catch(() => ({}));
  if (res.ok) return { status: 200, body: data };
  console.error("SMSLoop rejected", res.status, data);
  // 4xx (bad secret / phone / scenario key) won't fix itself on retry; 409/5xx might.
  const retry = res.status === 409 || res.status >= 500;
  return { status: retry ? 502 : 200, body: { error: "smsloop_rejected", smsloop_status: res.status } };
}

function bookedEvent(phone: string, who: Json, context: Json, source: string): Json {
  return {
    phone,
    event: "set_scenario",
    scenario: env("SMSLOOP_BOOKED_SCENARIO") || "booked",
    source,
    ...clean(who),
    context: clean(context),
  };
}

function cancelEvent(phone: string, callStart: string | undefined, tool: string): Json {
  const onCancel = env("SMSLOOP_ON_CANCEL") || "ai_off";
  if (onCancel === "ai_off") {
    return { phone, event: "ai_off", reason: `Cancelled their call in ${tool}` };
  }
  return { phone, event: "set_scenario", scenario: onCancel, context: clean({ cancelled_call: callStart }) };
}

// ── Calendly ──────────────────────────────────────────────────────────────

export function verifyCalendly(raw: string, header: string | null): boolean {
  const key = env("CALENDLY_SIGNING_KEY");
  if (!key || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.trim().split("=", 2)));
  const t = Number(parts.t);
  if (!t || !parts.v1 || Math.abs(Date.now() / 1000 - t) > 180) return false;
  return safeEqualHex(hmacHex(key, `${parts.t}.${raw}`), parts.v1);
}

function calendlyPhone(p: Json): string | undefined {
  if (p.text_reminder_number) return p.text_reminder_number;
  const qa = (p.questions_and_answers ?? []).find(
    (q: Json) => /phone|mobile|cell|whatsapp/i.test(q.question ?? "") && q.answer,
  );
  if (qa) return qa.answer;
  const loc = p.scheduled_event?.location;
  if (loc?.type === "outbound_call" && loc.location) return loc.location;
  return undefined;
}

export async function handleCalendly(raw: string, signature: string | null): Promise<Result> {
  if (!verifyCalendly(raw, signature)) return { status: 401, body: { error: "bad_signature" } };
  const body: Json = JSON.parse(raw);
  const p: Json = body.payload ?? {};
  const ev = p.scheduled_event ?? {};
  const phone = calendlyPhone(p);
  if (!phone) {
    console.warn("Calendly booking without a phone number", p.email);
    return { status: 200, body: { skipped: "no_phone" } };
  }
  if (body.event === "invitee.created") {
    return smsloop(
      bookedEvent(
        phone,
        { name: p.name, email: p.email },
        {
          call_start: ev.start_time,
          call_end: ev.end_time,
          timezone: p.timezone,
          event_name: ev.name,
          meeting_link: ev.location?.join_url,
          reschedule_link: p.reschedule_url,
          cancel_link: p.cancel_url,
        },
        "Calendly",
      ),
    );
  }
  if (body.event === "invitee.canceled") {
    if (p.rescheduled) return { status: 200, body: { skipped: "rescheduled" } }; // invitee.created follows
    return smsloop(cancelEvent(phone, ev.start_time, "Calendly"));
  }
  return { status: 200, body: { skipped: body.event } };
}

// ── Cal.com ───────────────────────────────────────────────────────────────

export function verifyCalcom(raw: string, header: string | null): boolean {
  const secret = env("CALCOM_WEBHOOK_SECRET");
  if (!secret || !header) return false;
  return safeEqualHex(hmacHex(secret, raw), header.trim());
}

function calcomPhone(p: Json): string | undefined {
  const r = p.responses ?? {};
  const loc = r.location?.value;
  return (
    r.attendeePhoneNumber?.value ||
    p.attendees?.[0]?.phoneNumber ||
    p.smsReminderNumber ||
    (typeof loc === "object" && loc?.optionValue) ||
    undefined
  );
}

export async function handleCalcom(raw: string, signature: string | null): Promise<Result> {
  if (!verifyCalcom(raw, signature)) return { status: 401, body: { error: "bad_signature" } };
  const body: Json = JSON.parse(raw);
  const trigger: string = body.triggerEvent;
  const p: Json = body.payload ?? {};
  if (!["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"].includes(trigger)) {
    return { status: 200, body: { skipped: trigger } }; // PING and everything else
  }
  const attendee: Json = p.attendees?.[0] ?? {};
  const phone = calcomPhone(p);
  if (!phone) {
    console.warn("Cal.com booking without a phone number", attendee.email);
    return { status: 200, body: { skipped: "no_phone" } };
  }
  if (trigger === "BOOKING_CANCELLED") return smsloop(cancelEvent(phone, p.startTime, "Cal.com"));
  return smsloop(
    bookedEvent(
      phone,
      { name: attendee.name, email: attendee.email },
      {
        call_start: p.startTime,
        call_end: p.endTime,
        timezone: attendee.timeZone,
        event_name: p.title,
        meeting_link: p.metadata?.videoCallUrl,
      },
      "Cal.com",
    ),
  );
}
```

### Next.js (App Router) routes

```ts
// app/api/booking-webhook/calendly/route.ts
import { handleCalendly } from "@/lib/smsloop-booking";

export async function POST(req: Request) {
  const raw = await req.text(); // raw body — needed for the signature
  const { status, body } = await handleCalendly(raw, req.headers.get("calendly-webhook-signature"));
  return Response.json(body, { status });
}
```

```ts
// app/api/booking-webhook/calcom/route.ts
import { handleCalcom } from "@/lib/smsloop-booking";

export async function POST(req: Request) {
  const raw = await req.text();
  const { status, body } = await handleCalcom(raw, req.headers.get("x-cal-signature-256"));
  return Response.json(body, { status });
}
```

Use the Node.js runtime (default), not Edge — the core uses `node:crypto`. For **Express**, mount
the route with `express.raw({ type: "application/json" })` and pass `req.body.toString("utf8")` as
`raw`. For **Cloudflare Workers / Vercel Edge**, swap `createHmac` for Web Crypto
`crypto.subtle.sign("HMAC", ...)`.

### Python (FastAPI / Flask) — same logic

```python
import hashlib, hmac, json, os, re, time
import requests

def _env(k, default=""):
    return os.environ.get(k, default)

def _clean(d):
    return {k: str(v) for k, v in d.items() if v not in (None, "") and str(v).strip()}

def _smsloop(body):
    """Returns (http_status_for_the_booking_tool, response_dict)."""
    try:
        r = requests.post(f"{_env('SMSLOOP_URL')}/leads/event", json=body, timeout=10,
                          headers={"X-SMSLoop-Secret": _env("SMSLOOP_SECRET")})
    except requests.RequestException as e:
        print("SMSLoop unreachable", e)
        return 502, {"error": "smsloop_unreachable"}
    if r.ok:
        return 200, r.json()
    print("SMSLoop rejected", r.status_code, r.text)
    return (502 if r.status_code == 409 or r.status_code >= 500 else 200), {"error": "smsloop_rejected"}

def _booked(phone, who, context, source):
    return {"phone": phone, "event": "set_scenario", "scenario": _env("SMSLOOP_BOOKED_SCENARIO", "booked"),
            "source": source, **_clean(who), "context": _clean(context)}

def _cancel(phone, call_start, tool):
    on_cancel = _env("SMSLOOP_ON_CANCEL", "ai_off")
    if on_cancel == "ai_off":
        return {"phone": phone, "event": "ai_off", "reason": f"Cancelled their call in {tool}"}
    return {"phone": phone, "event": "set_scenario", "scenario": on_cancel,
            "context": _clean({"cancelled_call": call_start})}

# ── Calendly ──
def verify_calendly(raw: bytes, header: str | None) -> bool:
    key = _env("CALENDLY_SIGNING_KEY")
    if not key or not header:
        return False
    parts = dict(p.strip().split("=", 1) for p in header.split(",") if "=" in p)
    t, v1 = parts.get("t", ""), parts.get("v1", "")
    if not t.isdigit() or not v1 or abs(time.time() - int(t)) > 180:
        return False
    expected = hmac.new(key.encode(), f"{t}.".encode() + raw, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, v1)

def _calendly_phone(p):
    if p.get("text_reminder_number"):
        return p["text_reminder_number"]
    for q in p.get("questions_and_answers") or []:
        if re.search(r"phone|mobile|cell|whatsapp", q.get("question") or "", re.I) and q.get("answer"):
            return q["answer"]
    loc = (p.get("scheduled_event") or {}).get("location") or {}
    if loc.get("type") == "outbound_call" and loc.get("location"):
        return loc["location"]
    return None

def handle_calendly(raw: bytes, signature: str | None):
    if not verify_calendly(raw, signature):
        return 401, {"error": "bad_signature"}
    body = json.loads(raw)
    p = body.get("payload") or {}
    ev = p.get("scheduled_event") or {}
    phone = _calendly_phone(p)
    if not phone:
        return 200, {"skipped": "no_phone"}
    if body.get("event") == "invitee.created":
        return _smsloop(_booked(phone, {"name": p.get("name"), "email": p.get("email")}, {
            "call_start": ev.get("start_time"), "call_end": ev.get("end_time"),
            "timezone": p.get("timezone"), "event_name": ev.get("name"),
            "meeting_link": (ev.get("location") or {}).get("join_url"),
            "reschedule_link": p.get("reschedule_url"), "cancel_link": p.get("cancel_url"),
        }, "Calendly"))
    if body.get("event") == "invitee.canceled":
        if p.get("rescheduled"):
            return 200, {"skipped": "rescheduled"}
        return _smsloop(_cancel(phone, ev.get("start_time"), "Calendly"))
    return 200, {"skipped": body.get("event")}

# ── Cal.com ──
def verify_calcom(raw: bytes, header: str | None) -> bool:
    secret = _env("CALCOM_WEBHOOK_SECRET")
    if not secret or not header:
        return False
    expected = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header.strip())

def _calcom_phone(p):
    r = p.get("responses") or {}
    loc = (r.get("location") or {}).get("value")
    return ((r.get("attendeePhoneNumber") or {}).get("value")
            or ((p.get("attendees") or [{}])[0]).get("phoneNumber")
            or p.get("smsReminderNumber")
            or (loc.get("optionValue") if isinstance(loc, dict) else None))

def handle_calcom(raw: bytes, signature: str | None):
    if not verify_calcom(raw, signature):
        return 401, {"error": "bad_signature"}
    body = json.loads(raw)
    trigger, p = body.get("triggerEvent"), body.get("payload") or {}
    if trigger not in ("BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"):
        return 200, {"skipped": trigger}
    attendee = (p.get("attendees") or [{}])[0]
    phone = _calcom_phone(p)
    if not phone:
        return 200, {"skipped": "no_phone"}
    if trigger == "BOOKING_CANCELLED":
        return _smsloop(_cancel(phone, p.get("startTime"), "Cal.com"))
    return _smsloop(_booked(phone, {"name": attendee.get("name"), "email": attendee.get("email")}, {
        "call_start": p.get("startTime"), "call_end": p.get("endTime"),
        "timezone": attendee.get("timeZone"), "event_name": p.get("title"),
        "meeting_link": (p.get("metadata") or {}).get("videoCallUrl"),
    }, "Cal.com"))

# FastAPI wiring:
# @app.post("/api/booking-webhook/calendly")
# async def calendly(request: Request):
#     status, body = handle_calendly(await request.body(), request.headers.get("calendly-webhook-signature"))
#     return JSONResponse(body, status_code=status)
#
# @app.post("/api/booking-webhook/calcom")
# async def calcom(request: Request):
#     status, body = handle_calcom(await request.body(), request.headers.get("x-cal-signature-256"))
#     return JSONResponse(body, status_code=status)
```

---

## Connect the booking tool

Do this after the relay is deployed and reachable over **https**.

### Calendly

Webhooks need a **paid Calendly plan** and are created through the API (there is no button in the
Calendly UI).

1. The owner creates a **Personal Access Token**: Calendly → Integrations & apps → API and webhooks →
   Personal access tokens → Generate. (Scope `webhooks:write` + `scheduled_events:read` if asked.)
2. Get the user and organization URIs:
   ```bash
   curl -s https://api.calendly.com/users/me -H "Authorization: Bearer $CALENDLY_TOKEN"
   # → resource.uri  (user)   resource.current_organization  (organization)
   ```
3. Generate a signing key (`openssl rand -hex 32`), put it in the relay's env as
   `CALENDLY_SIGNING_KEY`, then create the subscription:
   ```bash
   curl -s -X POST https://api.calendly.com/webhook_subscriptions \
     -H "Authorization: Bearer $CALENDLY_TOKEN" -H "Content-Type: application/json" \
     -d '{
       "url": "https://YOUR-SITE.com/api/booking-webhook/calendly",
       "events": ["invitee.created", "invitee.canceled"],
       "organization": "https://api.calendly.com/organizations/XXXX",
       "user": "https://api.calendly.com/users/XXXX",
       "scope": "user",
       "signing_key": "<CALENDLY_SIGNING_KEY>"
     }'
   ```
   Use `"scope": "organization"` (and drop `user`) to cover every host in the organization — owners
   and admins only.
4. On the event type, make sure a phone is collected (SMS reminders on, or a required **Phone
   number** question).

To list or delete subscriptions later: `GET /webhook_subscriptions?organization=...&scope=user&user=...`,
`DELETE /webhook_subscriptions/{uuid}`.

### Cal.com

1. Cal.com → **Settings → Developer → Webhooks → New**.
2. **Subscriber URL:** `https://YOUR-SITE.com/api/booking-webhook/calcom`
3. **Event triggers:** Booking Created, Booking Rescheduled, Booking Cancelled (others are ignored
   by the relay anyway).
4. **Secret:** generate one (`openssl rand -hex 32`), paste it here and in the relay's env as
   `CALCOM_WEBHOOK_SECRET`.
5. **Payload template:** leave empty (default payload — the relay needs the full payload to find the
   phone).
6. Save. A webhook can also be added per event type (event type → Webhooks) if only some calls
   should count.
7. On the event type → Advanced, enable the **Phone number** booking question and make it required.

---

## Test checklist

1. Deploy the relay with all env vars set. `SMSLOOP_BOOKED_SCENARIO` must match an existing
   scenario key (a wrong key makes SMSLoop answer `422 Unknown scenario`).
2. Send a request with a bad signature → relay answers `401`.
3. Fill the landing page form with your own phone → SMSLoop lead in `not_booked`.
4. Book a call in Calendly / Cal.com with **the same phone** → relay logs SMSLoop's
   `{"status": "switched"}` → the lead shows the `booked` scenario in the SMSLoop dashboard and
   you get the booked scenario's text (if its opener is set up and the bot is ON).
5. Reschedule → `{"status": "updated"}`, no new text.
6. Cancel → `{"status": "ai_off"}` (or `switched` to `SMSLOOP_ON_CANCEL`).
7. Book with a number SMSLoop doesn't know → `{"status": "created"}` (new lead straight into
   `booked`).

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Relay returns `401` to real webhooks | Wrong secret/signing key, or the body was parsed before verifying. Verify against the raw body text. |
| `skipped: no_phone` | Booking form doesn't collect a phone. Add the question / SMS reminders; log a payload to find where the phone is. |
| SMSLoop `422 Unknown scenario` | `SMSLOOP_BOOKED_SCENARIO` doesn't exist in the dashboard. Create it or fix the key. |
| SMSLoop `422 phone` | The number has no country code and isn't valid in the deployment's default country. Collect `+country code`. |
| SMSLoop `401` | `SMSLOOP_SECRET` wrong or rotated in the dashboard. |
| Lead booked but a *new* lead appeared in SMSLoop | The booking phone differs from the landing-page phone. Pre-fill the phone into the booking link. |
| Calendly webhook stopped arriving | Calendly disables subscriptions that keep failing. Check the relay's logs, fix, recreate the subscription. |
