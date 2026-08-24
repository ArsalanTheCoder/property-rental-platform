import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { ViewingStatus } from "@/types";

const statusStyles: Record<ViewingStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: colors.warningBg, text: colors.warning, label: "Pending" },
  confirmed: { bg: colors.successBg, text: colors.success, label: "Confirmed" },
  rejected: { bg: colors.dangerBg, text: colors.danger, label: "Rejected" },
  cancelled: { bg: colors.divider, text: colors.textSecondary, label: "Cancelled" },
  completed: { bg: colors.infoBg, text: colors.accent, label: "Completed" },
};

export function StatusPill({ status }: { status: ViewingStatus }) {
  const style = statusStyles[status];

  return (
    <View style={[styles.container, { backgroundColor: style.bg }]}>
      <Text style={[styles.label, { color: style.text }]}>{style.label}</Text>
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
  label: {
    ...typography.captionStrong,
  },
});
