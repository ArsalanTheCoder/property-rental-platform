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
      <Text style={styles.title}>Saved Properties</Text>

      <FlatList
        data={favoriteProperties}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="No saved properties yet"
            message="Tap the heart icon on any listing to save it here."
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  columnWrapper: {
    gap: spacing.md,
    justifyContent: "space-between",
  },
});
