'use client';

import { useEffect } from 'react';
import { usePathname } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function FlowiseChatbot() {
  const pathname = usePathname();

  useEffect(() => {
    // Não carregar chatbot em rotas do dashboard ou portal-cliente
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/portal-cliente')) {
      return;
    }

    // Verificar se o script já foi carregado
    if (document.querySelector('script[data-flowise-chatbot]')) {
      return;
    }

    // Carregar o script do chatbot
    const script = document.createElement('script');
    script.type = 'module';
    script.setAttribute('data-flowise-chatbot', 'true');
    script.textContent = `
import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"

Chatbot.init({
    chatflowid: "99b49944-9619-4c32-92d2-eb22a1fc3e6c",
    apiHost: "https://flowise.attualizecontabil.com.br",
})
    `.trim();

    document.body.appendChild(script);

    return () => {
      // Limpar script ao desmontar se sair da página
      const existingScript = document.querySelector('script[data-flowise-chatbot]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, [pathname]);

  return null;
}

