// Platform-neutral entry for MapView shim — require platform-specific implementation at runtime
import { Platform } from 'react-native';

let impl: any;
if (Platform.OS === 'web') {
  // require dynamically so Metro doesn't try to resolve native-only modules on web
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  impl = require('./MapShim.web');
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  impl = require('./MapShim.native');
}

const exportedDefault = impl && (impl.default || impl);

export default exportedDefault;
export const Marker = impl?.Marker || undefined;


