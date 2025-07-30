const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Handle react-native-maps and other native modules on web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': require.resolve('./components/MapView'),
  };

  // Add fallbacks for native modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native/Libraries/Utilities/codegenNativeCommands': false,
    'react-native/Libraries/Utilities/codegenNativeComponent': false,
    'react-native/Libraries/Utilities/codegenNativeComponentFabric': false,
  };

  return config;
}; 