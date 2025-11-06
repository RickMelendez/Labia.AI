import { useState, useCallback } from 'react';
import { container } from '../../infrastructure/di/Container';

export function useAssistant() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assist = useCallback(async (query: string, culturalStyle: string, mode: 'coach' | 'ideas' | 'rewrite' | 'troubleshoot' = 'coach') => {
    const normalized = query.replace(/\s+/g, ' ').trim();
    if (normalized.length < 5) {
      const msg = 'Escribe tu consulta con al menos 5 caracteres.';
      setError(msg);
      container.haptics.warning();
      container.toast.info('Consulta muy corta', msg);
      return [] as string[];
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const useCase = container.assistUseCase;
      const res = await useCase.execute({ query: normalized, culturalStyle, mode, numSuggestions: 3 });
      setSuggestions(res.suggestions);
      container.haptics.success();
      return res.suggestions;
    } catch (err: any) {
      const msg = err?.detail || err?.message || 'Error del asistente';
      setError(msg);
      container.haptics.error();
      container.toast.error('Error', msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, isLoading, error, assist, clear };
}

