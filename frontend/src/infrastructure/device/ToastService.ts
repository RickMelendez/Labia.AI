import Toast from 'react-native-toast-message';
import { IToastService } from '../../application/ports/IToastService';

/**
 * ToastService
 * Implements toast notifications using react-native-toast-message
 */
export class ToastService implements IToastService {
  success(title: string, message: string): void {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000
    });
  }

  error(title: string, message: string): void {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 4000
    });
  }

  info(title: string, message: string): void {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000
    });
  }

  warning(title: string, message: string): void {
    Toast.show({
      type: 'info', // react-native-toast-message doesn't have 'warning' by default
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000
    });
  }
}

// Singleton instance
export const toastService = new ToastService();
