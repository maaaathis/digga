import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'digga · Infrastructure research',
    short_name: 'digga',
    description: 'Domain- & Infrastructure research',
    start_url: '/',
    display: 'standalone',
    background_color: '#030711',
    theme_color: '#030711',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-256x256.png',
        sizes: '256x256',
        type: 'image/png',
      },
    ],
  };
}
