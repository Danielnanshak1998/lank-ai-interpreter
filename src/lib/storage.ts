export interface TranslationRecord {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  engineUsed?: string;
  latencyMs?: number | null;
  saved: boolean;
  createdAt: string;
}

const HISTORY_KEY = 'lank_translation_history';

export function getTranslationRecords(): TranslationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read translation history:', err);
    return [];
  }
}

export function saveTranslationRecords(records: TranslationRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save translation history:', err);
  }
}

export function addTranslationRecord(
  entry: Omit<TranslationRecord, 'id' | 'saved' | 'createdAt'>
): TranslationRecord {
  const newRecord: TranslationRecord = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    saved: false,
    createdAt: new Date().toISOString(),
  };

  const existing = getTranslationRecords();
  const updated = [newRecord, ...existing].slice(0, 100);
  saveTranslationRecords(updated);
  return newRecord;
}

export function toggleSavedRecord(id: string): TranslationRecord[] {
  const existing = getTranslationRecords();
  const updated = existing.map((item) =>
    item.id === id ? { ...item, saved: !item.saved } : item
  );
  saveTranslationRecords(updated);
  return updated;
}

export function deleteTranslationRecord(id: string): TranslationRecord[] {
  const existing = getTranslationRecords();
  const updated = existing.filter((item) => item.id !== id);
  saveTranslationRecords(updated);
  return updated;
}

export function clearTranslationHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}