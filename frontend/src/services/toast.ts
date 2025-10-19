import Toast from 'react-native-toast-message';

export const showToast = {
  success: (message: string, subtitle?: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: subtitle,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 50,
    });
  },

  error: (message: string, subtitle?: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      text2: subtitle,
      position: 'top',
      visibilityTime: 4000,
      topOffset: 50,
    });
  },

  info: (message: string, subtitle?: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: subtitle,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 50,
    });
  },
};
