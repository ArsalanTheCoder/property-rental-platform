import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Property, PropertySummary } from "@/types";
import { colors, radius, shadow, spacing, typography, FALLBACK_PROPERTY_IMAGE } from "@/constants/theme";
import { formatPrice } from "@/utils/format";
import { useFavorites } from "@/context/FavoritesContext";

interface PropertyCardProps {
  property: Property | PropertySummary;
  style?: ViewStyle;
}

export function PropertyCard({ property, style }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(property.id);

  // Fallback image if property has no photos attached
  const imageUri =
    property.images && property.images.length > 0 && property.images[0]
      ? property.images[0]
      : FALLBACK_PROPERTY_IMAGE;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[styles.card, style]}
      onPress={() => router.push(`/property/${property.id}`)}
    >
      {/* Thumbnail & Badges */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

        {/* Top Type Tag */}
        {property.propertyType && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{property.propertyType}</Text>
          </View>
        )}

        {/* Top Right Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(property.id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          activeOpacity={0.8}
        >
          <Feather
            name="heart"
            size={14}
            color={saved ? colors.danger : "#FFFFFF"}
          />
        </TouchableOpacity>

        {property.availability === false && (
          <View style={styles.unavailableTag}>
            <Text style={styles.unavailableText}>Rented</Text>
          </View>
        )}
      </View>

      {/* Card Body */}
      <View style={styles.info}>
        {/* Price Tag */}
        <View style={styles.priceRow}>
          <Text style={styles.price} numberOfLines={1}>
            {formatPrice(property.price)}
          </Text>
          <Text style={styles.priceSub}>/mo</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={11} color={colors.accent} />
          <Text style={styles.location} numberOfLines={1}>
            {property.location.city || property.location.address}
          </Text>
        </View>

        {/* Specs Pill Row */}
        {(property.bedrooms !== undefined || property.bathrooms !== undefined) && (
          <View style={styles.detailsRow}>
            {property.bedrooms !== undefined && (
              <View style={styles.detailItem}>
                <Feather name="grid" size={11} color={colors.textSecondary} />
                <Text style={styles.detailText}>{property.bedrooms} Bed</Text>
              </View>
            )}
            {property.bathrooms !== undefined && (
              <View style={styles.detailItem}>
                <Feather name="droplet" size={11} color={colors.textSecondary} />
                <Text style={styles.detailText}>{property.bathrooms} Bath</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  imageWrap: {
    height: 125,
    backgroundColor: colors.divider,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  typeBadge: {
    position: "absolute",
    top: spacing.xs + 2,
    left: spacing.xs + 2,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm - 2,
  },
  typeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  unavailableTag: {
    position: "absolute",
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: "rgba(220, 38, 38, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm - 2,
  },
  unavailableText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.xs + 2,
    right: spacing.xs + 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: spacing.sm + 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.accent,
  },
  priceSub: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textMuted,
    marginLeft: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 6,
  },
  location: {
    fontSize: 11,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  detailText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});
