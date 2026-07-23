import { useRef, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------
// Mantém a lista de mensagens rolada até o fim a cada atualização.
// ----------------------------------------------------------------------

export function useMessagesScroll(mensagens) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (!mensagens || !messagesEndRef.current) return;
    messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
  }, [mensagens]);

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensagens]);

  return { messagesEndRef };
}
