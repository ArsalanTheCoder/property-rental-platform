import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { Screen } from "@/components/Screen";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { colors, spacing, typography } from "@/constants/theme";
import { useFavorites } from "@/context/FavoritesContext";
import { getProperties } from "@/api/properties";
import { Property } from "@/types";

export default function FavoritesScreen() {
  const { favoriteIds } = useFavorites();
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  useEffect(() => {
    getProperties().then(setAllProperties);
  }, []);

  const savedProperties = allProperties.filter((property) =>
    favoriteIds.includes(property.propertyId)
  );

  return (
    <Screen>
      <Text style={styles.title}>Saved</Text>

      <FlatList
        data={savedProperties}
        keyExtractor={(item) => item.propertyId}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="No saved properties yet"
            message="Tap the heart icon on a listing to save it here."
          />
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
});
