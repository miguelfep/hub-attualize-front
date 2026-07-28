import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';

import { definirHabilitacao, useGetClientesHabilitacao } from 'src/actions/apuracao';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { AtividadePgdasSelect } from './atividade-pgdas-select';

const apiErrMsg = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const REGIMES = [
  { value: '', label: 'Todos os regimes' },
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'presumido', label: 'Lucro Presumido' },
  { value: 'real', label: 'Lucro Real' },
];

/**
 * Habilita ou desabilita a apuração para vários clientes de uma vez.
 *
 * Existe porque habilitar um por um, abrindo o cadastro de cada cliente, não
 * escala numa carteira grande — e a habilitação é pré-requisito para o cliente
 * sequer aparecer na fila do fechamento.
 */
export function ApuracaoHabilitacaoDialog({ open, onClose, onSaved }) {
  const [busca, setBusca] = useState('');
  const [regime, setRegime] = useState('');
  const [somenteNaoHabilitados, setSomenteNaoHabilitados] = useState(true);
  const [somenteFatorR, setSomenteFatorR] = useState(false);
  const [selecionados, setSelecionados] = useState([]);
  const [idAtividade, setIdAtividade] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const { clientes, total, clientesLoading, refetchClientes } = useGetClientesHabilitacao({
    busca: busca || undefined,
    regime: regime || undefined,
    somenteNaoHabilitados: somenteNaoHabilitados || undefined,
    somenteFatorR: somenteFatorR || undefined,
    limit: 200,
  });

  const alternar = useCallback((clienteId) => {
    setSelecionados((atual) =>
      atual.includes(clienteId)
        ? atual.filter((id) => id !== clienteId)
        : [...atual, clienteId]
    );
  }, []);

  const alternarTodos = useCallback(() => {
    setSelecionados((atual) =>
      atual.length === clientes.length ? [] : clientes.map((c) => c.clienteId)
    );
  }, [clientes]);

  const aplicar = useCallback(
    async (ativa) => {
      setSalvando(true);
      try {
        const res = await definirHabilitacao({
          clienteIds: selecionados,
          ativa,
          idAtividade: ativa && idAtividade ? Number(idAtividade) : undefined,
        });
        toast.success(
          `${res.atualizados} cliente(s) ${ativa ? 'habilitado(s)' : 'desabilitado(s)'}.`
        );
        setSelecionados([]);
        refetchClientes();
        onSaved?.();
      } catch (error) {
        toast.error(apiErrMsg(error, 'Falha ao alterar habilitação'));
      } finally {
        setSalvando(false);
      }
    },
    [selecionados, idAtividade, refetchClientes, onSaved]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Habilitar clientes na apuração</DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Só clientes habilitados entram na fila do fechamento. Desabilitar não apaga apurações já
          feitas — apenas tira o cliente da fila.
        </Alert>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar por nome ou CNPJ"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Regime</InputLabel>
            <Select value={regime} label="Regime" onChange={(e) => setRegime(e.target.value)}>
              {REGIMES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
          <FormControlLabel
            control={
              <Switch
                checked={somenteNaoHabilitados}
                onChange={(e) => setSomenteNaoHabilitados(e.target.checked)}
              />
            }
            label="Só não habilitados"
          />
          <FormControlLabel
            control={
              <Switch checked={somenteFatorR} onChange={(e) => setSomenteFatorR(e.target.checked)} />
            }
            label="Só sujeitos ao Fator R"
          />
        </Stack>

        <Box sx={{ mb: 2, maxWidth: 560 }}>
          <AtividadePgdasSelect
            value={idAtividade}
            onChange={setIdAtividade}
            helperText="Aplicada a todos os selecionados ao habilitar. Sem ela, a apuração fica bloqueada por pendência."
          />
        </Box>

        <Scrollbar sx={{ maxHeight: 360 }}>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableBody>
                {clientesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={3}>
                        <Skeleton variant="text" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={clientes.length > 0 && selecionados.length === clientes.length}
                          indeterminate={
                            selecionados.length > 0 && selecionados.length < clientes.length
                          }
                          onChange={alternarTodos}
                        />
                      </TableCell>
                      <TableCell colSpan={2}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {clientes.length} de {total} cliente(s) · {selecionados.length}{' '}
                          selecionado(s)
                        </Typography>
                      </TableCell>
                    </TableRow>

                    {clientes.map((c) => (
                      <TableRow key={c.clienteId} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selecionados.includes(c.clienteId)}
                            onChange={() => alternar(c.clienteId)}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2">{c.nome}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {c.cnpj || '—'} · {c.regimeTributario || 'sem regime'}
                              {c.tributacao?.length ? ` · ${c.tributacao.join(', ')}` : ''}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {c.sujeitoAoFatorR && (
                              <Chip size="small" variant="soft" label="Fator R" color="warning" />
                            )}
                            <Label variant="soft" color={c.habilitada ? 'success' : 'default'}>
                              {c.habilitada ? 'Habilitada' : 'Não habilitada'}
                            </Label>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!clientes.length && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Box sx={{ py: 4, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Nenhum cliente com esses filtros.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Fechar
        </Button>
        <LoadingButton
          color="error"
          loading={salvando}
          disabled={!selecionados.length}
          onClick={() => aplicar(false)}
        >
          Desabilitar
        </LoadingButton>
        <LoadingButton
          variant="contained"
          loading={salvando}
          disabled={!selecionados.length}
          onClick={() => aplicar(true)}
        >
          Habilitar selecionados
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
