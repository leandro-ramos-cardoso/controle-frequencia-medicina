import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Controle de Frequência — Estágios de Medicina',
    short_name: 'Frequência Medicina',
    description: 'Registro e acompanhamento de frequência em estágios práticos de Medicina.',
    start_url: '/aluno/dashboard',
    display: 'standalone',
    background_color: '#F7F3EC',
    theme_color: '#123526',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
