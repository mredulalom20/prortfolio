/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*).html',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
        { source: '/about', destination: '/about.html' },
        { source: '/graphic-design', destination: '/graphic-design.html' },
        { source: '/ui-design', destination: '/ui-design.html' },
        { source: '/meta-ads', destination: '/meta-ads.html' },
        { source: '/wordpress-dev', destination: '/wordpress-dev.html' },
        { source: '/blog', destination: '/blog.html' },
      ]
    };
  },
};

export default nextConfig;
