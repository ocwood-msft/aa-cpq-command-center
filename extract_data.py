"""
Extract & summarize the AA agency incentive workbook ("2026 Programs Model - Midsize TMC.xlsx")
into a JSON data file the command-center app can render.

JTBD anchor (from AA_CPQ transcript):
  1) Deal Modeling   - analysts build agency deals in Excel, one agency/entity at a time
  2) Contract Gen    - Windward/Fluent turns the model into a Word contract
  3) Signature Route - manual today, DocuSign-style desired
  4) Reconciliation  - quarter-end payout calc, ~90 days today

This script produces the "Deal Modeling" data: per-agency, per-entity rollups of flown
revenue, break-even eligible revenue, commission payments, and RSP (Revenue Share
Performance = actual share / QSI-predicted share; 100 = fair share) computed from the
PMT (payments) and PERF (performance/QSI) sheets.
"""
import json
import math
from collections import defaultdict

import openpyxl

SRC = r"C:\Users\ochapman\Downloads\2026 Programs Model - Midsize TMC.xlsx"

wb = openpyxl.load_workbook(SRC, data_only=True, read_only=True)


def sheet_rows(name):
    ws = wb[name]
    it = ws.iter_rows(values_only=True)
    header = next(it)
    header = [h if h is not None else f"col{i}" for i, h in enumerate(header)]
    for row in it:
        if row and any(v is not None for v in row):
            yield dict(zip(header, row))


# ---------- PMT: quarterly payments detail (agency x entity x cabin x market) ----------
agency_entity = defaultdict(lambda: {
    "gross_revenue": 0.0,
    "be_elig_revenue": 0.0,
    "ttl_be_pmts": 0.0,
    "psp_prem": 0.0,
    "psp_econ": 0.0,
    "svc_incntv": 0.0,
    "upsell": 0.0,
    "ndc_adopt": 0.0,
    "dc_bonus": 0.0,
    "quarters": set(),
    "markets": defaultdict(lambda: {"gross_revenue": 0.0, "ttl_be_pmts": 0.0}),
})

n = 0
for r in sheet_rows("PMT"):
    n += 1
    agency = (r.get("AGENCY") or "UNKNOWN").strip()
    entity = r.get("ENTITY") or "?"
    key = (agency, entity)
    a = agency_entity[key]
    a["gross_revenue"] += r.get("GROSS_REVENUE") or 0
    a["be_elig_revenue"] += r.get("BE_ELIG_REVENUE") or 0
    a["ttl_be_pmts"] += r.get("TTL_BE_PMTS") or 0
    a["psp_prem"] += r.get("PSP_Prem") or 0
    a["psp_econ"] += r.get("PSP_Econ") or 0
    a["svc_incntv"] += r.get("Svc_Incntv") or 0
    a["upsell"] += r.get("Upsell") or 0
    a["ndc_adopt"] += r.get("NDC_Adopt") or 0
    a["dc_bonus"] += r.get("DC_Bonus") or 0
    if r.get("DEP_QTR"):
        a["quarters"].add(r["DEP_QTR"])
    mkt = r.get("MARKET") or "?"
    m = a["markets"][mkt]
    m["gross_revenue"] += r.get("GROSS_REVENUE") or 0
    m["ttl_be_pmts"] += r.get("TTL_BE_PMTS") or 0

print(f"PMT rows processed: {n}")
print(f"Distinct agency/entity pairs: {len(agency_entity)}")

# ---------- PERF: pax & revenue vs QSI-predicted (for RSP) ----------
perf = defaultdict(lambda: {"pax": 0.0, "qsi_pax": 0.0, "rev": 0.0, "qsi_rev": 0.0})
n = 0
for r in sheet_rows("PERF"):
    n += 1
    agency = (r.get("AGENCY") or "UNKNOWN").strip()
    entity = r.get("ENTITY") or "?"
    key = (agency, entity)
    p = perf[key]
    p["pax"] += r.get("AAJB_Pax") or 0
    p["qsi_pax"] += r.get("AAJB_QSI_Pax") or 0
    p["rev"] += r.get("AAJB_Rev") or 0
    p["qsi_rev"] += r.get("AAJB_QSI_Rev") or 0
print(f"PERF rows processed: {n}")


def rsp(key):
    p = perf.get(key)
    if not p or not p["qsi_rev"]:
        return None
    actual_share = p["rev"]
    qsi_share = p["qsi_rev"]
    if qsi_share == 0:
        return None
    return round(100.0 * actual_share / qsi_share, 1)


# ---------- Build per-agency rollup (sum across entities) ----------
agencies = defaultdict(lambda: {
    "gross_revenue": 0.0,
    "be_elig_revenue": 0.0,
    "ttl_be_pmts": 0.0,
    "entities": {},
})

for (agency, entity), a in agency_entity.items():
    ag = agencies[agency]
    ag["gross_revenue"] += a["gross_revenue"]
    ag["be_elig_revenue"] += a["be_elig_revenue"]
    ag["ttl_be_pmts"] += a["ttl_be_pmts"]
    commission_rate = (a["ttl_be_pmts"] / a["gross_revenue"] * 100) if a["gross_revenue"] else 0
    r = rsp((agency, entity))
    top_markets = sorted(
        ({"market": mk, "gross_revenue": round(v["gross_revenue"], 2),
          "commission": round(v["ttl_be_pmts"], 2)}
         for mk, v in a["markets"].items()),
        key=lambda x: -x["gross_revenue"],
    )[:6]
    ag["entities"][entity] = {
        "entity": entity,
        "gross_revenue": round(a["gross_revenue"], 2),
        "be_elig_revenue": round(a["be_elig_revenue"], 2),
        "ttl_be_pmts": round(a["ttl_be_pmts"], 2),
        "commission_rate_pct": round(commission_rate, 2),
        "rsp": r,
        "markets": top_markets,
        "quarters": sorted(a["quarters"]),
    }

agency_list = []
for name, ag in agencies.items():
    commission_rate = (ag["ttl_be_pmts"] / ag["gross_revenue"] * 100) if ag["gross_revenue"] else 0
    rsps = [e["rsp"] for e in ag["entities"].values() if e["rsp"] is not None]
    avg_rsp = round(sum(rsps) / len(rsps), 1) if rsps else None
    # crude "bespoke vs templated" split per the transcript (~15-20 bespoke agencies)
    tier = "Bespoke" if ag["gross_revenue"] > 3_000_000 else "Templated"
    agency_list.append({
        "name": name.title(),
        "gross_revenue": round(ag["gross_revenue"], 2),
        "be_elig_revenue": round(ag["be_elig_revenue"], 2),
        "ttl_be_pmts": round(ag["ttl_be_pmts"], 2),
        "commission_rate_pct": round(commission_rate, 2),
        "avg_rsp": avg_rsp,
        "tier": tier,
        "entities": list(ag["entities"].values()),
    })

agency_list.sort(key=lambda a: -a["gross_revenue"])

# ---------- Program-level KPIs ----------
total_gross = sum(a["gross_revenue"] for a in agency_list)
total_pmts = sum(a["ttl_be_pmts"] for a in agency_list)
bespoke_count = sum(1 for a in agency_list if a["tier"] == "Bespoke")

out = {
    "generated_from": "2026 Programs Model - Midsize TMC.xlsx",
    "program_kpis": {
        "channel_revenue_label": "$15B",
        "one_pct_impact_label": "$150M",
        "agencies_modeled_per_year": 700,
        "modeling_team_size": 10,
        "reconciliation_days": 90,
        "long_tail_agencies": 700,
        "sample_total_gross_revenue": round(total_gross, 2),
        "sample_total_commission_paid": round(total_pmts, 2),
        "sample_blended_commission_rate_pct": round(total_pmts / total_gross * 100, 2) if total_gross else 0,
        "sample_agency_count": len(agency_list),
        "sample_bespoke_count": bespoke_count,
    },
    "agencies": agency_list,
}

with open("public_data.json", "w") as f:
    json.dump(out, f, indent=2)

print(f"Wrote public_data.json with {len(agency_list)} agencies, total gross rev ${total_gross:,.0f}")
