import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getFeaturedProperties } from "@/api/properties";
import { Property } from "@/types";

const CATEGORIES = [
  { id: "all", label: "All Properties", icon: "grid" as const },
  { id: "Apartment", label: "Apartments", icon: "home" as const },
  { id: "Penthouse", label: "Penthouses", icon: "award" as const },
  { id: "Villa", label: "Villas", icon: "shield" as const },
  { id: "House", label: "Houses", icon: "box" as const },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const firstName = user?.name ? user.name.split(" ")[0] : "there";

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

  const filteredProperties =
    selectedCategory === "all"
      ? properties
      : properties.filter((p) => p.propertyType === selectedCategory);

  return (
    <Screen>
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadProperties}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Top Bar: Location & Avatar */}
            <View style={styles.topBar}>
              <View style={styles.locationPill}>
                <Feather name="map-pin" size={13} color={colors.accent} />
                <Text style={styles.locationPillText}>Karachi, Pakistan</Text>
              </View>

              <TouchableOpacity
                style={styles.avatarButton}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "👋"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Greeting */}
            <View style={styles.greetingWrap}>
              <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
              <Text style={styles.subGreeting}>
                Discover your next home with AI assistance
              </Text>
            </View>

            {/* Search Input Fake Bar */}
            <TouchableOpacity
              style={styles.searchBar}
              activeOpacity={0.9}
              onPress={() => router.push("/(tabs)/search")}
            >
              <Feather name="search" size={18} color={colors.accent} />
              <Text style={styles.searchPlaceholder}>
                Search by area, bedrooms, or price...
              </Text>
              <View style={styles.filterIconBtn}>
                <Feather name="sliders" size={14} color={colors.textPrimary} />
              </View>
            </TouchableOpacity>

            {/* AI Assistant Highlight Card */}
            <TouchableOpacity
              style={styles.aiBanner}
              activeOpacity={0.92}
              onPress={() => {
                if (properties.length > 0) {
                  router.push(`/property/${properties[0].id}/chat`);
                } else {
                  router.push("/(tabs)/search");
                }
              }}
            >
              <View style={styles.aiIconWrap}>
                <Feather name="cpu" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.aiTextWrap}>
                <View style={styles.aiBadgeRow}>
                  <Text style={styles.aiBadge}>GROQ AI POWERED</Text>
                </View>
                <Text style={styles.aiTitle}>Property AI Concierge</Text>
                <Text style={styles.aiDesc}>
                  Ask property-specific questions with zero hallucinations
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            {/* Categories Scroll */}
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Browse by Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, active && styles.categoryChipActive]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name={cat.icon}
                        size={14}
                        color={active ? "#FFFFFF" : colors.textSecondary}
                      />
                      <Text
                        style={[styles.categoryText, active && styles.categoryTextActive]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Featured Listings Header */}
            <View style={styles.featuredHeader}>
              <Text style={styles.sectionTitle}>Featured Residences</Text>
              {properties.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{filteredProperties.length} homes</Text>
                </View>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon={error ? "wifi-off" : "home"}
              title={error ? "Could not load listings" : "No properties found"}
              message={
                error
                  ? "Check your connection and pull down to refresh."
                  : "Try selecting a different property type above."
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  columnWrapper: {
    gap: spacing.md,
    justifyContent: "space-between",
  },
  header: {
    paddingTop: spacing.md,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  locationPillText: {
    ...typography.tiny,
    color: colors.accentDark,
    fontWeight: "700",
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    ...typography.tiny,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  greetingWrap: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subGreeting: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: spacing.md,
    flex: 1,
    fontSize: 14,
  },
  filterIconBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "#1E293B",
    ...shadow.card,
  },
  aiIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  aiTextWrap: {
    flex: 1,
  },
  aiBadgeRow: {
    marginBottom: 2,
  },
  aiBadge: {
    ...typography.tiny,
    color: "#34D399",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  aiTitle: {
    ...typography.bodyStrong,
    color: "#FFFFFF",
    fontSize: 15,
  },
  aiDesc: {
    ...typography.tiny,
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 1,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  categoryScroll: {
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  countBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  countText: {
    ...typography.tiny,
    color: colors.accentDark,
    fontWeight: "700",
  },
});
