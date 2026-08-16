import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { getPropertyById } from "@/data/mockProperties";
import { useAuth } from "@/context/AuthContext";
import { submitInquiry } from "@/api/inquiries";

export default function InquiryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const property = id ? getPropertyById(id) : undefined;
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!property || !user) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    await submitInquiry({
      userId: user.userId,
      propertyId: property.propertyId,
      userName: user.name,
      userPhone: user.phone,
      message,
    });
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <Screen>
        <View style={styles.confirmWrap}>
          <View style={styles.confirmIcon}>
            <Feather name="check" size={28} color={colors.success} />
          </View>
          <Text style={styles.confirmTitle}>Inquiry sent</Text>
          <Text style={styles.confirmMessage}>
            Your message about {property.title} has been sent to the landlord.
          </Text>
          <Button label="Done" onPress={() => router.back()} style={styles.confirmButton} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send inquiry</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.propertyName} numberOfLines={2}>
            {property.title}
          </Text>

          <Text style={styles.label}>Your message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask about lease terms, move-in date, or anything else..."
            placeholderTextColor={colors.textMuted}
            style={styles.textArea}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.helperText}>
            The landlord will see your name and phone number along with this message.
          </Text>

          <Button
            label="Send message"
            onPress={handleSend}
            loading={sending}
            disabled={!message.trim()}
            style={styles.sendButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.xxl,
  },
  propertyName: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  label: {
    ...typography.captionStrong,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  textArea: {
    height: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
  },
  helperText: {
    ...typography.tiny,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  sendButton: {
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
