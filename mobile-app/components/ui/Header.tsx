import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const bg = useThemeColor({}, 'background');

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {subtitle ? <Text style={[styles.subtitle, { color: tint }]}>{subtitle}</Text> : null}
      {title ? <Text style={[styles.title, { color: text }]}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 14,
    borderBottomWidth: 0,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 32,
  },
});
