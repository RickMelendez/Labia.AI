// Testing Library matchers
import '@testing-library/jest-native/extend-expect';

// Mock react-native-reanimated (use the official mock)
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Silence NativeAnimatedHelper warnings
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Replace expo-linear-gradient with a simple View wrapper in tests
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => React.createElement(View, props, children),
  };
});

