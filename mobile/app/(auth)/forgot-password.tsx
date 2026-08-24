import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordScreen() {
  const { forgotPassword, isSubmitting } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    // The backend always responds the same way whether or not the
    // email exists, to prevent account enumeration. The UI reflects
    // that by showing one generic confirmation state either way.
    await forgotPassword(email);
    setSent(true);
  };

  if (sent) {
    return (
      <Screen>
        <View style={styles.confirmWrap}>
          <View style={styles.confirmIcon}>
            <Feather name="mail" size={28} color={colors.accent} />
          </View>
          <Text style={styles.confirmTitle}>Check your email</Text>
          <Text style={styles.confirmMessage}>
            If an account exists for {email}, a password reset link has been sent.
          </Text>
          <Button
            label="Enter reset token"
            onPress={() => router.push("/(auth)/reset-password")}
            style={styles.confirmButton}
          />
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter the email on your account and we will send you a link to reset your password.
          </Text>

          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button label="Send reset link" onPress={handleSubmit} loading={isSubmitting} style={styles.submitButton} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    lineHeight: 21,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  confirmWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxxl,
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.infoBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  confirmTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  confirmMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  confirmButton: {
    width: "100%",
  },
  backToLogin: {
    marginTop: spacing.lg,
  },
  backToLoginText: {
    ...typography.captionStrong,
    color: colors.accent,
  },
});
