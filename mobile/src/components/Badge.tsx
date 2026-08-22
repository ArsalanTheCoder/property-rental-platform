import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/theme";

interface BadgeProps {
  label: string;
  tone?: "neutral" | "accent";
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const isAccent = tone === "accent";

  return (
    <View style={[styles.container, isAccent ? styles.accent : styles.neutral]}>
      <Text style={[styles.label, isAccent ? styles.accentLabel : styles.neutralLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  neutral: {
    backgroundColor: colors.divider,
  },
  accent: {
    backgroundColor: colors.infoBg,
  },
  label: {
    ...typography.tiny,
  },
  neutralLabel: {
    color: colors.textSecondary,
  },
  accentLabel: {
    color: colors.accent,
  },
});
