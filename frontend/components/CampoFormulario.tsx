import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export function CampoFormulario({
  label,
  value,
  onChangeText,
  error,
  keyboardType = "default",
  placeholder,
  autoCapitalize = "none",
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#111827",
  },
  inputError: { borderColor: "#ef4444" },
  error: { fontSize: 12, color: "#ef4444", marginTop: 4 },
});
