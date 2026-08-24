import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordScreen() {
  const { resetPassword, isSubmitting } = useAuth();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!token.trim() || !newPassword || !confirmPassword) {
      setError("Please fill in every field.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    try {
      await resetPassword(token.trim(), newPassword, confirmPassword);
      setDone(true);
    } catch (err) {
      setError("That reset link has expired or is no longer valid. Request a new one.");
    }
  };

  if (done) {
    return (
      <Screen>
        <View style={styles.confirmWrap}>
          <View style={styles.confirmIcon}>
            <Feather name="check" size={28} color={colors.success} />
          </View>
          <Text style={styles.confirmTitle}>Password reset</Text>
          <Text style={styles.confirmMessage}>
            Your password has been changed. Every device has been signed out, so please sign in again.
          </Text>
          <Button label="Go to sign in" onPress={() => router.replace("/(auth)/login")} style={styles.confirmButton} />
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

          <Text style={styles.title}>Set a new password</Text>
          <Text style={styles.subtitle}>
            Paste the token from the reset email you received, then choose a new password.
          </Text>

          <FormField
            label="Reset token"
            value={token}
            onChangeText={setToken}
            placeholder="Paste the token from your email"
            autoCapitalize="none"
          />
          <FormField
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="At least 8 characters"
            secureTextEntry
          />
          <FormField
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your new password"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Reset password" onPress={handleSubmit} loading={isSubmitting} style={styles.submitButton} />
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
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
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
    backgroundColor: colors.successBg,
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
});
