import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { getPropertyDetails } from "@/api/properties";
import { useAuth } from "@/context/AuthContext";
import { submitViewingRequest } from "@/api/viewings";
import { Property } from "@/types";

// A handful of upcoming dates and common time slots, shown as
// selectable chips. Kept simple on purpose instead of a full date
// picker, since the assignment only needs a working request flow.
function getUpcomingDates(count: number) {
  const dates: { label: string; value: string }[] = [];
  const today = new Date();

  for (let i = 1; i <= count; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      label: date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
      value: date.toISOString().slice(0, 10),
    });
  }

  return dates;
}

// The backend stores time as 24-hour "HH:MM" (see RFC-003-B), so the
// value sent is 24-hour while the label shown to the tenant stays
// friendly.
const timeSlots = [
  { label: "10:00 AM", value: "10:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "3:00 PM", value: "15:00" },
  { label: "5:00 PM", value: "17:00" },
];
const upcomingDates = getUpcomingDates(6);

export default function ViewingRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);

  const [selectedDate, setSelectedDate] = useState(upcomingDates[0]?.value ?? "");
  const [selectedTime, setSelectedTime] = useState(timeSlots[0].value);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPropertyDetails(id).then(setProperty);
  }, [id]);

  if (!property || !user) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitViewingRequest(property.id, {
        date: selectedDate,
        time: selectedTime,
        message: message.trim() || undefined,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Screen>
        <View style={styles.confirmWrap}>
          <View style={styles.confirmIcon}>
            <Feather name="check" size={28} color={colors.success} />
          </View>
          <Text style={styles.confirmTitle}>Viewing requested</Text>
          <Text style={styles.confirmMessage}>
            Your request for {property.title} has been sent. You can track its status from the Bookings tab.
          </Text>
          <Button
            label="Go to bookings"
            onPress={() => router.replace("/(tabs)/bookings")}
            style={styles.confirmButton}
          />
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
          <Text style={styles.headerTitle}>Request viewing</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.propertyName} numberOfLines={2}>
            {property.title}
          </Text>

          <Text style={styles.label}>Select a date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {upcomingDates.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[styles.dateChip, selectedDate === date.value && styles.chipActive]}
                onPress={() => setSelectedDate(date.value)}
              >
                <Text style={[styles.chipLabel, selectedDate === date.value && styles.chipLabelActive]}>
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Select a time</Text>
          <View style={styles.timeRow}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time.value}
                style={[styles.timeChip, selectedTime === time.value && styles.chipActive]}
                onPress={() => setSelectedTime(time.value)}
              >
                <Text style={[styles.chipLabel, selectedTime === time.value && styles.chipLabelActive]}>
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Message (optional)</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Anything specific you would like to see or ask about"
            placeholderTextColor={colors.textMuted}
            style={styles.textArea}
            multiline
            textAlignVertical="top"
          />

          <Button
            label="Confirm request"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitButton}
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
    paddingBottom: spacing.xxxl,
  },
  propertyName: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.captionStrong,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  dateScroll: {
    marginBottom: spacing.xl,
  },
  dateChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  timeChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  chipLabelActive: {
    color: colors.textOnDark,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
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
