const API_MIN_DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  await sleep(API_MIN_DELAY_MS);
  return fetch(input, init);
}

