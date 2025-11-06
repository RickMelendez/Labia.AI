import * as Haptics from 'expo-haptics';
import { IHapticsService } from '../../application/ports/IHapticsService';

/**
 * HapticsService
 * Implements haptic feedback using expo-haptics
 */
export class HapticsService implements IHapticsService {
  async light(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async medium(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async heavy(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  async success(): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async warning(): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  async error(): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

// Singleton instance
export const hapticsService = new HapticsService();
