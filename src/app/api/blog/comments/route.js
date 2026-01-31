import axiosDirect from 'axios';
import { NextResponse } from 'next/server';

const WORDPRESS_URL = 'https://attualizecontabil.com.br';

// Opcional: Se você tiver Application Password do WordPress, adicione aqui
// const WORDPRESS_USER = process.env.WORDPRESS_USER;
// const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

// ----------------------------------------------------------------------

export async function POST(request) {
  try {
    const body = await request.json();
    const { postId, author_name, author_email, content, parent = 0 } = body;

    // Validação básica
    if (!postId || !author_name || !author_email || !content) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: postId, author_name, author_email, content' },
        { status: 400 }
      );
    }

    // Preparar headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Se tiver credenciais do WordPress configuradas, usar autenticação
    // if (WORDPRESS_USER && WORDPRESS_APP_PASSWORD) {
    //   const auth = Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_APP_PASSWORD}`).toString('base64');
    //   headers.Authorization = `Basic ${auth}`;
    // }

    // Fazer requisição ao WordPress
    const response = await axiosDirect.post(
      `${WORDPRESS_URL}/wp-json/wp/v2/comments`,
      {
        post: postId,
        author_name,
        author_email,
        content,
        parent,
      },
      { headers }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);

    // Retornar erro mais amigável
    if (error.response) {
      const { status, data } = error.response;
      
      // Se for erro de autenticação
      if (status === 401 || data?.code === 'rest_comment_login_required') {
        return NextResponse.json(
          {
            error: 'Comentários anônimos não estão habilitados no WordPress.',
            code: 'rest_comment_login_required',
            message: 'Para habilitar comentários anônimos, vá em Configurações > Discussão no WordPress e marque "Permitir que pessoas postem comentários em novos artigos".',
            details: data,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: data?.message || 'Erro ao criar comentário',
          code: data?.code,
          details: data,
        },
        { status }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar comentário. Tente novamente.' },
      { status: 500 }
    );
  }
}
