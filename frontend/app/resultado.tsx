import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function ResultadoScreen() {
  const { folio_fiscal, pdf_url } = useLocalSearchParams<{
    folio_fiscal: string;
    pdf_url: string;
  }>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>✓</Text>
      </View>

      <Text style={styles.title}>¡Factura generada!</Text>
      <Text style={styles.subtitle}>
        Revisa tu correo para recibir el enlace de descarga.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Folio Fiscal (UUID)</Text>
        <Text style={styles.folio} selectable>
          {folio_fiscal}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => pdf_url && Linking.openURL(pdf_url)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Descargar PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondary}
        onPress={() => router.replace("/")}
        activeOpacity={0.7}
      >
        <Text style={styles.secondaryText}>Nueva Factura</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: {
    padding: 24,
    paddingTop: 72,
    paddingBottom: 48,
    alignItems: "center",
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  icon: { fontSize: 36, color: "#16a34a" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  cardLabel: { fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  folio: { fontSize: 13, color: "#111827", fontFamily: "monospace", lineHeight: 20 },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondary: { paddingVertical: 14, width: "100%", alignItems: "center" },
  secondaryText: { color: "#2563eb", fontSize: 15, fontWeight: "600" },
});
