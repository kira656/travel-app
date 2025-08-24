// components/MapView.tsx
import React from 'react';
import { Platform, Text, View } from 'react-native';

type AnyComp = React.ComponentType<any> | null;

// Validate a React element type (function or forwardRef/memo object)
const isValidType = (C: any) =>
  typeof C === 'function' || (typeof C === 'object' && C !== null && !!C.$$typeof);

let RawMapView: AnyComp = null;
let RawMarker: AnyComp = null;

if (Platform.OS !== 'web') {
  try {
    // CJS-safe require so web doesn't try to bundle it
    const mod = require('react-native-maps');
    const RNMapView = mod?.default;   // default export
    const RNMarker  = mod?.Marker;    // named export

    RawMapView = isValidType(RNMapView) ? RNMapView : null;
    RawMarker  = isValidType(RNMarker)  ? RNMarker  : null;
  } catch {
    // leave RawMapView/RawMarker as null → graceful fallback below
  }
}

export const MapView: React.FC<any> = (props) => {
  if (!RawMapView) {
    return (
      <View style={[{ padding: 20, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }, props.style]}>
        <Text>Map unavailable</Text>
        {props.children}
      </View>
    );
  }
  return <RawMapView {...props}>{props.children}</RawMapView>;
};

export const Marker: React.FC<any> = (props) => {
  if (!RawMarker) return null;
  return <RawMarker {...props} />;
};
