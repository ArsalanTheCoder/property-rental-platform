import React, { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AnimatedSplash } from "@/components/AnimatedSplash";

// Keep the native splash screen visible until we are ready to hand
// off to the animated one below. This call has to run at module
// scope, before the component renders.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if it was already called or is unsupported on this platform.
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    // Placeholder for any startup work such as loading fonts or
    // warming up auth state. Kept short so the animation still gets
    // a moment to play.
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setAppIsReady(true);
    };
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <FavoritesProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="property/[id]/index" options={{ presentation: "card" }} />
            <Stack.Screen name="property/[id]/inquiry" options={{ presentation: "modal" }} />
            <Stack.Screen name="property/[id]/viewing" options={{ presentation: "modal" }} />
          </Stack>
          {showAnimatedSplash && (
            <AnimatedSplash onFinish={() => setShowAnimatedSplash(false)} />
          )}
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
