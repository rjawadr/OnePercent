/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useEffect, useState } from 'react';
import { initDb } from './src/db/client';
import { notificationService } from './src/services/NotificationService';
import { useHabitStore } from './src/store/habitStore';
import { useAgoraphobiaStore } from './src/store/agoraphobiaStore';

import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDb();
        await useHabitStore.getState().initialize();
        await useAgoraphobiaStore.getState().initialize();
        await notificationService.requestPermissions();
        await notificationService.createDefaultChannel();
        setIsReady(true);
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };
    initialize();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading infrastructure...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
