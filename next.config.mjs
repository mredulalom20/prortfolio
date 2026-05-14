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
        { source: '/:slug.html', destination: '/api/page/:slug' },
        { source: '/', destination: '/api/page/index' },
        { source: '/about', destination: '/api/page/about' },
        { source: '/graphic-design', destination: '/api/page/graphic-design' },
        { source: '/ui-design', destination: '/api/page/ui-design' },
        { source: '/meta-ads', destination: '/api/page/meta-ads' },
        { source: '/wordpress-dev', destination: '/api/page/wordpress-dev' },
        { source: '/seo', destination: '/api/page/seo' },
      ]
    };
  },
};

export default nextConfig;
