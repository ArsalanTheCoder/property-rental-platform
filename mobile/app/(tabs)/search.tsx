import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { SearchBar } from "@/components/SearchBar";
import { FilterModal } from "@/components/FilterModal";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { colors, spacing, typography } from "@/constants/theme";
import { getProperties } from "@/api/properties";
import { Property, PropertyFilters } from "@/types";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    const runSearch = async () => {
      setLoading(true);
      setError(false);
      try {
        const { properties } = await getProperties({ ...filters, search: query || undefined });
        setResults(properties);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    // Small debounce so we are not re-searching on every keystroke.
    const timeout = setTimeout(runSearch, 300);
    return () => clearTimeout(timeout);
  }, [query, filters]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onFilterPress={() => setFilterModalVisible(true)}
        />
        {activeFilterCount > 0 && (
          <Text style={styles.filterSummary}>{activeFilterCount} filter(s) applied</Text>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon={error ? "wifi-off" : "search"}
              title={error ? "Could not search right now" : "No matches found"}
              message={
                error
                  ? "Check your connection and try again."
                  : "Try a different area or adjust your filters."
              }
            />
          ) : null
        }
      />

      <FilterModal
        visible={filterModalVisible}
        initialFilters={filters}
        onClose={() => setFilterModalVisible(false)}
        onApply={setFilters}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  filterSummary: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.sm,
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
