'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { gerarTarefasRecorrentes } from 'src/actions/tarefas';

// ----------------------------------------------------------------------

/** Competência atual no formato YYYY-MM. */
function competenciaAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const LINHAS_RESUMO = [
  { campo: 'templatesConsiderados', label: 'Templates considerados' },
  { campo: 'clientesElegiveis', label: 'Clientes elegíveis' },
  { campo: 'tarefasCriadas', label: 'Tarefas criadas' },
  { campo: 'tarefasExistentes', label: 'Já existentes (ignoradas)' },
];

// ----------------------------------------------------------------------

/**
 * Dialog de geração recorrente manual por competência (Gestores).
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {() => void} props.onClose
 * @param {Array}    props.templates   templates p/ seleção opcional
 * @param {() => void} props.onSuccess
 */
export function GerarRecorrentesDialog({ open, onClose, templates = [], onSuccess }) {
  const [competencia, setCompetencia] = useState(competenciaAtual());
  const [templateId, setTemplateId] = useState('');
  const [gerando, setGerando] = useState(false);
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    if (open) {
      setCompetencia(competenciaAtual());
      setTemplateId('');
      setResumo(null);
    }
  }, [open]);

  const handleGerar = async () => {
    if (!competencia) {
      toast.error('Informe a competência.');
      return;
    }
    setGerando(true);
    try {
      const payload = { competencia };
      if (templateId) payload.templateId = templateId;
      const res = await gerarTarefasRecorrentes(payload);
      setResumo(res);
      toast.success(`${res?.tarefasCriadas ?? 0} tarefa(s) criada(s).`);
      onSuccess?.();
    } catch (e) {
      toast.error(e?.message || e?.response?.data?.message || 'Erro ao gerar tarefas.');
    } finally {
      setGerando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Gerar tarefas recorrentes</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Competência"
            type="month"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Template (opcional)"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            fullWidth
            helperText="Vazio = gera todos os templates ativos."
          >
            <MenuItem value="">
              <em>Todos os ativos</em>
            </MenuItem>
            {templates.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.nome || t.titulo}
              </MenuItem>
            ))}
          </TextField>

          {resumo && (
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Resultado — competência {resumo.competencia}
              </Typography>
              <Stack spacing={0.75}>
                {LINHAS_RESUMO.map((l) => (
                  <Stack key={l.campo} direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {l.label}
                    </Typography>
                    <Typography variant="subtitle2">{resumo[l.campo] ?? 0}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Fechar
        </Button>
        <LoadingButton variant="contained" loading={gerando} onClick={handleGerar}>
          Gerar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
