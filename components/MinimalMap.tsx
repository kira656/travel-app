// ✅ DEFAULT export
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MinimalMap() {
  if (Platform.OS === 'web') return <Text>Web not supported</Text>;
  return (
    <View style={styles.c}>
      <MapView
        style={styles.m}
        initialRegion={{
          latitude: 41.8933203,
          longitude: 12.4829321,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <Marker coordinate={{ latitude: 41.8933203, longitude: 12.4829321 }} />
      </MapView>
    </View>
  );
}
const styles = StyleSheet.create({ c: { height: 200, borderRadius: 8, overflow: 'hidden' }, m: { flex: 1 } });
