import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency } from 'src/utils/format-number';

import {
  sincronizarNotas,
  salvarFaturamento,
  sugerirFaturamento,
  useGetFaturamentos,
} from 'src/actions/fator-r';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

import {
  apiErrMsg,
  origemColor,
  competenciaAtual,
  competenciaLabel,
  ORIGEM_FATURAMENTO_LABELS,
} from '../utils';

const TABLE_HEAD = [
  { id: 'competencia', label: 'Competência', width: 130 },
  { id: 'receita', label: 'Receita bruta' },
  { id: 'externa', label: 'Mercado externo' },
  { id: 'notas', label: 'Soma das notas' },
  { id: 'origem', label: 'Origem', width: 180 },
  { id: 'acoes', label: '', width: 60 },
];

export function FatorRFaturamento({ clienteId, onChanged }) {
  const { faturamentos, faturamentosLoading, refetchFaturamentos } = useGetFaturamentos(clienteId);
  const [editando, setEditando] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);

  const recarregar = useCallback(() => {
    refetchFaturamentos();
    onChanged?.();
  }, [refetchFaturamentos, onChanged]);

  const handleSincronizar = useCallback(async () => {
    setSincronizando(true);
    try {
      const { ano } = competenciaAtual();
      const res = await sincronizarNotas(clienteId, {
        anoInicio: ano - 2,
        mesInicio: 1,
        anoFim: ano,
        mesFim: 12,
      });
      toast.success(
        `${res.atualizados} competência(s) atualizada(s) · ${res.pulados} preservada(s) por serem manuais ou declaradas`
      );
      recarregar();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Falha ao sincronizar com as notas'));
    } finally {
      setSincronizando(false);
    }
  }, [clienteId, recarregar]);

  return (
    <Card>
      <CardHeader
        title="Faturamento"
        subheader="O valor declarado no PGDAS-D prevalece sobre o manual e sobre a soma das notas"
        action={
          <Stack direction="row" spacing={1}>
            <LoadingButton
              size="small"
              variant="outlined"
              loading={sincronizando}
              startIcon={<Iconify icon="eva:sync-fill" />}
              onClick={handleSincronizar}
            >
              Sincronizar notas
            </LoadingButton>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => setEditando({ ...competenciaAtual(), novo: true })}
            >
              Lançar
            </Button>
          </Stack>
        }
      />

      <Scrollbar>
        <TableContainer sx={{ overflow: 'auto' }}>
          <Table size="small" sx={{ minWidth: 820 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />
            <TableBody>
              {faturamentos.map((fat) => (
                <TableRow key={`${fat.ano}-${fat.mes}`} hover>
                  <TableCell>{competenciaLabel(fat.ano, fat.mes)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2">{fCurrency(fat.receitaBruta)}</Typography>
                      {fat.divergencia && (
                        <Tooltip title="O valor lançado difere da soma das notas da competência">
                          <Iconify
                            icon="solar:danger-triangle-bold"
                            sx={{ color: 'warning.main' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{fCurrency(fat.receitaBrutaExterna)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {fat.receitaBrutaNotas == null ? '—' : fCurrency(fat.receitaBrutaNotas)}
                  </TableCell>
                  <TableCell>
                    <Label variant="soft" color={origemColor(fat.origemValor)}>
                      {ORIGEM_FATURAMENTO_LABELS[fat.origemValor] ?? fat.origemValor}
                    </Label>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setEditando({ ...fat })}>
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!faturamentosLoading && !faturamentos.length && (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD.length}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Nenhuma competência de faturamento lançada.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      {editando && (
        <FaturamentoDialog
          clienteId={clienteId}
          faturamento={editando}
          onClose={() => setEditando(null)}
          onSaved={recarregar}
        />
      )}
    </Card>
  );
}

function FaturamentoDialog({ clienteId, faturamento, onClose, onSaved }) {
  const [ano, setAno] = useState(faturamento.ano);
  const [mes, setMes] = useState(faturamento.mes);
  const [receitaBruta, setReceitaBruta] = useState(faturamento.receitaBruta ?? 0);
  const [receitaBrutaExterna, setReceitaExterna] = useState(faturamento.receitaBrutaExterna ?? 0);
  const [salvando, setSalvando] = useState(false);
  const [sugestao, setSugestao] = useState(null);

  const handleSugerir = async () => {
    try {
      const res = await sugerirFaturamento(clienteId, ano, mes);
      setSugestao(res.sugestao);
    } catch (error) {
      toast.error(apiErrMsg(error, 'Falha ao buscar sugestão'));
    }
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await salvarFaturamento(clienteId, ano, mes, {
        receitaBruta,
        receitaBrutaExterna,
        origemValor: 'manual',
      });
      toast.success('Faturamento salvo');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Falha ao salvar faturamento'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitle>
        {faturamento.novo
          ? 'Lançar faturamento'
          : `Faturamento de ${competenciaLabel(faturamento.ano, faturamento.mes)}`}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {faturamento.novo && (
            <Stack direction="row" spacing={2}>
              <TextField
                type="number"
                label="Ano"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                fullWidth
              />
              <TextField
                type="number"
                label="Mês"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                inputProps={{ min: 1, max: 12 }}
                fullWidth
              />
            </Stack>
          )}

          <TextField
            type="number"
            label="Receita bruta (mercado interno)"
            value={receitaBruta}
            onChange={(e) => setReceitaBruta(Number(e.target.value) || 0)}
            inputProps={{ min: 0, step: '0.01' }}
            fullWidth
          />

          <TextField
            type="number"
            label="Receita de mercado externo"
            value={receitaBrutaExterna}
            onChange={(e) => setReceitaExterna(Number(e.target.value) || 0)}
            inputProps={{ min: 0, step: '0.01' }}
            fullWidth
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Button size="small" onClick={handleSugerir}>
              Somar notas da competência
            </Button>
            {sugestao && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {sugestao.qtdNotas} nota(s) · {fCurrency(sugestao.totalNotas)}
                <Button size="small" onClick={() => setReceitaBruta(sugestao.totalNotas)}>
                  usar
                </Button>
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={salvando} onClick={handleSalvar}>
          Salvar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
