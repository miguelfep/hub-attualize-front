'use client';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Editor de checklist usado nos formulários de tarefa e de template recorrente.
 * Trabalha com itens `{ titulo, descricao?, obrigatorio? }` (a ordem é a posição
 * na lista). Itens obrigatórios impedem a conclusão da tarefa até serem marcados.
 *
 * @param {object} props
 * @param {Array<{ titulo: string, descricao?: string, obrigatorio?: boolean }>} props.itens
 * @param {(itens: Array) => void} props.onChange
 * @param {string=} props.helperText
 */
export function ChecklistEditor({ itens = [], onChange, helperText }) {
  const setItem = (idx, campo, valor) => {
    const novos = itens.map((item, i) => (i === idx ? { ...item, [campo]: valor } : item));
    onChange(novos);
  };

  const adicionar = () => onChange([...itens, { titulo: '', descricao: '', obrigatorio: false }]);

  const remover = (idx) => onChange(itens.filter((_, i) => i !== idx));

  const mover = (idx, delta) => {
    const destino = idx + delta;
    if (destino < 0 || destino >= itens.length) return;
    const novos = [...itens];
    [novos[idx], novos[destino]] = [novos[destino], novos[idx]];
    onChange(novos);
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">Checklist (passo a passo)</Typography>
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={adicionar}
        >
          Adicionar passo
        </Button>
      </Stack>

      {helperText && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {helperText}
        </Typography>
      )}

      {itens.map((item, idx) => (
        <Stack
          key={idx}
          direction="row"
          spacing={1}
          alignItems="flex-start"
          sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}
        >
          <Typography variant="caption" sx={{ mt: 1.25, color: 'text.disabled', minWidth: 18 }}>
            {idx + 1}.
          </Typography>
          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder={`Passo ${idx + 1}`}
              value={item.titulo}
              onChange={(e) => setItem(idx, 'titulo', e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              multiline
              maxRows={3}
              placeholder="Descrição (opcional)"
              value={item.descricao || ''}
              onChange={(e) => setItem(idx, 'descricao', e.target.value)}
            />
            <FormControlLabel
              sx={{ ml: 0 }}
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(item.obrigatorio)}
                  onChange={(e) => setItem(idx, 'obrigatorio', e.target.checked)}
                />
              }
              label={
                <Typography variant="caption">
                  Obrigatório — impede finalizar a tarefa sem concluir este passo
                </Typography>
              }
            />
          </Stack>
          <Stack spacing={0}>
            <IconButton size="small" disabled={idx === 0} onClick={() => mover(idx, -1)}>
              <Iconify icon="eva:arrow-ios-upward-fill" width={16} />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => remover(idx)}>
              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
            </IconButton>
            <IconButton
              size="small"
              disabled={idx === itens.length - 1}
              onClick={() => mover(idx, 1)}
            >
              <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
            </IconButton>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

/** Converte os itens do editor para o payload da API (descarta títulos vazios). */
export function checklistParaPayload(itens = []) {
  return itens
    .map((item, idx) => ({
      titulo: (item.titulo || '').trim(),
      descricao: (item.descricao || '').trim() || undefined,
      ordem: idx + 1,
      obrigatorio: Boolean(item.obrigatorio),
    }))
    .filter((item) => item.titulo);
}
