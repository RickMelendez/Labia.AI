import { useAppStore } from '../../store/appStore';
import { STRINGS, Strings } from './strings';

export const useStrings = (): Strings => {
  const language = useAppStore((s) => s.language);
  return STRINGS[language] as Strings;
};
