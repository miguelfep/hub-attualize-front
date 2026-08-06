import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';

import { fCurrency } from 'src/utils/format-number';

import { getServiceItens } from 'src/actions/serviceItens';

// ----------------------------------------------------------------------
// Modo vendas do bot: com ele ligado, o agente atende NÃO-clientes como SDR
// (qualifica, registra lead no CRM e transfere ao comercial) e pode gerar
// orçamento com link de pagamento APENAS para os serviços selecionados aqui
// (preço vem do catálogo — o bot nunca inventa nem negocia valores).
// ----------------------------------------------------------------------

const idOf = (v) => (v && typeof v === 'object' ? v._id || v.id : v);

export function WaBotVendas({ value, onChange }) {
  const [servicosOpts, setServicosOpts] = useState([]);

  useEffect(() => {
    getServiceItens()
      .then((res) => setServicosOpts(Array.isArray(res) ? res : []))
      .catch(() => setServicosOpts([]));
  }, []);

  const habilitado = Boolean(value?.habilitado);
  const selecionados = (value?.servicos || [])
    .map((id) => servicosOpts.find((s) => String(idOf(s)) === String(id)))
    .filter(Boolean);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2">Vendas e SDR</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Com o modo vendas ligado, o bot também atende quem ainda não é cliente: qualifica
          (nome, e-mail, segmento), registra o lead no CRM e transfere ao comercial — e pode gerar
          orçamento com link de pagamento para os serviços liberados abaixo.
        </Typography>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={habilitado}
            onChange={(e) => onChange({ ...value, habilitado: e.target.checked })}
          />
        }
        label={
          <Typography variant="subtitle2">
            {habilitado ? 'Modo vendas ligado' : 'Modo vendas desligado'}
          </Typography>
        }
      />

      {habilitado && (
        <>
          <Autocomplete
            multiple
            options={servicosOpts}
            value={selecionados}
            onChange={(_, v) => onChange({ ...value, servicos: v.map((s) => String(idOf(s))) })}
            getOptionLabel={(o) => (o?.preco != null ? `${o.titulo} — ${fCurrency(o.preco)}` : o?.titulo || '')}
            isOptionEqualToValue={(o, v) => idOf(o) === idOf(v)}
            renderTags={(tags, getTagProps) =>
              tags.map((tag, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={idOf(tag)}
                  size="small"
                  label={`${tag.titulo} — ${fCurrency(tag.preco)}`}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Serviços que o bot pode orçar"
                placeholder="Selecione do catálogo…"
                helperText="Ex.: certificado digital, alteração contratual. O preço cobrado é o do catálogo de serviços."
              />
            )}
          />

          {!selecionados.length && (
            <Alert severity="info" variant="outlined">
              Sem serviços selecionados o bot não gera orçamentos — ele apenas qualifica o lead e
              transfere para o comercial.
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
}
