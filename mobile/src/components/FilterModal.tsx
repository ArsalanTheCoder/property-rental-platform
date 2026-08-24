import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, shadow, spacing, typography } from "@/constants/theme";
import { PropertyFilters, PropertyType } from "@/types";
import { Button } from "./Button";

const propertyTypes: PropertyType[] = ["Apartment", "House", "Studio", "Villa", "Commercial", "Penthouse"];
const bedroomOptions = [1, 2, 3, 4];

interface FilterModalProps {
  visible: boolean;
  initialFilters: PropertyFilters;
  onClose: () => void;
  onApply: (filters: PropertyFilters) => void;
}

export function FilterModal({ visible, initialFilters, onClose, onApply }: FilterModalProps) {
  const [propertyType, setPropertyType] = useState(initialFilters.propertyType);
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);

  const priceSteps = [50000, 100000, 200000, 300000];

  const handleReset = () => {
    setPropertyType(undefined);
    setBedrooms(undefined);
    setMaxPrice(undefined);
  };

  const handleApply = () => {
    onApply({ ...initialFilters, propertyType, bedrooms, maxPrice });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Property type</Text>
          <View style={styles.chipRow}>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, propertyType === type && styles.chipActive]}
                onPress={() => setPropertyType(propertyType === type ? undefined : type)}
              >
                <Text style={[styles.chipLabel, propertyType === type && styles.chipLabelActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Minimum bedrooms</Text>
          <View style={styles.chipRow}>
            {bedroomOptions.map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.chip, bedrooms === count && styles.chipActive]}
                onPress={() => setBedrooms(bedrooms === count ? undefined : count)}
              >
                <Text style={[styles.chipLabel, bedrooms === count && styles.chipLabelActive]}>
                  {count}+
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Maximum price</Text>
          <View style={styles.chipRow}>
            {priceSteps.map((price) => (
              <TouchableOpacity
                key={price}
                style={[styles.chip, maxPrice === price && styles.chipActive]}
                onPress={() => setMaxPrice(maxPrice === price ? undefined : price)}
              >
                <Text style={[styles.chipLabel, maxPrice === price && styles.chipLabelActive]}>
                  Under {price / 1000}k
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Button label="Reset" variant="outline" onPress={handleReset} style={styles.footerButton} />
            <Button label="Apply filters" onPress={handleApply} style={styles.footerButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xxl,
    ...shadow.modal,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  sectionLabel: {
    ...typography.captionStrong,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  chipLabelActive: {
    color: colors.textOnDark,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  footerButton: {
    flex: 1,
  },
});
