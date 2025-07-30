import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

// Platform-specific imports
let MapView: any;
let Marker: any;

if (Platform.OS === 'web') {
  // Web fallback - create a simple placeholder component
  MapView = ({ children, style, ...props }: any) => (
    <View style={[styles.webMapContainer, style]} {...props}>
      <Text style={styles.webMapText}>Map View (Web Preview)</Text>
      <Text style={styles.webMapSubtext}>Interactive maps are available on mobile devices</Text>
      {children}
    </View>
  );
  
  Marker = ({ coordinate, title, description, ...props }: any) => (
    <View style={styles.webMarker} {...props}>
      <Text style={styles.webMarkerText}>{title || 'Location'}</Text>
      {description && <Text style={styles.webMarkerDescription}>{description}</Text>}
    </View>
  );
} else {
  // Native platforms - import the actual react-native-maps
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default || Maps;
    Marker = Maps.Marker;
  } catch (error) {
    console.warn('react-native-maps not available:', error);
    // Fallback for native platforms too
    MapView = ({ children, style, ...props }: any) => (
      <View style={[styles.webMapContainer, style]} {...props}>
        <Text style={styles.webMapText}>Map View</Text>
        {children}
      </View>
    );
    
    Marker = ({ coordinate, title, description, ...props }: any) => (
      <View style={styles.webMarker} {...props}>
        <Text style={styles.webMarkerText}>{title || 'Location'}</Text>
        {description && <Text style={styles.webMarkerDescription}>{description}</Text>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  webMapContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  webMapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  webMarker: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    margin: 4,
  },
  webMarkerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  webMarkerDescription: {
    color: 'white',
    fontSize: 10,
    opacity: 0.8,
  },
});

export { MapView, Marker };

