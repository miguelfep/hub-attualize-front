/**
 * Extrai o ID do vídeo do YouTube a partir de uma URL
 * @param {string} url - URL do YouTube
 * @returns {string|null} - ID do vídeo ou null
 */
export function extractYouTubeVideoId(url) {
  if (!url) return null;

  // Remove espaços e normaliza a URL
  const cleanUrl = url.trim();

  // Padrões para diferentes formatos de URL do YouTube
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID&list=...
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/watch?*&v=VIDEO_ID
    /youtube\.com\/watch\?.*[&?]v=([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      // O ID do YouTube sempre tem 11 caracteres
      const videoId = match[1];
      if (videoId.length === 11) {
        return videoId;
      }
    }
  }

  return null;
}

/**
 * Verifica se a URL é do YouTube
 * @param {string} url - URL para verificar
 * @returns {boolean}
 */
export function isYouTubeUrl(url) {
  if (!url) return false;
  return /youtube\.com|youtu\.be/.test(url);
}

/**
 * Obtém a duração de um vídeo do YouTube fazendo scraping da página
 * Nota: Esta é uma solução alternativa quando não há API key
 * @param {string} videoId - ID do vídeo do YouTube
 * @returns {Promise<number|null>} - Duração em minutos ou null
 */
export async function getYouTubeVideoDuration(videoId) {
  if (!videoId) return null;

  try {
    // Tenta obter a página do vídeo e extrair os metadados
    // O YouTube inclui informações de duração nos metadados da página
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      mode: 'no-cors', // Pode não funcionar devido a CORS
    });

    // Alternativa: usar um serviço proxy ou fazer no backend
    // Por enquanto, vamos tentar usar um serviço público
    
    // Usa um serviço público que faz o scraping por nós
    try {
      const proxyResponse = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      
      if (proxyResponse.ok) {
        // oEmbed não retorna duração, mas podemos tentar outro método
      }
    } catch (e) {
      // Ignora erro
    }

    // Como não podemos fazer scraping direto do cliente devido a CORS,
    // a melhor solução é usar a YouTube Data API v3
    // Retornamos null para indicar que precisa de API key ou preenchimento manual
    return null;
  } catch (error) {
    console.error('Erro ao obter duração do vídeo:', error);
    return null;
  }
}

/**
 * Obtém a duração usando YouTube Data API v3
 * @param {string} videoId - ID do vídeo
 * @param {string} apiKey - Chave da API do YouTube
 * @returns {Promise<number|null>} - Duração em minutos ou null
 */
export async function getYouTubeVideoDurationWithAPI(videoId, apiKey) {
  if (!videoId || !apiKey) return null;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do vídeo');
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const duration = data.items[0].contentDetails.duration;
      // Formato: PT1H2M10S (1 hora, 2 minutos, 10 segundos)
      const minutes = parseYouTubeDuration(duration);
      return minutes;
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter duração com API:', error);
    return null;
  }
}

/**
 * Converte duração do YouTube (PT1H2M10S) para minutos
 * @param {string} duration - Duração no formato ISO 8601
 * @returns {number} - Duração em minutos (arredondada)
 */
function parseYouTubeDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return 0;

  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
  return totalMinutes;
}

/**
 * Tenta obter a duração de um vídeo do YouTube
 * Primeiro tenta com API key (se configurada), depois sem
 * @param {string} url - URL do vídeo do YouTube
 * @param {string} apiKey - Chave da API (opcional)
 * @returns {Promise<number|null>} - Duração em minutos ou null
 */
export async function getVideoDuration(url, apiKey = null) {
  if (!isYouTubeUrl(url)) {
    return null;
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }

  // Se tiver API key, usa ela
  if (apiKey) {
    const duration = await getYouTubeVideoDurationWithAPI(videoId, apiKey);
    if (duration !== null) {
      return duration;
    }
  }

  // Tenta método alternativo (pode ser implementado com outro serviço)
  // Por enquanto retorna null para o usuário preencher manualmente
  return null;
}

