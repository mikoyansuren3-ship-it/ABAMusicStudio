# Cookie Consent — design, legal basis, and owner actions

Records why the consent manager behaves the way it does, so the reasoning
survives the next person to touch it (and can be handed to counsel).

Implementation: `lib/consent/` (state, cookie, server reader),
`components/consent/` (banner, preferences dialog, tag loader), public
disclosure at `/cookies`.

---

## Legal model: California / CCPA-CPRA

The studio serves the Santa Clarita Valley and its visitors are effectively all
US-based, so the site is built to CCPA/CPRA rather than GDPR. That is an
**opt-out** regime: analytics may run before the visitor chooses, provided the
notice is clear and opting out is easy.

We depart from the statutory minimum in one direction — never the other:

| Category | Before a choice is made | Why |
|---|---|---|
| Strictly necessary | On, cannot be disabled | Sessions, payment fraud checks, the consent cookie itself |
| Functional | On | Login convenience; opt-out honoured immediately |
| Analytics | **On** | Permitted opt-out model under CPRA; preserves usable traffic data |
| Advertising | **Off until opt-in** | See below |

**Why advertising is opt-in.** Using ad pixels is "sharing" for cross-context
behavioural advertising under CPRA. § 1798.120(c) requires opt-in consent to
sell or share the personal information of consumers under 16, and this is a
studio whose audience is families with children. Rather than try to
age-gate a marketing site, advertising simply stays off until someone turns it
on. This also keeps the site clean if the studio ever takes EU enquiries.

**Switching to a GDPR posture** is a one-line change: set `analytics: false` in
`PRE_DECISION_STATE` (`lib/consent/config.ts`). The banner, the tag loader, and
Google Consent Mode all derive their behaviour from that constant.

## What is implemented

- **Accept all / Reject all / Customize**, with reject reachable in one click
  from the banner. An opt-out is never harder than an opt-in — on mobile the
  two buttons are the same size on the same row.
- **Google Consent Mode v2** signals are declared *before* `gtag config` runs.
- **Basic consent mode**: `gtag.js` and the Meta pixel are not requested at all
  until their category is granted, so a visitor who declines causes no request
  to Google or Meta.
- **Global Privacy Control** is honoured automatically. A GPC signal forces
  advertising off and locks the toggle, overriding a stored opt-in. California
  requires GPC to be treated as a valid opt-out of sale/sharing.
- **Withdrawal deletes cookies already set** (`_ga`, `_ga_*`, `_gid`, `_gcl_*`,
  `_fbp`, `_fbc`) rather than only suppressing future tags.
- **Proof of consent**: the `aba_consent` cookie stores the categories, a
  decision timestamp, and whether GPC was present, in readable JSON.
- **Re-consent**: bumping `CONSENT_VERSION` invalidates stored decisions and
  brings the banner back. The previous `aba_cookie_consent` cookie is treated
  as no decision and cleared, because it recorded a choice about a narrower set
  of cookies than the site runs now.

## Owner actions

1. **Nothing tracks until IDs are set.** Each tag is skipped when its variable
   is absent, so today the site loads no third-party tags at all. To switch
   them on, add to Vercel (Production):
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` — GA4, `G-…`
   - `NEXT_PUBLIC_GOOGLE_ADS_ID` — Google Ads, `AW-…`
   - `NEXT_PUBLIC_META_PIXEL_ID` — Meta pixel
2. **Sign a Google Ads data processing amendment** and enable Consent Mode in
   the GA4 property before running ads.
3. **Counsel review** of `/cookies` alongside the Privacy Policy — the two must
   agree, and the Privacy Policy is still a noindexed draft.
4. **Keep the inventory true.** The tables on `/cookies` are the disclosure that
   makes the banner meaningful. Adding a cookie means updating that page and
   bumping `CONSENT_VERSION`.
