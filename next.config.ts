import { withSentryConfig } from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
  // @sparticuz/chromium ships brotli-compressed Chromium binaries in its bin/
  // directory. Bundling it strips those, so at runtime the serverless function
  // fails with "The input directory .../@sparticuz/chromium/bin does not exist".
  // Marking these external keeps them in node_modules where the loader expects.
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],

  // Marking the package external is not enough on its own. The Chromium
  // binaries live in bin/*.br and are opened by path at runtime, so nothing
  // statically references them and file tracing leaves them out: the lambda
  // ships the loader with no browser to decompress. Force them in.
  outputFileTracingIncludes: {
    '/api/download-pdf': ['./node_modules/@sparticuz/chromium/bin/**'],
    '/api/download-cover-letter': ['./node_modules/@sparticuz/chromium/bin/**'],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "shortlist-3l",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
