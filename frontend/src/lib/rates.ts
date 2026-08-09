import { apiFetch } from "./api";

export interface ActiveRate {
  id: string;
  rateVES: number;
  date: string;
}

export interface ActiveRateResponse {
  rate: ActiveRate | null;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getActiveRate(date?: string): Promise<ActiveRateResponse> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return apiFetch<ActiveRateResponse>(`/rates/active${query}`);
}

export function setDailyRate(
  rateVES: number,
  date: string,
): Promise<{ rate: ActiveRate }> {
  return apiFetch<{ rate: ActiveRate }>("/rates", {
    method: "POST",
    body: JSON.stringify({ rateVES, date }),
  });
}
