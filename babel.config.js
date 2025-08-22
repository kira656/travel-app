module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Keep ONLY your app aliases (example)
      ['module-resolver', {
        alias: {
          '@': './',           // ← your project alias (optional)
          // ❌ REMOVE this line:
          // 'react-native-maps': './components/MapView',
        },
        extensions: ['.tsx','.ts','.js','.jsx','.json']
      }],
    ],
  };
};
