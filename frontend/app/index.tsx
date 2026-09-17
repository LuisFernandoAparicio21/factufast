import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { CampoFormulario } from "../components/CampoFormulario";
import { generarFactura } from "../services/api";
import { REGIMENES } from "../constants/regimenes";

export default function HomeScreen() {
  const [rfc, setRfc] = useState("");
  const [cp, setCp] = useState("");
  const [regimen, setRegimen] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerar() {
    if (!rfc.trim() || !cp.trim() || !regimen || !email.trim()) {
      setError("Todos los campos son requeridos");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await generarFactura({
        rfc_receptor: rfc.toUpperCase().trim(),
        cp_receptor: cp.trim(),
        regimen_fiscal_receptor: regimen,
        email_receptor: email.trim().toLowerCase(),
      });
      router.push({
        pathname: "/resultado",
        params: {
          folio_fiscal: result.folio_fiscal,
          pdf_url: result.pdf_url,
        },
      });
    } catch {
      setError("Error al generar la factura. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>FactuFastAI</Text>
      <Text style={styles.subtitle}>Genera tu factura CFDI 4.0</Text>

      <CampoFormulario
        label="RFC del receptor"
        value={rfc}
        onChangeText={setRfc}
        placeholder="XAXX010101000"
        autoCapitalize="characters"
      />

      <CampoFormulario
        label="Código Postal"
        value={cp}
        onChangeText={setCp}
        keyboardType="numeric"
        placeholder="06600"
      />

      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Régimen Fiscal</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={regimen}
            onValueChange={setRegimen}
            style={styles.picker}
          >
            <Picker.Item label="Selecciona un régimen..." value="" color="#aaa" />
            {REGIMENES.map((r) => (
              <Picker.Item
                key={r.value}
                label={`${r.value} — ${r.label}`}
                value={r.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <CampoFormulario
        label="Email del receptor"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="cliente@empresa.com"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerar}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Generar Factura</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 24, paddingTop: 64, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: "800", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 32 },
  pickerWrapper: { marginBottom: 16 },
  pickerLabel: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#374151" },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: { height: 52, color: "#111827" },
  error: { color: "#ef4444", fontSize: 14, marginBottom: 12 },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: "#93c5fd" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
