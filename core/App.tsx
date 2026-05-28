import React from 'react';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '../src/store';

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <Text style={styles.text}>Welcome to Ekatale Logistics</Text>
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const appContent = (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );

  return <Provider store={store} children={appContent} />;
}

const styles = StyleSheet.create({ 
  container: { flex: 1 }, 
  text: { fontSize: 18, 
    fontWeight: 'bold' } 
});
export default App;