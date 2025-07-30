module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Handle native modules on web
      [
        'module-resolver',
        {
          alias: {
            'react-native-maps': './components/MapView',
          },
        },
      ],
    ],
  };
}; 