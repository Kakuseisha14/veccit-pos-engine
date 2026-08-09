export interface SetDailyRateInput {
  tenantId: string;
  rateVES: number;
  date: string;
}

export interface SetDailyRateOutput {
  rate: {
    id: string;
    rateVES: number;
    date: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
