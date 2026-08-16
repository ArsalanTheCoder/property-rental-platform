import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getViewingRequests } from "@/api/viewings";
import { getPropertyById } from "@/data/mockProperties";
import { formatDate } from "@/utils/format";
import { ViewingRequest } from "@/types";

export default function BookingsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getViewingRequests(user.userId).then((data) => {
      setRequests(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <Screen>
      <Text style={styles.title}>Your bookings</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.viewingId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const property = getPropertyById(item.propertyId);
          if (!property) return null;

          return (
            <View style={styles.card}>
              <Image source={{ uri: property.images[0] }} style={styles.thumb} />

              <View style={styles.cardBody}>
                <Text style={styles.propertyTitle} numberOfLines={1}>
                  {property.title}
                </Text>

                <View style={styles.metaRow}>
                  <Feather name="calendar" size={13} color={colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {formatDate(item.date)} at {item.time}
                  </Text>
                </View>

                <StatusPill status={item.status} />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="calendar"
              title="No viewing requests yet"
              message="Book a viewing from a property page to see it here."
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
});
