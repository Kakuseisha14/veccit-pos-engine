export interface GetActiveRateInput {
  tenantId: string;
  date: string;
}

export interface GetActiveRateOutput {
  rate: {
    id: string;
    rateVES: number;
    date: string;
  } | null;
}
