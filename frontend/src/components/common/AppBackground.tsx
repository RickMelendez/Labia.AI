import React from 'react';
import { StyleSheet, View } from 'react-native';

// Simplified background — solid warm dark, no animated orbs or star fields.
// Visual interest comes from the screen content itself.
export default function AppBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Solid warm dark brown-black */}
      <View style={styles.base} />
      {/* Very subtle amber warmth at top-center — static, no animation */}
      <View style={styles.topWarm} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF8F5',
  },
  topWarm: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(249,112,96,0.04)',
  },
});
