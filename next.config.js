/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatar.iran.liara.run',
      'images.unsplash.com',
      'via.placeholder.com',
      'placekitten.com',
      'placehold.co',
      'picsum.photos',
      'source.unsplash.com',
      'res.cloudinary.com'
    ],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Increase the build memory limit to prevent OOM issues
  webpack: (config) => {
    config.performance = {
      hints: false,
    };
    // Add a special case for SVGs
    const fileLoaderRule = config.module.rules.find(rule => rule.test?.test?.('.svg'));
    config.module.rules.push({
      test: /\.svg$/,
      issuer: { not: [/\.(js|ts)x?$/] },
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

module.exports = nextConfig;
