// ----------------------------------------------------------------------
// URL da foto de perfil de um usuário. O backend grava `imgprofile` relativo
// (ex.: 'avatars/<id>-<ts>.jpg'), servido pelo static da API (inclusive sob /api).
// Retorna null quando não há foto (a UI cai para as iniciais).
// ----------------------------------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function avatarUrl(user) {
  const img = user?.imgprofile;
  if (!img || typeof img !== 'string') return null;
  // Valor default legado do backend — não é uma foto real.
  if (img.includes('default/avatar')) return null;
  if (img.startsWith('http')) return img;
  return `${API_BASE}${img.replace(/^\//, '')}`;
}

export default avatarUrl;
