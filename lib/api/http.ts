export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchJson<T>(url: string, errorMessage: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...init
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new ApiError(data?.message ?? `${errorMessage} Status: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(errorMessage);
  }
}
