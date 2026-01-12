'use client';

import { useState, useEffect } from 'react';

import {
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Typography,
  Alert,
  Stack,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AulaQuiz({ aula, progressoAula, onConcluir }) {
  const [respostas, setRespostas] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [concluida, setConcluida] = useState(progressoAula?.concluida || false);

  const perguntas = aula.conteudo?.perguntas || [];

  useEffect(() => {
    // Restaura respostas anteriores se houver
    if (progressoAula?.respostasQuiz && progressoAula.respostasQuiz.length > 0) {
      const respostasAnteriores = {};
      progressoAula.respostasQuiz.forEach((r) => {
        respostasAnteriores[r.perguntaIndex] = r.respostaIndex;
      });
      setRespostas(respostasAnteriores);
      setEnviado(true);
      
      // Restaura o resultado para mostrar as respostas corretas
      const perguntas = aula.conteudo?.perguntas || [];
      const totalCorretas = progressoAula.respostasQuiz.filter((r) => r.correta).length;
      const percentual = (totalCorretas / perguntas.length) * 100;
      
      setResultado({
        totalCorretas,
        totalPerguntas: perguntas.length,
        percentual,
        respostasQuiz: progressoAula.respostasQuiz,
      });
      
      // Atualiza o estado de concluída baseado no progressoAula
      if (progressoAula.concluida) {
        setConcluida(true);
      }
    } else {
      // Se não há respostas salvas, reseta o estado
      setRespostas({});
      setEnviado(false);
      setResultado(null);
      setConcluida(progressoAula?.concluida || false);
    }
  }, [progressoAula, aula.conteudo?.perguntas]);

  const handleRespostaChange = (perguntaIndex, respostaIndex) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaIndex]: respostaIndex,
    }));
  };

  const handleEnviar = () => {
    const respostasQuiz = perguntas.map((pergunta, index) => {
      const respostaIndex = respostas[index] ?? -1;
      const correta = respostaIndex === pergunta.respostaCorreta;
      return {
        perguntaIndex: index,
        respostaIndex,
        correta,
      };
    });

    const totalCorretas = respostasQuiz.filter((r) => r.correta).length;
    const percentual = (totalCorretas / perguntas.length) * 100;

    setResultado({
      totalCorretas,
      totalPerguntas: perguntas.length,
      percentual,
      respostasQuiz,
    });

    setEnviado(true);

    // Marca como concluída se todas as respostas estiverem corretas
    if (totalCorretas === perguntas.length) {
      setConcluida(true);
      if (onConcluir) {
        onConcluir({ respostasQuiz, concluida: true });
      }
    } else if (onConcluir) {
      // Salva as respostas mesmo se não estiver tudo correto
      onConcluir({ respostasQuiz, concluida: false });
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {aula.titulo}
      </Typography>

      <Stack spacing={3}>
        {perguntas.map((pergunta, perguntaIndex) => {
          const respostaAtual = respostas[perguntaIndex];
          const respostaCorreta = pergunta.respostaCorreta;
          // Mostra resultado se foi enviado E tem resultado OU se a aula está concluída
          const mostraResultado = (enviado && resultado) || concluida;

          return (
            <Box key={perguntaIndex} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {perguntaIndex + 1}. {pergunta.pergunta}
                </FormLabel>
                <RadioGroup
                  value={respostaAtual ?? ''}
                  onChange={(e) => handleRespostaChange(perguntaIndex, parseInt(e.target.value, 10))}
                  disabled={enviado || concluida}
                >
                  {pergunta.opcoes.map((opcao, opcaoIndex) => {
                    const isSelected = respostaAtual === opcaoIndex;
                    const isCorrect = opcaoIndex === respostaCorreta;
                    // Mostra correção se foi selecionado OU se é a resposta correta e a aula está concluída
                    const mostraCorrecao = mostraResultado && (isSelected || (concluida && isCorrect));

                    return (
                      <FormControlLabel
                        key={opcaoIndex}
                        value={opcaoIndex}
                        control={<Radio />}
                        label={opcao}
                        sx={{
                          ...(mostraCorrecao && {
                            bgcolor: isCorrect ? 'success.lighter' : 'error.lighter',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            mb: 1,
                          }),
                        }}
                      />
                    );
                  })}
                </RadioGroup>
                {mostraResultado && respostaAtual === respostaCorreta && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                    <Iconify icon="eva:checkmark-circle-2-fill" width={20} />
                    <Typography variant="body2">Resposta correta!</Typography>
                  </Box>
                )}
                {mostraResultado && respostaAtual !== respostaCorreta && respostaAtual !== undefined && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="error">
                      Resposta incorreta. A resposta correta é: {pergunta.opcoes[respostaCorreta]}
                    </Typography>
                  </Box>
                )}
                {mostraResultado && respostaAtual === undefined && concluida && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Resposta correta: {pergunta.opcoes[respostaCorreta]}
                    </Typography>
                  </Box>
                )}
              </FormControl>
            </Box>
          );
        })}
      </Stack>

      {(resultado || (enviado && progressoAula?.respostasQuiz)) && (
        <Alert
          severity={(resultado?.percentual === 100 || concluida) ? 'success' : 'warning'}
          sx={{ mt: 3 }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {resultado ? (
              <>
                Resultado: {resultado.totalCorretas} de {resultado.totalPerguntas} corretas (
                {Math.round(resultado.percentual)}%)
              </>
            ) : progressoAula?.respostasQuiz ? (
              <>
                Resultado: {progressoAula.respostasQuiz.filter((r) => r.correta).length} de {perguntas.length} corretas (
                {Math.round((progressoAula.respostasQuiz.filter((r) => r.correta).length / perguntas.length) * 100)}%)
              </>
            ) : null}
          </Typography>
          {((resultado?.percentual === 100) || concluida) ? (
            <Typography variant="body2">Parabéns! Você acertou todas as perguntas.</Typography>
          ) : (
            <Typography variant="body2">
              Continue tentando! Você precisa acertar todas as perguntas para concluir esta aula.
            </Typography>
          )}
        </Alert>
      )}

      {!enviado && (
        <Button
          variant="contained"
          onClick={handleEnviar}
          disabled={Object.keys(respostas).length !== perguntas.length}
          sx={{ mt: 3 }}
        >
          Enviar Respostas
        </Button>
      )}

      {enviado && !concluida && resultado?.percentual !== 100 && (
        <Button
          variant="outlined"
          onClick={() => {
            setRespostas({});
            setEnviado(false);
            setResultado(null);
          }}
          sx={{ mt: 2 }}
        >
          Tentar Novamente
        </Button>
      )}

      {concluida && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 1,
            bgcolor: 'success.lighter',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: 'success.main' }} />
          <Typography variant="body2" sx={{ color: 'success.darker' }}>
            Quiz concluído com sucesso!
          </Typography>
        </Box>
      )}
    </Box>
  );
}

