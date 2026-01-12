'use client';

import { useState, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import {
  Box,
  Card,
  Stack,
  Button,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';

import { toast } from 'sonner';

import { Iconify } from 'src/components/iconify';

import { listarAulas } from 'src/actions/onboarding';

// ----------------------------------------------------------------------

export function AulasSelector() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'aulas',
  });

  const [aulasDisponiveis, setAulasDisponiveis] = useState([]);
  const [loadingAulas, setLoadingAulas] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');

  const aulas = watch('aulas') || [];

  // Carrega aulas quando o componente monta
  useEffect(() => {
    carregarAulas();
  }, []);

  // Recarrega quando o filtro muda
  useEffect(() => {
    if (aulasDisponiveis.length > 0) {
      carregarAulas();
    }
  }, [filtroTipo]);

  const carregarAulas = async () => {
    setLoadingAulas(true);
    try {
      // Sempre carrega todas as aulas ativas (sem filtro) para garantir que temos todas disponíveis
      // O filtro é apenas para o Autocomplete
      const response = await listarAulas({ ativo: true });
      if (response.data?.success) {
        setAulasDisponiveis(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setAulasDisponiveis(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
      toast.error('Erro ao carregar aulas disponíveis');
    } finally {
      setLoadingAulas(false);
    }
  };

  const handleAddAula = (aula) => {
    // Verifica se a aula já foi adicionada
    const jaExiste = aulas.some((a) => a.aulaId === aula._id);
    if (jaExiste) {
      toast.warning('Esta aula já foi adicionada ao onboarding');
      return;
    }

    // Adiciona a aula com ordem
    append({
      aulaId: aula._id,
      ordem: aulas.length + 1,
      obrigatoria: aula.obrigatoria, // Usa o valor padrão da aula, pode ser sobrescrito
    });
    toast.success('Aula adicionada');
  };

  const handleRemoveAula = (index) => {
    remove(index);
    toast.success('Aula removida');
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      move(index, index - 1);
      // Atualiza a ordem após mover
      setTimeout(() => {
        const aulasAtualizadas = watch('aulas');
        aulasAtualizadas.forEach((aula, idx) => {
          setValue(`aulas.${idx}.ordem`, idx + 1);
        });
      }, 0);
    }
  };

  const handleMoveDown = (index) => {
    if (index < aulas.length - 1) {
      move(index, index + 1);
      // Atualiza a ordem após mover
      setTimeout(() => {
        const aulasAtualizadas = watch('aulas');
        aulasAtualizadas.forEach((aula, idx) => {
          setValue(`aulas.${idx}.ordem`, idx + 1);
        });
      }, 0);
    }
  };

  const handleToggleObrigatoria = (index) => {
    const aulaAtual = aulas[index];
    setValue(`aulas.${index}.obrigatoria`, !aulaAtual.obrigatoria);
  };

  const getAulaInfo = (aulaId) => {
    if (!aulaId) return null;
    
    // Normaliza os IDs para comparação (converte ambos para string)
    const normalizedAulaId = String(aulaId);
    
    return aulasDisponiveis.find((a) => {
      // Tenta diferentes formatos de ID
      const normalizedAId = String(a._id || a.id || '');
      return normalizedAId === normalizedAulaId;
    });
  };

  const TIPOS_AULA = [
    { value: '', label: 'Todos' },
    { value: 'video', label: 'Vídeo' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'texto', label: 'Texto' },
    { value: 'arquivo', label: 'Arquivo' },
  ];

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Aulas do Onboarding
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Selecione aulas existentes para adicionar ao onboarding. A ordem das aulas define a sequência em que serão apresentadas.
            <br />
            <strong>Dica:</strong> Crie aulas primeiro na seção "Aulas" do menu antes de adicioná-las aqui.
          </Alert>
        </Box>

        {/* Filtro e Seleção de Aulas */}
        <Card sx={{ p: 2 }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="filtro-tipo-label">Filtrar por Tipo</InputLabel>
              <Select
                labelId="filtro-tipo-label"
                id="filtro-tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                label="Filtrar por Tipo"
              >
                {TIPOS_AULA.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              options={aulasDisponiveis.filter((aula) => {
                // Aplica filtro de tipo se houver
                if (filtroTipo && aula.tipo !== filtroTipo) {
                  return false;
                }
                // Filtra aulas que já foram adicionadas
                const aulaId = String(aula._id || aula.id || '');
                return !aulas.some((a) => {
                  const normalizedAulaId = String(a.aulaId || a._id || '');
                  return normalizedAulaId === aulaId;
                });
              })}
              getOptionLabel={(option) => `${option.titulo} (${option.tipo})`}
              loading={loadingAulas}
              onOpen={carregarAulas}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleAddAula(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Selecionar Aula para Adicionar"
                  placeholder="Digite para buscar uma aula..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingAulas ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {option.titulo}
                    </Typography>
                    <Chip label={option.tipo} size="small" variant="outlined" />
                    {option.obrigatoria && (
                      <Chip label="Obrigatória" size="small" color="primary" />
                    )}
                  </Stack>
                </Box>
              )}
            />
          </Stack>
        </Card>

        {/* Lista de Aulas Adicionadas */}
        {aulas.length === 0 ? (
          <Alert severity="warning">
            Nenhuma aula adicionada. Selecione aulas acima para adicionar ao onboarding.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {fields.map((field, index) => {
              // Pega o aulaId do field ou do objeto aula
              const aulaAtual = aulas[index];
              
              // Tenta obter o aulaId de diferentes formas
              let aulaId = field.aulaId || aulaAtual?.aulaId;
              
              // Se não encontrou, pode ser que a API retornou a aula populada
              if (!aulaId && aulaAtual?.aulaId?._id) {
                aulaId = aulaAtual.aulaId._id;
              } else if (!aulaId && aulaAtual?.aulaId) {
                // Se aulaId é um objeto, pega o _id
                aulaId = typeof aulaAtual.aulaId === 'object' ? aulaAtual.aulaId._id : aulaAtual.aulaId;
              }
              
              // Tenta obter informações da aula
              let aulaInfo = getAulaInfo(aulaId);
              
              // Se não encontrou e a aula veio populada da API, usa ela diretamente
              if (!aulaInfo && aulaAtual?.aulaId && typeof aulaAtual.aulaId === 'object' && aulaAtual.aulaId.titulo) {
                aulaInfo = aulaAtual.aulaId;
              }

              return (
                <Card key={field.id} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">
                          {index + 1}. {aulaInfo?.titulo || 'Aula não encontrada'}
                        </Typography>
                        {aulaInfo && (
                          <>
                            <Chip label={aulaInfo.tipo} size="small" variant="outlined" />
                            {aulaAtual.obrigatoria && (
                              <Chip label="Obrigatória" size="small" color="primary" />
                            )}
                          </>
                        )}
                      </Stack>
                      {aulaInfo?.descricao && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {aulaInfo.descricao}
                        </Typography>
                      )}
                    </Box>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={aulaAtual.obrigatoria || false}
                          onChange={() => handleToggleObrigatoria(index)}
                        />
                      }
                      label="Obrigatória"
                    />

                    <IconButton
                      size="small"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <Iconify icon="eva:arrow-up-fill" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === aulas.length - 1}
                    >
                      <Iconify icon="eva:arrow-down-fill" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveAula(index)}
                    >
                      <Iconify icon="eva:trash-2-fill" />
                    </IconButton>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}


