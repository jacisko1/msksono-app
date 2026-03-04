export const PROGRESS_STORAGE_KEY = "msk-us-progress-v1";
export const PROGRESS_UPDATED_EVENT = "msk-us-progress-updated";

export const readProgress = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, boolean>;
    }
  } catch {
    // Ignore malformed storage and return empty map.
  }

  return {};
};

export const writeProgress = (next: Record<string, boolean>) => {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors (e.g. private mode quota)
  }

  window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
};

