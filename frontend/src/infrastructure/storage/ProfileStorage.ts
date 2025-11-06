import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../core/constants/storage.constants';
import { DatingProfile } from '../../types';

export const ProfileStorage = {
  async get(): Promise<DatingProfile | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATING_PROFILE);
      return raw ? (JSON.parse(raw) as DatingProfile) : null;
    } catch (e) {
      console.warn('Failed to load dating profile', e);
      return null;
    }
  },
  async save(profile: DatingProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATING_PROFILE,
        JSON.stringify(profile)
      );
    } catch (e) {
      console.warn('Failed to save dating profile', e);
    }
  },
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATING_PROFILE);
    } catch {}
  }
};

