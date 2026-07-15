export interface MarketBreakdown {
  market: string;
  gross_revenue: number;
  commission: number;
}

export interface EntityRollup {
  entity: string;
  gross_revenue: number;
  be_elig_revenue: number;
  ttl_be_pmts: number;
  commission_rate_pct: number;
  rsp: number | null;
  markets: MarketBreakdown[];
  quarters: string[];
}

export interface Agency {
  name: string;
  gross_revenue: number;
  be_elig_revenue: number;
  ttl_be_pmts: number;
  commission_rate_pct: number;
  avg_rsp: number | null;
  tier: "Bespoke" | "Templated";
  entities: EntityRollup[];
}

export interface ProgramKpis {
  channel_revenue_label: string;
  one_pct_impact_label: string;
  agencies_modeled_per_year: number;
  modeling_team_size: number;
  reconciliation_days: number;
  long_tail_agencies: number;
  sample_total_gross_revenue: number;
  sample_total_commission_paid: number;
  sample_blended_commission_rate_pct: number;
  sample_agency_count: number;
  sample_bespoke_count: number;
}

export interface Dataset {
  generated_from: string;
  program_kpis: ProgramKpis;
  agencies: Agency[];
}
