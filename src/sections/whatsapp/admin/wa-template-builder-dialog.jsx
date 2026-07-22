import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Builder de template (HSM) → POST /wa/templates. Gera o array `components` no
// formato da Graph API da Meta. Cobre os casos comuns: header de texto, corpo
// com variáveis {{1}}…, rodapé e botões (resposta rápida / URL).
// ----------------------------------------------------------------------

const CATEGORIAS = [
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'UTILITY', label: 'Utilidade' },
  { value: 'AUTHENTICATION', label: 'Autenticação' },
];

const IDIOMAS = [
  { value: 'pt_BR', label: 'Português (BR)' },
  { value: 'pt_PT', label: 'Português (PT)' },
  { value: 'en_US', label: 'Inglês (US)' },
  { value: 'es', label: 'Espanhol' },
];

const VAZIO = {
  name: '',
  category: 'UTILITY',
  language: 'pt_BR',
  header: '',
  body: '',
  footer: '',
  buttons: [],
};

/** Normaliza o nome do template (Meta exige minúsculas, dígitos e underscore). */
const normalizarNome = (v) =>
  v.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

/** Extrai o número de variáveis {{n}} de um texto. */
function contarVariaveis(texto = '') {
  const nums = [...texto.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
  return nums.length ? Math.max(...nums) : 0;
}

function montarPreview(texto = '', valores = []) {
  return texto.replace(/\{\{(\d+)\}\}/g, (_, n) => valores[Number(n) - 1] || `{{${n}}}`);
}

// ----------------------------------------------------------------------

export function WaTemplateBuilderDialog({ open, onClose, onCriar }) {
  const [form, setForm] = useState(VAZIO);
  const [exemplos, setExemplos] = useState([]); // exemplos das variáveis do corpo
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(VAZIO);
      setExemplos([]);
    }
  }, [open]);

  const set = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const nVars = useMemo(() => contarVariaveis(form.body), [form.body]);

  // Mantém o vetor de exemplos do tamanho do nº de variáveis.
  useEffect(() => {
    setExemplos((prev) => {
      const next = [...prev];
      next.length = nVars;
      return Array.from(next, (v) => v || '');
    });
  }, [nVars]);

  // Botões
  const addBotao = (tipo) =>
    setForm((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        tipo === 'URL'
          ? { type: 'URL', text: '', url: '' }
          : { type: 'QUICK_REPLY', text: '' },
      ],
    }));

  const setBotao = (i, campo, valor) =>
    setForm((prev) => {
      const buttons = [...prev.buttons];
      buttons[i] = { ...buttons[i], [campo]: valor };
      return { ...prev, buttons };
    });

  const removeBotao = (i) =>
    setForm((prev) => ({ ...prev, buttons: prev.buttons.filter((_, idx) => idx !== i) }));

  // Monta o payload no formato da Meta.
  const montarComponents = useCallback(() => {
    const components = [];

    if (form.header.trim()) {
      const comp = { type: 'HEADER', format: 'TEXT', text: form.header.trim() };
      const hVars = contarVariaveis(form.header);
      if (hVars > 0) comp.example = { header_text: ['exemplo'] };
      components.push(comp);
    }

    const body = { type: 'BODY', text: form.body.trim() };
    if (nVars > 0) body.example = { body_text: [exemplos.map((v) => v || 'exemplo')] };
    components.push(body);

    if (form.footer.trim()) components.push({ type: 'FOOTER', text: form.footer.trim() });

    if (form.buttons.length) {
      components.push({
        type: 'BUTTONS',
        buttons: form.buttons.map((b) =>
          b.type === 'URL'
            ? { type: 'URL', text: b.text.trim(), url: b.url.trim() }
            : { type: 'QUICK_REPLY', text: b.text.trim() }
        ),
      });
    }

    return components;
  }, [form, nVars, exemplos]);

  const handleCriar = useCallback(async () => {
    const name = normalizarNome(form.name);
    if (!name) return toast.error('Informe o nome do template.');
    if (!form.body.trim()) return toast.error('O corpo (body) é obrigatório.');
    if (nVars > 0 && exemplos.some((v) => !v.trim()))
      return toast.error('Preencha um exemplo para cada variável do corpo.');
    if (form.buttons.some((b) => !b.text.trim() || (b.type === 'URL' && !b.url.trim())))
      return toast.error('Preencha o texto (e a URL) de todos os botões.');

    const payload = {
      name,
      category: form.category,
      language: form.language,
      components: montarComponents(),
    };

    setSalvando(true);
    try {
      await onCriar(payload);
    } catch (error) {
      if (error?.status === 409) toast.error('Já existe um template com esse nome/idioma.');
      else toast.error(error?.response?.data?.message || error?.message || 'Falha ao criar o template.');
    } finally {
      setSalvando(false);
    }
    return undefined;
  }, [form, nVars, exemplos, montarComponents, onCriar]);

  const nomeNormalizado = normalizarNome(form.name);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Novo template</DialogTitle>

      <DialogContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ pt: 1 }}>
          {/* Formulário */}
          <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label="Nome"
              value={form.name}
              onChange={set('name')}
              placeholder="boas_vindas"
              helperText={
                nomeNormalizado && nomeNormalizado !== form.name
                  ? `Será salvo como: ${nomeNormalizado}`
                  : 'Minúsculas, números e underscore.'
              }
              required
            />

            <Stack direction="row" spacing={2}>
              <TextField select fullWidth label="Categoria" value={form.category} onChange={set('category')}>
                {CATEGORIAS.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select fullWidth label="Idioma" value={form.language} onChange={set('language')}>
                {IDIOMAS.map((l) => (
                  <MenuItem key={l.value} value={l.value}>
                    {l.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              label="Cabeçalho (opcional)"
              value={form.header}
              onChange={set('header')}
              placeholder="Texto do topo"
            />

            <TextField
              label="Corpo"
              value={form.body}
              onChange={set('body')}
              placeholder="Olá {{1}}, sua solicitação {{2}} foi recebida."
              multiline
              minRows={3}
              required
              helperText="Use {{1}}, {{2}}… para variáveis."
            />

            {nVars > 0 && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Exemplos das variáveis</Typography>
                {Array.from({ length: nVars }, (_, i) => (
                  <TextField
                    key={i}
                    size="small"
                    label={`Exemplo de {{${i + 1}}}`}
                    value={exemplos[i] || ''}
                    onChange={(e) =>
                      setExemplos((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                  />
                ))}
              </Stack>
            )}

            <TextField
              label="Rodapé (opcional)"
              value={form.footer}
              onChange={set('footer')}
              placeholder="Ex.: Attualize Contabilidade"
            />

            <Divider />

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">Botões (opcional)</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<Iconify icon="solar:chat-round-dots-bold" />}
                    onClick={() => addBotao('QUICK_REPLY')}
                  >
                    Resposta rápida
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Iconify icon="solar:link-bold" />}
                    onClick={() => addBotao('URL')}
                  >
                    URL
                  </Button>
                </Stack>
              </Stack>

              {form.buttons.map((b, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    label={b.type === 'URL' ? 'Texto do botão (URL)' : 'Resposta rápida'}
                    value={b.text}
                    onChange={(e) => setBotao(i, 'text', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  {b.type === 'URL' && (
                    <TextField
                      size="small"
                      label="https://…"
                      value={b.url}
                      onChange={(e) => setBotao(i, 'url', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  )}
                  <IconButton color="error" onClick={() => removeBotao(i)}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Stack>

          {/* Prévia */}
          <Box sx={{ width: { xs: 1, md: 300 }, flexShrink: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Prévia
            </Typography>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'background.neutral',
                border: (t) => `solid 1px ${t.vars.palette.divider}`,
              }}
            >
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'common.white', boxShadow: 1 }}>
                {form.header && (
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {montarPreview(form.header, exemplos)}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                  {montarPreview(form.body, exemplos) || 'Corpo da mensagem…'}
                </Typography>
                {form.footer && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled' }}>
                    {form.footer}
                  </Typography>
                )}
              </Box>
              {form.buttons.length > 0 && (
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {form.buttons.map((b, i) => (
                    <Box
                      key={i}
                      sx={{
                        py: 0.75,
                        textAlign: 'center',
                        borderRadius: 1,
                        bgcolor: 'common.white',
                        color: 'info.main',
                        typography: 'button',
                        fontSize: 13,
                        boxShadow: 1,
                      }}
                    >
                      {b.text || (b.type === 'URL' ? 'Botão URL' : 'Resposta')}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" onClick={handleCriar} loading={salvando}>
          Criar e enviar p/ aprovação
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
