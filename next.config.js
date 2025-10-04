/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import("next").NextConfig} */
const config = {
  serverExternalPackages: ["postgres"],
  // Experimental optimization for reducing large string serialization
  experimental: {
    webpackBuildWorker: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      // Exclude postgres from client-side bundles and Edge Runtime
      config.externals = config.externals || [];
      config.externals.push({
        postgres: "commonjs postgres",
      });
    }

    // Suppress the webpack cache warning for production builds
    if (!dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }

    // Optimize webpack cache for better performance with large strings
    if (config.cache && config.cache.type === 'filesystem') {
      config.cache.maxMemoryGenerations = 0; // Reduce memory usage
      config.cache.compression = 'gzip';
      
      // Use pack store for better compression of large dependencies
      config.cache.store = 'pack';
      config.cache.buildDependencies = {
        config: [__filename],
      };
    }

    // Optimize module concatenation to reduce string sizes
    config.optimization = {
      ...config.optimization,
      concatenateModules: true,
      usedExports: true,
      sideEffects: false,
    };

    // Optimize chunk splitting for large dependencies like echarts
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        maxSize: 200000, // Limit chunk size to 200KB
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
          },
          echarts: {
            test: /[\\/]node_modules[\\/](echarts|echarts-for-react)[\\/]/,
            name: 'echarts',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    return config;
  },
};

export default config;
