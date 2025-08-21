import { Platform } from 'react-native';

let MapView: any;
let Marker: any;

if (Platform.OS === 'web') {
  MapView = ({ children, style }: any) => <div style={{ ...style, backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{children}</div>;
  Marker = () => null;
} else {
  MapView = require('react-native-maps').default;
  Marker = require('react-native-maps').Marker;
}

export { MapView, Marker };
