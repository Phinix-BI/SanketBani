module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin',"nativewind/babel",
    ['module:react-native-dotenv', {
      "moduleName": "@env",
      "path": ".env",
      "safe": false,
      "allowUndefined": true
    }]
  ],
};
