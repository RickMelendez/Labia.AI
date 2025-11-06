import * as Clipboard from 'expo-clipboard';
import { IClipboardService } from '../../application/ports/IClipboardService';

/**
 * ClipboardService
 * Implements clipboard operations using expo-clipboard
 */
export class ClipboardService implements IClipboardService {
  async copy(text: string): Promise<void> {
    await Clipboard.setStringAsync(text);
  }

  async paste(): Promise<string | null> {
    const text = await Clipboard.getStringAsync();
    return text || null;
  }
}

// Singleton instance
export const clipboardService = new ClipboardService();
