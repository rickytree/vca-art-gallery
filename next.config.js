/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: function (config) {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })
    return config
  },
  images: {
    domains: [
      'vca-v3-token-event-covers.s3.eu-central-1.amazonaws.com',
      'vca-gallery-v3-bucket.s3.eu-central-1.amazonaws.com',
    ],
  },
}

module.exports = nextConfig
