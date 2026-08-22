import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/Screen";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getFeaturedProperties } from "@/api/properties";
import { Property } from "@/types";

export default function HomeScreen() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const loadProperties = async () => {
    setError(false);
    try {
      const results = await getFeaturedProperties();
      setProperties(results);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <Screen>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProperties} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.greeting}>Hi {firstName}</Text>
                <Text style={styles.subGreeting}>Find your next place to rent</Text>
              </View>
            </View>

            <View style={styles.searchWrap}>
              <SearchBar
                value=""
                onChangeText={() => router.push("/(tabs)/search")}
                placeholder="Search by city or area"
                onFilterPress={() => router.push("/(tabs)/search")}
              />
            </View>

            {properties.length > 0 && (
              <View style={styles.badgeRow}>
                <Badge label={`${properties.length} featured listings`} tone="accent" />
              </View>
            )}

            <Text style={styles.sectionTitle}>Featured listings</Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon={error ? "wifi-off" : "home"}
              title={error ? "Could not load listings" : "No featured listings yet"}
              message={
                error
                  ? "Check your connection and pull down to try again."
                  : "Check back soon for new properties."
              }
            />
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  header: {
    paddingTop: spacing.lg,
  },
  greetingRow: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subGreeting: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchWrap: {
    marginBottom: spacing.lg,
  },
  badgeRow: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
});
