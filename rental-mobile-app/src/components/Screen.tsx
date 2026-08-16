import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

interface ScreenProps {
  children: ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
  background?: string;
}

export function Screen({ children, edges = ["top", "left", "right"], style, background }: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor: background ?? colors.background }, style]}
    >
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
