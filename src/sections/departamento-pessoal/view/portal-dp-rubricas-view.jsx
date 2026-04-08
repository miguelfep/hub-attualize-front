'use client';

import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { usePortalRubricas, portalPutRubricas, usePortalFuncionario } from 'src/actions/departamento-pessoal';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { CODIGOS_RUBRICA_SUGERIDOS } from 'src/types/departamento-pessoal';

import { useDpPortalContext } from '../dp-shared';

// ----------------------------------------------------------------------

const MESES = [
  { v: 1, l: 'Janeiro' },
  { v: 2, l: 'Fevereiro' },
  { v: 3, l: 'Março' },
  { v: 4, l: 'Abril' },
  { v: 5, l: 'Maio' },
  { v: 6, l: 'Junho' },
  { v: 7, l: 'Julho' },
  { v: 8, l: 'Agosto' },
  { v: 9, l: 'Setembro' },
  { v: 10, l: 'Outubro' },
  { v: 11, l: 'Novembro' },
  { v: 12, l: 'Dezembro' },
];

function errMsg(err) {
  if (typeof err === 'string') return err;
  return err?.message || 'Erro';
}

const emptyItem = () => ({
  codigo: 'FALTA',
  descricao: '',
  quantidade: '',
  valor: '',
  observacao: '',
});

export function PortalDpRubricasView({ funcionarioId }) {
  const { enabled, loadingEmpresas, clienteProprietarioId } = useDpPortalContext();
  const { data: f, isLoading: loadingF } = usePortalFuncionario(clienteProprietarioId, funcionarioId);
  const { data: todas, isLoading: loadingR, mutate } = usePortalRubricas(clienteProprietarioId, funcionarioId);

  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [itens, setItens] = useState([emptyItem()]);
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [saving, setSaving] = useState(false);

  const docMes = useMemo(
    () => (Array.isArray(todas) ? todas.find((r) => r.ano === ano && r.mes === mes) : null),
    [todas, ano, mes]
  );

  useEffect(() => {
    if (!docMes) {
      setItens([emptyItem()]);
      setObservacoesGerais('');
      return;
    }
    const arr = docMes.itens?.length ? docMes.itens : [emptyItem()];
    setItens(
      arr.map((i) => ({
        codigo: i.codigo || 'OUTRO',
        descricao: i.descricao || '',
        quantidade: i.quantidade != null ? String(i.quantidade) : '',
        valor: i.valor != null ? String(i.valor) : '',
        observacao: i.observacao || '',
      }))
    );
    setObservacoesGerais(docMes.observacoesGerais || '');
  }, [docMes, ano, mes]);

  const podeEditar = f?.statusCadastro === 'aprovado' && f?.statusVinculo === 'ativo';

  const handleAddLinha = () => setItens((prev) => [...prev, emptyItem()]);

  const handleRemoveLinha = (idx) => {
    setItens((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const handleChangeItem = (idx, field, value) => {
    setItens((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSalvar = async () => {
    if (!clienteProprietarioId || !funcionarioId) return;
    setSaving(true);
    try {
      const payload = {
        ano,
        mes,
        observacoesGerais: observacoesGerais.trim() || undefined,
        itens: itens.map((i) => ({
          codigo: i.codigo,
          descricao: i.descricao?.trim() || undefined,
          quantidade: i.quantidade === '' ? undefined : Number(String(i.quantidade).replace(',', '.')),
          valor: i.valor === '' ? undefined : Number(String(i.valor).replace(',', '.')),
          observacao: i.observacao?.trim() || undefined,
        })),
      };
      await portalPutRubricas(clienteProprietarioId, funcionarioId, payload);
      toast.success('Rubricas salvas para a competência.');
      mutate();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  if (loadingEmpresas || !clienteProprietarioId) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  if (!enabled) {
    return <Alert severity="info">Módulo não habilitado.</Alert>;
  }

  if (loadingF || !f) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  if (!podeEditar) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Rubricas só podem ser lançadas para funcionário com cadastro aprovado e vínculo ativo.
        <Button component={RouterLink} href={paths.cliente.departamentoPessoal.details(funcionarioId)} sx={{ ml: 1 }}>
          Voltar ao funcionário
        </Button>
      </Alert>
    );
  }

  const anosOpts = [...new Set([now.getFullYear(), now.getFullYear() - 1, ...(todas || []).map((r) => r.ano)])].sort(
    (a, b) => b - a
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Rubricas — {f.nome}</Typography>
        <Button component={RouterLink} href={paths.cliente.departamentoPessoal.details(funcionarioId)} variant="outlined">
          Voltar
        </Button>
      </Stack>

      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            select
            label="Ano"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 120 }}
          >
            {anosOpts.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Mês"
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 160 }}
          >
            {MESES.map((m) => (
              <MenuItem key={m.v} value={m.v}>
                {m.l}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <TableContainer>
          <Scrollbar>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell width={120}>Qtd</TableCell>
                  <TableCell width={120}>Valor</TableCell>
                  <TableCell>Obs.</TableCell>
                  <TableCell width={56} />
                </TableRow>
              </TableHead>
              <TableBody>
                {itens.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={row.codigo}
                        onChange={(e) => handleChangeItem(idx, 'codigo', e.target.value)}
                      >
                        {CODIGOS_RUBRICA_SUGERIDOS.map((c) => (
                          <MenuItem key={c.value} value={c.value}>
                            {c.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={row.descricao}
                        onChange={(e) => handleChangeItem(idx, 'descricao', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.quantidade}
                        onChange={(e) => handleChangeItem(idx, 'quantidade', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.valor}
                        onChange={(e) => handleChangeItem(idx, 'valor', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={row.observacao}
                        onChange={(e) => handleChangeItem(idx, 'observacao', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleRemoveLinha(idx)} disabled={itens.length <= 1}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <Button startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleAddLinha} sx={{ mt: 1 }}>
          Linha
        </Button>

        <TextField
          label="Observações gerais da competência"
          fullWidth
          multiline
          rows={2}
          value={observacoesGerais}
          onChange={(e) => setObservacoesGerais(e.target.value)}
          sx={{ mt: 2 }}
        />

        <LoadingButton variant="contained" loading={saving || loadingR} onClick={handleSalvar} sx={{ mt: 2 }}>
          Salvar competência
        </LoadingButton>
      </Card>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Histórico (demais meses)
      </Typography>
      <Card variant="outlined" sx={{ p: 2 }}>
        {!todas?.length && <Typography variant="body2">Nenhuma competência registrada ainda.</Typography>}
        {!!todas?.length && (
          <Stack spacing={0.5}>
            {todas.map((r) => (
              <Typography key={r._id} variant="body2">
                {String(r.mes).padStart(2, '0')}/{r.ano} — {r.itens?.length || 0} item(ns)
              </Typography>
            ))}
          </Stack>
        )}
      </Card>
    </Box>
  );
}
