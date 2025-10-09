import React from 'react';
import { TextInput, View, Text } from 'react-native';
import styles from './styles';

export const TextInputField = ({
  value,
  onChangeText,
  placeholder,
  error
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError
        ]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        maxLength={8}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};