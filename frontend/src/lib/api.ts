export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === "object" && "message" in body) {
        const raw = (body as { message: unknown }).message;
        if (Array.isArray(raw)) message = raw.join(", ");
        else if (typeof raw === "string") message = raw;
      }
    } catch {
      // keep default message when response has no JSON body
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}