import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
};

export default function Button({ title, onPress, style, textStyle, variant = 'primary', disabled }: Props) {
  const primary = useThemeColor({}, 'primary');
  const secondary = useThemeColor({}, 'secondary');

  const backgroundColor = variant === 'primary' ? primary : variant === 'secondary' ? secondary : 'transparent';
  const color = variant === 'ghost' ? primary : '#FFFFFF';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor },
        variant === 'primary' && styles.primaryShadow,
        variant === 'ghost' && styles.ghostBtn,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, { color }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryShadow: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  ghostBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.55,
  },
});
