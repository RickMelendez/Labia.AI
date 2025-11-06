import { useState, useCallback } from 'react';
import { Suggestion } from '../../domain/entities/Suggestion.entity';
import { container } from '../../infrastructure/di/Container';

/**
 * useGenerateResponses Hook
 * Custom hook for generating conversation responses
 */
export function useGenerateResponses() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSafe, setIsSafe] = useState(true);

  const generateResponses = useCallback(async (
    receivedMessage: string,
    culturalStyle: string,
    conversationContext?: string[],
    userInterests?: string[],
    tone?: string
  ) => {
    const normalizedMsg = receivedMessage.replace(/\s+/g, ' ').trim();
    if (normalizedMsg.length < 1) {
      const msg = 'Escribe un mensaje para generar respuestas.';
      setError(msg);
      container.haptics.warning?.();
      container.toast.info('Mensaje requerido', msg);
      return [] as Suggestion[];
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setIsSafe(true);

    try {
      const useCase = container.generateResponsesUseCase;
      const result = await useCase.execute({
        receivedMessage: normalizedMsg,
        culturalStyle,
        conversationContext,
        userInterests,
        numSuggestions: 3,
        tone,
      });

      setSuggestions(result.suggestions);
      setIsSafe(result.isSafe);

      // Success feedback
      container.haptics.success();
      container.toast.success(
        '¡Listo!',
        `${result.suggestions.length} respuestas generadas`
      );

      return result.suggestions;
    } catch (err: any) {
      let errorMessage = 'Error al generar respuestas';
      const detail = err?.detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length) {
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
    setIsSafe(true);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    isSafe,
    generateResponses,
    clear
  };
}
