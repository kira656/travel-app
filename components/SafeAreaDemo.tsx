import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeAreaView from './SafeAreaView';

export const SafeAreaDemo: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SafeAreaContext Demo</Text>
      
      {/* Full safe area */}
      <SafeAreaView 
        backgroundColor="#e3f2fd" 
        style={styles.section}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <Text style={styles.sectionTitle}>Full Safe Area</Text>
        <Text style={styles.description}>
          This section respects all safe areas (top, bottom, left, right)
        </Text>
        <Text style={styles.insetInfo}>
          Top: {insets.top} | Bottom: {insets.bottom} | Left: {insets.left} | Right: {insets.right}
        </Text>
      </SafeAreaView>

      {/* Top only */}
      <SafeAreaView 
        backgroundColor="#f3e5f5" 
        style={styles.section}
        edges={['top']}
      >
        <Text style={styles.sectionTitle}>Top Safe Area Only</Text>
        <Text style={styles.description}>
          This section only respects the top safe area
        </Text>
      </SafeAreaView>

      {/* Bottom only */}
      <SafeAreaView 
        backgroundColor="#e8f5e8" 
        style={styles.section}
        edges={['bottom']}
      >
        <Text style={styles.sectionTitle}>Bottom Safe Area Only</Text>
        <Text style={styles.description}>
          This section only respects the bottom safe area
        </Text>
      </SafeAreaView>

      {/* No safe areas */}
      <SafeAreaView 
        backgroundColor="#fff3e0" 
        style={styles.section}
        edges={[]}
      >
        <Text style={styles.sectionTitle}>No Safe Areas</Text>
        <Text style={styles.description}>
          This section ignores all safe areas
        </Text>
      </SafeAreaView>

      {/* Manual safe area handling */}
      <View style={[styles.section, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.sectionTitle}>Manual Safe Area</Text>
        <Text style={styles.description}>
          This section manually applies safe area padding
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  section: {
    margin: 10,
    padding: 15,
    borderRadius: 8,
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  insetInfo: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
});

export default SafeAreaDemo; 