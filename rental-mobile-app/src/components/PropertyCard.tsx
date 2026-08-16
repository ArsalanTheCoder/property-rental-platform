import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Property } from "@/types";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { formatPrice } from "@/utils/format";
import { useFavorites } from "@/context/FavoritesContext";

export function PropertyCard({ property }: { property: Property }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(property.propertyId);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => router.push(`/property/${property.propertyId}`)}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: property.images[0] }} style={styles.image} />

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(property.propertyId)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather
            name="heart"
            size={18}
            color={saved ? colors.danger : colors.textOnDark}
            style={saved ? undefined : styles.favoriteIconOutline}
          />
        </TouchableOpacity>

        {!property.availability && (
          <View style={styles.unavailableTag}>
            <Text style={styles.unavailableText}>Not available</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.rowBetween}>
          <Text style={styles.price}>{formatPrice(property.price)}/mo</Text>
          <Text style={styles.type}>{property.propertyType}</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Feather name="map-pin" size={13} color={colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.location.area}, {property.location.city}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Feather name="grid" size={13} color={colors.textSecondary} />
            <Text style={styles.detailText}>{property.bedrooms} Bed</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="droplet" size={13} color={colors.textSecondary} />
            <Text style={styles.detailText}>{property.bathrooms} Bath</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  imageWrap: {
    height: 170,
    backgroundColor: colors.divider,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteIconOutline: {
    opacity: 0.95,
  },
  unavailableTag: {
    position: "absolute",
    left: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  unavailableText: {
    ...typography.tiny,
    color: colors.textOnDark,
  },
  info: {
    padding: spacing.lg,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
  },
  type: {
    ...typography.captionStrong,
    color: colors.accent,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  detailsRow: {
    flexDirection: "row",
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detailText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
