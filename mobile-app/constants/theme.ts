/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#6C5CE7';
const tintColorDark = '#A78BFA';

export const Colors = {
  light: {
    text: '#1E1B4B',
    background: '#F5F3FF',
    tint: tintColorLight,
    primary: tintColorLight,
    primaryDark: '#4C3ABA',
    primaryLight: '#EDE9FE',
    secondary: '#10B981',
    secondaryLight: '#D1FAE5',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    teal: '#0891B2',
    tealLight: '#E0F2FE',
    orange: '#F97316',
    orangeLight: '#FFEDD5',
    surface: '#FFFFFF',
    surfaceAlt: '#F8F7FF',
    icon: '#6C5CE7',
    border: '#E5E7EB',
    textSecondary: '#64748B',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F0EEFF',
    background: '#0D0B1E',
    tint: tintColorDark,
    primary: '#8B5CF6',
    primaryDark: '#6D28D9',
    primaryLight: '#2E1B5B',
    secondary: '#34D399',
    secondaryLight: '#064E3B',
    accent: '#FBBF24',
    accentLight: '#451A03',
    danger: '#F87171',
    dangerLight: '#450A0A',
    info: '#60A5FA',
    infoLight: '#1E3A5F',
    teal: '#22D3EE',
    tealLight: '#0E4A5C',
    orange: '#FB923C',
    orangeLight: '#431407',
    surface: '#1A1730',
    surfaceAlt: '#0F0D1A',
    icon: '#A78BFA',
    border: '#2E2B4A',
    textSecondary: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
