import { Platform } from 'react-native';

const tintColorLight = '#000000';
const tintColorDark = '#FFFFFF';

export const colors = {
  light: {
    text: '#111827',
    textMuted: '#6B7280',
    background: '#F8F9FA',
    card: '#FFFFFF',
    border: '#F3F4F6',
    tint: tintColorLight,
    icon: '#111827',
    primary: '#000000',
    primaryPressed: '#1F2937',
    secondary: '#F3F4F6',
    accent: '#111827',
    player1: '#111827',
    player2: '#FFFFFF',
  },
  dark: {
    text: '#F9FAFB',
    textMuted: '#9CA3AF',
    background: '#111827',
    card: '#1F2937',
    border: '#374151',
    tint: tintColorDark,
    icon: '#F9FAFB',
    primary: '#FFFFFF',
    primaryPressed: '#D1D5DB',
    secondary: '#374151',
    accent: '#F9FAFB',
    player1: '#111827',
    player2: '#FFFFFF',
  },
};

export const fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
