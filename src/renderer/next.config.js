module.exports = {
  webpack(config) {
    // Allows you to load Electron modules and
    // native Node.js ones into your renderer
    config.target = "electron-renderer";
    return config;
  },
};
