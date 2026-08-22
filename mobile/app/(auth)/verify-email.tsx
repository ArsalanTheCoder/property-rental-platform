import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

// The backend only exposes POST /auth/verify-email, not a GET link
// (see RFC-001-B section 5). The verification email points at a web
// URL with the token in the query string. This screen lets someone
// paste that token in manually, which is the simplest way to support
// verification from a mobile app without deep link handling.
export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { verifyEmail, resendVerification, isSubmitting } = useAuth();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState(params.email ?? "");
  const [status, setStatus] = useState<"idle" | "verified" | "error">("idle");
  const [resendMessage, setResendMessage] = useState("");

  const handleVerify = async () => {
    if (!token.trim()) return;
    try {
      await verifyEmail(token.trim());
      setStatus("verified");
    } catch (err) {
      setStatus("error");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendMessage("");
    await resendVerification(email);
    setResendMessage("If that email is registered and unverified, a new link was just sent.");
  };

  if (status === "verified") {
    return (
      <Screen>
        <View style={styles.confirmWrap}>
          <View style={styles.confirmIcon}>
            <Feather name="check" size={28} color={colors.success} />
          </View>
          <Text style={styles.confirmTitle}>Email verified</Text>
          <Text style={styles.confirmMessage}>You can now sign in with your email and password.</Text>
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

          <View style={styles.iconWrap}>
            <Feather name="mail" size={26} color={colors.primary} />
          </View>

          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to {email || "your email"}. Open it on this device, copy the
            token from the link, and paste it below.
          </Text>

          <FormField
            label="Verification token"
            value={token}
            onChangeText={setToken}
            placeholder="Paste the token from your email"
            autoCapitalize="none"
          />

          {status === "error" && (
            <Text style={styles.error}>That link has expired or is no longer valid. Request a new one below.</Text>
          )}

          <Button label="Verify email" onPress={handleVerify} loading={isSubmitting} style={styles.submitButton} />

          <View style={styles.resendSection}>
            <FormField
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button label="Resend verification email" variant="outline" onPress={handleResend} />
            {resendMessage ? <Text style={styles.resendMessage}>{resendMessage}</Text> : null}
          </View>
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
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.infoBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
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
  resendSection: {
    marginTop: spacing.xxxl,
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  resendMessage: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.md,
    textAlign: "center",
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
