import React from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { Screen } from "@/components/Screen";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { colors, spacing, typography } from "@/constants/theme";
import { useFavorites } from "@/context/FavoritesContext";

export default function FavoritesScreen() {
  const { favoriteProperties } = useFavorites();

  return (
    <Screen>
      <Text style={styles.title}>Saved</Text>

      <FlatList
        data={favoriteProperties}
        keyExtractor={(item) => item.id}
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
