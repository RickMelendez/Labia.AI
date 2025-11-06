/**
 * IClipboardService
 * Interface for clipboard operations
 */
export interface IClipboardService {
  copy(text: string): Promise<void>;
  paste(): Promise<string | null>;
}
