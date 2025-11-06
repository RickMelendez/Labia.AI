import { useState, useCallback } from 'react';
import { Suggestion } from '../../domain/entities/Suggestion.entity';
import { container } from '../../infrastructure/di/Container';

/**
 * useSuggestionCard Hook
 * View logic for suggestion card component
 */
export function useSuggestionCard(suggestion: Suggestion) {
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await container.clipboard.copy(suggestion.text);
      container.haptics.success();
      container.toast.success('¡Copiado!', 'El texto ha sido copiado');
    } catch (error) {
      container.toast.error('Error', 'No se pudo copiar el texto');
    }
  }, [suggestion.text]);

  const handleLike = useCallback(() => {
    setLiked(true);
    container.haptics.success();
    container.toast.success('¡Gracias!', 'Nos alegra que te guste');
  }, []);

  const handleDislike = useCallback(() => {
    setLiked(false);
    container.haptics.light();
    container.toast.info('Gracias', 'Mejoraremos las sugerencias');
  }, []);

  return {
    liked,
    handleCopy,
    handleLike,
    handleDislike
  };
}
