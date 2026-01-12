'use client';

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import {
  Box,
  Card,
  Stack,
  Button,
  TextField,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from '@mui/material';

import { toast } from 'sonner';

import { Iconify } from 'src/components/iconify';

import { AulaFormDialog } from './aula-form-dialog';

// ----------------------------------------------------------------------

const TIPOS_AULA = [
  { value: 'video', label: 'Vídeo' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'texto', label: 'Texto' },
  { value: 'arquivo', label: 'Arquivo' },
];

// ----------------------------------------------------------------------

export function AulasManager() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'aulas',
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const aulas = watch('aulas') || [];

  const handleAddAula = () => {
    setEditingIndex(null);
    setOpenDialog(true);
  };

  const handleEditAula = (index) => {
    setEditingIndex(index);
    setOpenDialog(true);
  };

  const handleSaveAula = (aulaData) => {
    if (editingIndex !== null) {
      // Atualizar aula existente
      const aulaAtualizada = {
        ...aulaData,
        ordem: aulas[editingIndex]?.ordem || editingIndex + 1,
      };
      update(editingIndex, aulaAtualizada);
    } else {
      // Adicionar nova aula
      append({
        ...aulaData,
        ordem: aulas.length + 1,
      });
    }
    setOpenDialog(false);
    setEditingIndex(null);
  };

  const handleDeleteAula = (index) => {
    remove(index);
    toast.success('Aula removida');
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const handleMoveDown = (index) => {
    if (index < aulas.length - 1) {
      move(index, index + 1);
    }
  };

  return (
    <>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Aulas</Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAddAula}
            >
              Adicionar Aula
            </Button>
          </Box>

          {aulas.length === 0 ? (
            <Alert severity="info">
              Nenhuma aula adicionada. Clique em "Adicionar Aula" para começar.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {fields.map((field, index) => {
                const aula = aulas[index];
                const tipoLabel = TIPOS_AULA.find((t) => t.value === aula?.tipo)?.label || 'Desconhecido';

                return (
                  <Accordion key={field.id} defaultExpanded={index === 0}>
                    <AccordionSummary
                      expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                      sx={{ bgcolor: 'background.neutral' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Typography variant="subtitle2">
                          {aula?.ordem || index + 1}. {aula?.titulo || 'Nova Aula'}
                        </Typography>
                        <Chip label={tipoLabel} size="small" variant="soft" />
                        {aula?.obrigatoria && (
                          <Chip label="Obrigatória" size="small" color="warning" variant="soft" />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            title="Mover para cima"
                          >
                            <Iconify icon="eva:arrow-upward-fill" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === aulas.length - 1}
                            title="Mover para baixo"
                          >
                            <Iconify icon="eva:arrow-downward-fill" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditAula(index)}
                            title="Editar"
                          >
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteAula(index)}
                            title="Remover"
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Box>

                        <Divider />

                        <Typography variant="body2" color="text.secondary">
                          <strong>Tipo:</strong> {tipoLabel}
                        </Typography>
                        {aula?.descricao && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Descrição:</strong> {aula.descricao}
                          </Typography>
                        )}
                        {aula?.duracaoEstimada && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Duração Estimada:</strong> {aula.duracaoEstimada} minutos
                          </Typography>
                        )}
                        {aula?.tipo === 'quiz' && aula?.conteudo?.perguntas && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Perguntas:</strong> {aula.conteudo.perguntas.length}
                          </Typography>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card>

      <AulaFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingIndex(null);
        }}
        onSave={handleSaveAula}
        aula={editingIndex !== null ? aulas[editingIndex] : null}
      />
    </>
  );
}

