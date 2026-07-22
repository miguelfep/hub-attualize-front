import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import { getTemplates } from 'src/actions/whatsapp';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------
// Seletor de template (HSM) aprovado + preenchimento das variáveis {{1}}, {{2}}…
// Reutilizável: chama `onChange({ template, valido })` sempre que a seleção ou
// os valores mudam. `template` é o objeto pronto ({ name, language, components })
// ou null; `valido` indica se todas as variáveis foram preenchidas.
// ----------------------------------------------------------------------

/** Preenche o bodyPreview com os valores digitados, para uma prévia. */
function montarPreview(bodyPreview = '', valores = []) {
  return bodyPreview.replace(/\{\{(\d+)\}\}/g, (_, n) => valores[Number(n) - 1] || `{{${n}}}`);
}

export function WaTemplatePicker({ onChange }) {
  const [templates, setTemplates] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [valores, setValores] = useState([]);

  useEffect(() => {
    setCarregando(true);
    getTemplates()
      .then((res) => setTemplates(Array.isArray(res) ? res : res?.itens || res?.data || []))
      .catch((e) => toast.error(e?.message || 'Falha ao carregar templates'))
      .finally(() => setCarregando(false));
  }, []);

  // Ao trocar de template, reinicia os valores das variáveis.
  useEffect(() => {
    const n = selecionado?.variaveis?.length || 0;
    setValores(Array.from({ length: n }, () => ''));
  }, [selecionado]);

  // Publica o template montado + validade para o pai.
  useEffect(() => {
    if (!selecionado) {
      onChange?.({ template: null, valido: false });
      return;
    }
    const parameters = valores.map((text) => ({ type: 'text', text }));
    const components = parameters.length ? [{ type: 'body', parameters }] : [];
    const valido = valores.every((v) => v && v.trim());
    onChange?.({
      template: { name: selecionado.name, language: selecionado.language, components },
      valido,
    });
  }, [selecionado, valores, onChange]);

  const preview = selecionado ? montarPreview(selecionado.bodyPreview, valores) : '';
  const variaveis = selecionado?.variaveis || [];

  return (
    <Stack spacing={2.5}>
      {carregando ? (
        <Stack alignItems="center" sx={{ py: 3 }}>
          <CircularProgress size={24} />
        </Stack>
      ) : (
        <Autocomplete
          options={templates}
          value={selecionado}
          onChange={(_, v) => setSelecionado(v)}
          getOptionLabel={(o) => `${o.name} (${o.language})`}
          isOptionEqualToValue={(o, v) => o.name === v.name && o.language === v.language}
          renderInput={(params) => (
            <TextField {...params} label="Template aprovado" placeholder="Selecione…" />
          )}
          noOptionsText="Nenhum template aprovado"
        />
      )}

      {variaveis.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Variáveis</Typography>
          <Stack spacing={2}>
            {variaveis.map((v, i) => (
              <TextField
                key={i}
                size="small"
                label={`{{${i + 1}}}${v?.exemplo ? ` — ex.: ${v.exemplo}` : ''}`}
                value={valores[i] || ''}
                onChange={(e) =>
                  setValores((prev) => {
                    const next = [...prev];
                    next[i] = e.target.value;
                    return next;
                  })
                }
              />
            ))}
          </Stack>
        </>
      )}

      {selecionado && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            whiteSpace: 'pre-wrap',
            typography: 'body2',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Prévia
          </Typography>
          {preview}
        </Box>
      )}
    </Stack>
  );
}
