const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // ❌ Remove the react-native-maps alias entirely.
  // If you keep it, make sure it points to a file that default-exports a component,
  // but with the shim below you don’t need any alias.

  // You can also remove those codegen fallbacks; not needed for this case.
  return config;
};
