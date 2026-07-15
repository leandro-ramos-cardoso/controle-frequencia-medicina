/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Sem isso, o Router Cache do Next mantém a versão de uma rota dinâmica
    // por até 30s — navegar de volta ao painel logo após registrar um ponto
    // (ou criar uma solicitação) podia mostrar dados desatualizados.
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
