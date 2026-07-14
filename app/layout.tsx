import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Controle de Frequência — Estágios de Medicina',
  description:
    'Registro, validação e gestão de frequência de alunos de Medicina em estágios práticos.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#123526',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
