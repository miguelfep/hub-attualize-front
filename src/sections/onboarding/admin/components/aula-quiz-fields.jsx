'use client';

import { useState } from 'react';

import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
  IconButton,
  Divider,
  Card,
  Alert,
  InputAdornment,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AulaQuizFields({ register, watch, setValue, errors }) {
  const conteudo = watch('conteudo') || {};
  const perguntas = conteudo?.perguntas || [];

  const handleAddPergunta = () => {
    const novasPerguntas = [
      ...perguntas,
      {
        pergunta: '',
        opcoes: ['', '', ''],
        respostaCorreta: 0,
      },
    ];
    setValue('conteudo.perguntas', novasPerguntas, { shouldValidate: true });
  };

  const handleRemovePergunta = (index) => {
    const novasPerguntas = perguntas.filter((_, i) => i !== index);
    setValue('conteudo.perguntas', novasPerguntas, { shouldValidate: true });
  };

  const handleUpdatePergunta = (index, field, value) => {
    const novasPerguntas = [...perguntas];
    novasPerguntas[index] = {
      ...novasPerguntas[index],
      [field]: value,
    };
    setValue('conteudo.perguntas', novasPerguntas, { shouldValidate: true });
  };

  const handleUpdateOpcao = (perguntaIndex, opcaoIndex, value) => {
    const novasPerguntas = [...perguntas];
    const opcoes = [...(novasPerguntas[perguntaIndex].opcoes || [])];
    opcoes[opcaoIndex] = value;
    novasPerguntas[perguntaIndex] = {
      ...novasPerguntas[perguntaIndex],
      opcoes,
    };
    setValue('conteudo.perguntas', novasPerguntas, { shouldValidate: true });
  };

  const handleAddOpcao = (perguntaIndex) => {
    const novasPerguntas = [...perguntas];
    const opcoes = [...(novasPerguntas[perguntaIndex].opcoes || []), ''];
    novasPerguntas[perguntaIndex] = {
      ...novasPerguntas[perguntaIndex],
      opcoes,
    };
    setValue('conteudo.perguntas', novasPerguntas, { shouldValidate: true });
  };

  const handleRemoveOpcao = (perguntaIndex, opcaoIndex) => {
    const novasPerguntas = [...perguntas];
    const opcoes = novasPerguntas[perguntaIndex].opcoes.filter((_, i) => i !== opcaoIndex);
    novasPerguntas[perguntaIndex] = {
      ...novasPerguntas[perguntaIndex],
      opcoes,
      // Ajustar respostaCorreta se necessário
      respostaCorreta:
        novasPerguntas[perguntaIndex].respostaCorreta >= opcoes.length
          ? opcoes.length - 1
          : novasPerguntas[perguntaIndex].respostaCorreta,
    };
    setValue('conteudo.perguntas', novasPerguntas, { shouldValidate: true });
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">Perguntas do Quiz</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddPergunta}
          >
            Adicionar Pergunta
          </Button>
        </Box>

        {perguntas.length === 0 ? (
          <Alert severity="info">Adicione pelo menos uma pergunta ao quiz.</Alert>
        ) : (
          perguntas.map((pergunta, perguntaIndex) => (
            <Card key={perguntaIndex} sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    Pergunta {perguntaIndex + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemovePergunta(perguntaIndex)}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Box>

                <TextField
                  label="Pergunta"
                  value={pergunta.pergunta || ''}
                  onChange={(e) => handleUpdatePergunta(perguntaIndex, 'pergunta', e.target.value)}
                  fullWidth
                  required
                />

                <Typography variant="body2" color="text.secondary">
                  Opções de Resposta
                </Typography>

                <Stack spacing={1}>
                  {(pergunta.opcoes || []).map((opcao, opcaoIndex) => (
                    <Box key={opcaoIndex} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        label={`Opção ${opcaoIndex + 1}`}
                        value={opcao}
                        onChange={(e) => handleUpdateOpcao(perguntaIndex, opcaoIndex, e.target.value)}
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: pergunta.respostaCorreta === opcaoIndex && (
                            <InputAdornment position="start">
                              <Iconify
                                icon="eva:checkmark-circle-2-fill"
                                sx={{ color: 'success.main' }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant={pergunta.respostaCorreta === opcaoIndex ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleUpdatePergunta(perguntaIndex, 'respostaCorreta', opcaoIndex)}
                        title="Marcar como resposta correta"
                        sx={{
                          ...(pergunta.respostaCorreta === opcaoIndex && {
                            bgcolor: 'success.main',
                            color: 'success.contrastText',
                            '&:hover': {
                              bgcolor: 'success.dark',
                            },
                          }),
                        }}
                      >
                        Correta
                      </Button>
                      {(pergunta.opcoes || []).length > 2 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveOpcao(perguntaIndex, opcaoIndex)}
                        >
                          <Iconify icon="eva:close-fill" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => handleAddOpcao(perguntaIndex)}
                >
                  Adicionar Opção
                </Button>
              </Stack>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}

