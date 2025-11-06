import { useState, useCallback } from 'react';
import { Suggestion } from '../../domain/entities/Suggestion.entity';
import { container } from '../../infrastructure/di/Container';

/**
 * useGenerateOpeners Hook
 * Custom hook for generating conversation openers
 */
export function useGenerateOpeners() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOpeners = useCallback(async (
    bio: string,
    culturalStyle: string,
    interests?: string[],
    tone?: string
  ) => {
    // Client-side validation to avoid backend 422
    const normalizedBio = bio.replace(/\s+/g, ' ').trim();
    if (normalizedBio.length < 10) {
      const msg = 'Escribe al menos 10 caracteres para la bio.';
      setError(msg);
      container.haptics.warning?.();
      container.toast.info('Bio muy corta', msg);
      return [] as Suggestion[];
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const useCase = container.generateOpenersUseCase;
      const result = await useCase.execute({
        bio: normalizedBio,
        culturalStyle,
        interests,
        numSuggestions: 3,
        tone,
      });

      setSuggestions(result.suggestions);

      // Success feedback
      container.haptics.success();
      container.toast.success(
        '¡Listo!',
        `${result.suggestions.length} sugerencias generadas`
      );

      return result.suggestions;
    } catch (err: any) {
      // Friendly error extraction from API error shape
      let errorMessage = 'Error al generar sugerencias';
      const detail = err?.detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length) {
        // Pydantic-style errors
        const first = detail[0];
        const field = Array.isArray(first?.loc) ? String(first.loc[first.loc.length - 1]) : '';
        errorMessage = `${field ? field + ': ' : ''}${first?.msg || errorMessage}`;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);

      // Error feedback
      container.haptics.error();
      container.toast.error('Error', errorMessage);

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    generateOpeners,
    clear
  };
}
