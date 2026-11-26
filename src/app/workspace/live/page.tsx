'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Globe,
  Volume2,
  VolumeX,
  Loader2,
  ArrowRightLeft,
  Bookmark,
} from 'lucide-react';
import { LANGUAGES } from '../../../lib/languages';
import {
  addTranslationRecord,
  toggleSavedRecord,
} from '../../../lib/storage';

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  ha: 'ha-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
  pcm: 'en-NG',
  fr: 'fr-FR',
  ar: 'ar-SA',
  sw: 'sw-KE',
  es: 'es-ES',
  pt: 'pt-BR',
};

function getSpeechLocale(code: string): string {
  return LOCALE_MAP[code] || code;
}

export default function LivePage() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ha');
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [engineUsed, setEngineUsed] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const savedAutoSpeak = localStorage.getItem('lank_auto_speak');
    if (savedAutoSpeak === 'true') {
      setAutoSpeak(true);
    }

    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleAutoSpeak = () => {
    const nextValue = !autoSpeak;
    setAutoSpeak(nextValue);
    localStorage.setItem('lank_auto_speak', String(nextValue));
    if (!nextValue && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const speakText = (text: string, lang: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = getSpeechLocale(lang);
    utterance.lang = targetLocale;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === targetLocale.toLowerCase()) ||
      voices.find((v) =>
        v.lang.toLowerCase().startsWith(lang.toLowerCase())
      );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleBookmark = () => {
    if (!currentRecordId) return;
    const updated = toggleSavedRecord(currentRecordId);
    const match = updated.find((item) => item.id === currentRecordId);
    setIsCurrentSaved(Boolean(match?.saved));
  };

  const handleInterpret = async (textToTranslate?: string) => {
    const text = (textToTranslate ?? inputText).trim();
    if (!text) return;

    setLoading(true);
    setTranscript(text);
    setCurrentRecordId(null);
    setIsCurrentSaved(false);

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('sourceLang', sourceLang);
      formData.append('targetLang', targetLang);

      const response = await fetch('/api/interpret', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const translatedText = data.translation ?? '';
        const engine = data.engineUsed ?? '';
        const elapsed =
          typeof data.latencyMs === 'number' ? data.latencyMs : null;

        setTranslation(translatedText);
        setEngineUsed(engine);
        setLatency(elapsed);

        if (translatedText) {
          const savedEntry = addTranslationRecord({
            sourceText: text,
            translatedText,
            sourceLang,
            targetLang,
            engineUsed: engine,
            latencyMs: elapsed,
          });
          setCurrentRecordId(savedEntry.id);

          if (autoSpeak) {
            speakText(translatedText, targetLang);
          }
        }
      } else {
        setTranslation(
          data.error || 'Error performing translation. Please try again.'
        );
      }
    } catch (error) {
      console.error('Translation network error:', error);
      setTranslation('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setTranslation(
        'Voice input is not supported in this browser. Try Google Chrome or Microsoft Edge.'
      );
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLocale(sourceLang);
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let spokenText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        spokenText += event.results[i][0].transcript;
      }
      setInputText(spokenText.trim());
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);

      if (event.error === 'not-allowed') {
        setTranslation(
          'Microphone permission was blocked. Allow mic access in your browser address bar and try again.'
        );
      } else if (event.error === 'no-speech') {
        setTranslation(
          'No speech was detected. Speak closer to the mic or check your Windows microphone input.'
        );
      } else if (event.error === 'network') {
        setTranslation(
          'Browser speech service could not reach the network. Check your connection or type your phrase directly.'
        );
      } else {
        setTranslation(
          `Voice capture issue (${event.error}). Check your microphone input device or try English.`
        );
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsRecording(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-400" />
            Live Voice Interpreter
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Powered by LANK AI &amp; Google Gemini API
          </p>
        </div>

        {/* Language Selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map((lang: any) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={swapLanguages}
            title="Swap Languages"
            className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map((lang: any) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Box */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Source Speech / Text
              </label>
              {transcript && (
                <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                  Sent: {transcript}
                </span>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your phrase or click the mic to speak..."
              className="w-full h-40 bg-transparent text-slate-100 placeholder-slate-500 resize-none focus:outline-none text-base"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isRecording ? 'Stop Recording' : 'Record Voice'}
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleInterpret()}
              disabled={loading || !inputText.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Translate
            </button>
          </div>
        </div>

        {/* Output Box */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Translated Interpretation
              </label>
              {engineUsed && (
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  {engineUsed}
                  {latency !== null ? ` (${latency}ms)` : ''}
                </span>
              )}
            </div>

            <div className="h-40 overflow-y-auto text-slate-100 text-base">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="ml-2 text-sm text-slate-400">
                    Processing translation...
                  </span>
                </div>
              ) : translation ? (
                <p className="leading-relaxed">{translation}</p>
              ) : (
                <span className="text-slate-600 italic">
                  Translation will appear here...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAutoSpeak}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  autoSpeak
                    ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Toggle automatic voice playback after translation"
              >
                {autoSpeak ? (
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
                Auto-Speak: {autoSpeak ? 'On' : 'Off'}
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={!currentRecordId}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-40 ${
                  isCurrentSaved
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Save translation to Saved Phrases"
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isCurrentSaved ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
                {isCurrentSaved ? 'Saved' : 'Save'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => speakText(translation, targetLang)}
              disabled={!translation}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium transition-colors"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              Pronounce
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}