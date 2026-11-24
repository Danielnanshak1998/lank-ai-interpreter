export interface TranslationResult {
  translation: string;
  engineUsed: string;
  latencyMs: number;
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  const start = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'gemini-3.5-flash-lite';

  try {
    if (apiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: 'You are LANK AI, a multilingual interpreter. Translate accurately between the source and target languages while preserving tone and meaning. Return ONLY the translated text with no extra explanation.',
                },
              ],
            },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Translate from "${sourceLang}" to "${targetLang}":\n${text}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const translated =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (translated) {
          return {
            translation: translated,
            engineUsed: `Gemini (${model})`,
            latencyMs: Date.now() - start,
          };
        }
      } else {
        const errText = await response.text();
        console.error('Gemini API request failed:', response.status, errText);
      }
    }
  } catch (error) {
    console.error('Translation cascade error:', error);
  }

  return {
    translation: text,
    engineUsed: 'Fallback-Echo',
    latencyMs: Date.now() - start,
  };
}