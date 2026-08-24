import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { cancelViewingRequest, getMyViewingRequests } from "@/api/viewings";
import { formatDate } from "@/utils/format";
import { ViewingRequest } from "@/types";

export default function BookingsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadRequests = async () => {
    if (!user) return;
    setError(false);
    try {
      const data = await getMyViewingRequests();
      setRequests(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  // Refresh whenever this tab regains focus, so a newly submitted
  // viewing request shows up without a manual pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [user])
  );

  const handleCancel = (viewingId: string) => {
    Alert.alert("Cancel viewing", "Are you sure you want to cancel this viewing request?", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel request",
        style: "destructive",
        onPress: async () => {
          await cancelViewingRequest(viewingId);
          loadRequests();
        },
      },
    ]);
  };

  return (
    <Screen>
      <Text style={styles.title}>Your bookings</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.property?.images[0] }} style={styles.thumb} />

            <View style={styles.cardBody}>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {item.property?.title ?? "Property"}
              </Text>

              <View style={styles.metaRow}>
                <Feather name="calendar" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {formatDate(item.date)} at {item.time}
                </Text>
              </View>

              <View style={styles.footerRow}>
                <StatusPill status={item.status} />
                {item.status === "pending" && (
                  <TouchableOpacity onPress={() => handleCancel(item.id)}>
                    <Text style={styles.cancelLink}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon={error ? "wifi-off" : "calendar"}
              title={error ? "Could not load bookings" : "No viewing requests yet"}
              message={
                error
                  ? "Check your connection and try again."
                  : "Book a viewing from a property page to see it here."
              }
            />
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.divider,
  },
  cardBody: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "space-between",
  },
  propertyTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancelLink: {
    ...typography.captionStrong,
    color: colors.danger,
  },
});
