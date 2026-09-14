import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vikas Sahayog Samiti (विकास समिति)',
    short_name: 'Vikas Samiti',
    description: 'पारदर्शी मासिक अंशदान, रसीद व सार्वजनिक विकास कोष ट्रैकर',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#059669',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
