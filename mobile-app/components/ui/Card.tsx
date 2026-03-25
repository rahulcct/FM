import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function Card({ style, children, ...rest }: ViewProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 5,
  },
});
