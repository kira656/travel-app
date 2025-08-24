import React from 'react';
import { Text, View } from 'react-native';

const MapView = (props: any) => (
  <View style={[{ padding: 20, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }, props.style]}>
    <Text>Map not supported on web</Text>
    {props.children}
  </View>
);

export default MapView;
export const Marker = (_props: any) => null;
