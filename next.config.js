// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV !== 'production',
  runtimeCaching: [
    {
      urlPattern: /^\/api\/.*$/,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /^\/swagger\/.*$/,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /^\/css\/.*$/,
      handler: 'NetworkOnly',
    },
    // Add other caching rules here if necessary
  ],
});

// next.config.js
module.exports = withPWA({
  reactStrictMode: true,
  // webpack: (config) => {
  //   return config;
  // },
});