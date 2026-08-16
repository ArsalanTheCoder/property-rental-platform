import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { formatPrice } from "@/utils/format";
import { useFavorites } from "@/context/FavoritesContext";
import { getPropertyDetails } from "@/api/properties";
import { Property } from "@/types";

const { width: screenWidth } = Dimensions.get("window");

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!id) return;
    getPropertyDetails(id).then((result) => setProperty(result ?? null));
  }, [id]);

  if (!property) {
    return <Screen />;
  }

  const saved = isFavorite(property.propertyId);

  return (
    <Screen edges={["left", "right"]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.gallery}>
          <FlatList
            data={property.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri, index) => `${uri}-${index}`}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.galleryImage} />
            )}
          />

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.textOnDark} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(property.propertyId)}
          >
            <Feather name="heart" size={20} color={saved ? colors.danger : colors.textOnDark} />
          </TouchableOpacity>

          <View style={styles.dotsRow}>
            {property.images.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === activeImageIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(property.price)}/mo</Text>
            <Badge label={property.propertyType} tone="accent" />
          </View>

          <Text style={styles.propertyTitle}>{property.title}</Text>

          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color={colors.textSecondary} />
            <Text style={styles.locationText}>
              {property.location.area}, {property.location.city}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="grid" size={16} color={colors.primary} />
              <Text style={styles.statValue}>{property.bedrooms}</Text>
              <Text style={styles.statLabel}>Beds</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="droplet" size={16} color={colors.primary} />
              <Text style={styles.statValue}>{property.bathrooms}</Text>
              <Text style={styles.statLabel}>Baths</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="box" size={16} color={colors.primary} />
              <Text style={styles.statValue}>{property.furnished ? "Yes" : "No"}</Text>
              <Text style={styles.statLabel}>Furnished</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>

          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesWrap}>
            {property.amenities.map((amenity) => (
              <Badge key={amenity} label={amenity} />
            ))}
          </View>

          {!property.availability && (
            <View style={styles.unavailableBanner}>
              <Feather name="alert-circle" size={16} color={colors.warning} />
              <Text style={styles.unavailableBannerText}>
                This property is currently not available for viewing requests.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Button
          label="Send inquiry"
          variant="outline"
          onPress={() => router.push(`/property/${property.propertyId}/inquiry`)}
          style={styles.footerButton}
        />
        <Button
          label="Request viewing"
          onPress={() => router.push(`/property/${property.propertyId}/viewing`)}
          disabled={!property.availability}
          style={styles.footerButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gallery: {
    height: 300,
  },
  galleryImage: {
    width: screenWidth,
    height: 300,
    backgroundColor: colors.divider,
  },
  backButton: {
    position: "absolute",
    top: spacing.xxl,
    left: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.xxl,
    right: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    position: "absolute",
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: colors.textOnDark,
    width: 18,
  },
  content: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxl * 3,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  price: {
    ...typography.h1,
    color: colors.primary,
  },
  propertyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  locationText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xxl,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  amenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  unavailableBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  unavailableBannerText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
  },
});
