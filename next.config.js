// next.config.js
module.exports = {
  reactStrictMode: true,
  // webpack: (config) => {
  //   // Exclude @mui and @emotion from being transpiled by SWC
  //   config.module.rules.forEach((rule) => {
  //     if (rule && rule.use && rule.use.loader === 'next-swc-loader') {
  //       rule.exclude = rule.exclude || [];
  //       rule.exclude.push(/node_modules\/@mui\/.*/);
  //       rule.exclude.push(/node_modules\/@emotion\/.*/);
  //     }
  //   });

  //   // Add a rule to transpile @mui and @emotion with Babel
  //   config.module.rules.push({
  //     test: /\.(js|jsx|ts|tsx)$/,
  //     include: [
  //       /node_modules\/@mui\/.*/,
  //       /node_modules\/@emotion\/.*/,
  //     ],
  //     use: {
  //       loader: 'babel-loader',
  //       options: {
  //         presets: ['next/babel'],
  //       },
  //     },
  //   });

  //   return config;
  // },
};
