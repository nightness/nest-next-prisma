/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        // Add custom CSS handling if necessary
        return config;
      },    
    // webpack: (config, { isServer }) => {
    //     if (!isServer) {
    //         config.resolve.alias['@sentry/node'] = '@sentry/browser';
    //     }

    //     // PostCSS loader
    //     const postcssLoader = config.module.rules.find((rule) => rule.test.toString().includes('css'));
    //     postcssLoader.use.push({
    //         loader: 'postcss-loader',
    //         options: {
    //             postcssOptions: {
    //                 plugins: {
    //                     tailwindcss: {},
    //                 },
    //             },
    //         },
    //     });

    //     return config;
    // }
};

export default nextConfig;
