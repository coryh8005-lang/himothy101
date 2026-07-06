const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Drizzle migrations are imported as .sql source files (see babel.config.js).
config.resolver.sourceExts.push('sql');

module.exports = config;
