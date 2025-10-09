import React from 'react';
import { Text } from 'react-native';
import { colors } from '../styles/colors';

// Componente de título principal
export const Title = ({ children, style }) => (
  <Text style={[{ fontSize: 24, fontWeight: 'bold', color: colors.text, textAlign: 'center' }, style]}>
    {children}
  </Text>
);

// Texto normal
export const NormalText = ({ children, style }) => (
  <Text style={[{ fontSize: 16, color: colors.text, lineHeight: 22 }, style]}>
    {children}
  </Text>
);

// Texto secundário
export const LightText = ({ children, style }) => (
  <Text style={[{ fontSize: 14, color: colors.textLight }, style]}>
    {children}
  </Text>
);