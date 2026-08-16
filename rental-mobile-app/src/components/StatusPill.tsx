import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { ViewingStatus } from "@/types";

const statusStyles: Record<ViewingStatus, { bg: string; text: string }> = {
  Pending: { bg: colors.warningBg, text: colors.warning },
  Confirmed: { bg: colors.successBg, text: colors.success },
  Rejected: { bg: colors.dangerBg, text: colors.danger },
  Cancelled: { bg: colors.divider, text: colors.textSecondary },
  Completed: { bg: colors.infoBg, text: colors.accent },
};

export function StatusPill({ status }: { status: ViewingStatus }) {
  const style = statusStyles[status];

  return (
    <View style={[styles.container, { backgroundColor: style.bg }]}>
      <Text style={[styles.label, { color: style.text }]}>{status}</Text>
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
