// API Configuration
// Use env when available, otherwise pick a smart local default that works on devices
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Prefer Expo public env var when present, then standard process env
const envBase = (
  (typeof process !== 'undefined' && (process as any)?.env?.EXPO_PUBLIC_API_BASE_URL) ||
  (typeof process !== 'undefined' && (process as any)?.env?.API_BASE_URL)
) as string | undefined;

// Derive LAN host from Expo dev host when running on a real device/emulator
function deriveDevBase(): string {
  // Default to localhost for web/desktop dev
  let fallback = 'http://localhost:8000/api/v1';

  try {
    // SDK 49/50: attempt to read host from expo config
    const hostUri = (Constants as any)?.expoConfig?.hostUri
      || (Constants as any)?.manifest2?.extra?.expoClient?.hostUri
      || (Constants as any)?.manifest?.debuggerHost; // older SDKs

    if (hostUri && typeof hostUri === 'string') {
      const host = hostUri.split(':')[0]; // e.g. "192.168.1.10"
      if (host && /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        // Use LAN IP so physical devices can reach the backend
        fallback = `http://${host}:8000/api/v1`;
      }
    }
  } catch {
    // noop – keep fallback
  }

  // On native platforms, prefer LAN fallback over localhost
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return fallback;
  }
  // On web, localhost is typically correct
  return fallback;
}

export const API_BASE_URL = envBase
  || (__DEV__ ? deriveDevBase() : 'https://api.labia.chat/api/v1');

const envTimeout = (typeof process !== 'undefined' && (process as any)?.env?.API_TIMEOUT) as string | undefined;
export const API_TIMEOUT = envTimeout ? Number(envTimeout) : 30000; // 30 seconds
