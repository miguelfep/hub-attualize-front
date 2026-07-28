import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency } from 'src/utils/format-number';

import {
  salvarFolha,
  removerFolha,
  useGetFolhas,
  importarFolhaGuias,
  importarFolhaPgdas,
  importarExtratoPgdas,
  importarFolhaCadastro,
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
  ORIGEM_FOLHA_LABELS,
} from '../utils';

const TABLE_HEAD = [
  { id: 'competencia', label: 'Competência', width: 130 },
  { id: 'proLabore', label: 'Pró-labore' },
  { id: 'salarios', label: 'Salários' },
  { id: 'decimoTerceiro', label: '13º' },
  { id: 'encargos', label: 'Encargos' },
  { id: 'fgts', label: 'FGTS' },
  { id: 'total', label: 'Total', width: 130 },
  { id: 'origem', label: 'Origem', width: 180 },
  { id: 'acoes', label: '', width: 60 },
];

const CAMPOS = [
  { name: 'proLabore', label: 'Pró-labore' },
  { name: 'salarios', label: 'Salários' },
  { name: 'decimoTerceiro', label: '13º salário' },
  { name: 'encargosCpp', label: 'Encargos (INSS patronal)' },
  { name: 'fgts', label: 'FGTS' },
  { name: 'outros', label: 'Outras verbas' },
];

export function FatorRFolha({ clienteId, onChanged }) {
  const { folhas, folhasLoading, refetchFolhas } = useGetFolhas(clienteId);
  const [editando, setEditando] = useState(null);
  const [menuImport, setMenuImport] = useState(null);
  const [importando, setImportando] = useState(false);
  const inputExtrato = useRef(null);

  const recarregar = useCallback(() => {
    refetchFolhas();
    onChanged?.();
  }, [refetchFolhas, onChanged]);

  const handleImport = useCallback(
    async (fonte) => {
      setMenuImport(null);
      setImportando(true);
      try {
        const { ano } = competenciaAtual();
        // Janela de 24 meses cobre com folga os 12 que o Fator R usa.
        const periodo = { anoInicio: ano - 2, mesInicio: 1, anoFim: ano, mesFim: 12 };

        let res;
        if (fonte === 'pgdas') res = await importarFolhaPgdas(clienteId, ano);
        else if (fonte === 'guias') res = await importarFolhaGuias(clienteId, periodo);
        else res = await importarFolhaCadastro(clienteId, periodo);

        const partes = [`${res.gravados ?? 0} competência(s) gravada(s)`];
        if (res.pulados) partes.push(`${res.pulados} preservada(s) por já ter fonte mais forte`);
        if (res.indisponiveis?.length) partes.push(`${res.indisponiveis.length} sem dado na fonte`);
        toast.success(partes.join(' · '));

        if (res.semSalario?.length) {
          toast.warning(
            `${res.semSalario.length} funcionário(s) sem salário cadastrado ficaram de fora: ${res.semSalario.join(', ')}`
          );
        }
        recarregar();
      } catch (error) {
        toast.error(apiErrMsg(error, 'Falha ao importar folha'));
      } finally {
        setImportando(false);
      }
    },
    [clienteId, recarregar]
  );

  const handleExtrato = useCallback(
    async (event) => {
      const arquivo = event.target.files?.[0];
      // Limpa o input para permitir reenviar o mesmo arquivo depois.
      event.target.value = '';
      if (!arquivo) return;

      setImportando(true);
      try {
        const res = await importarExtratoPgdas(clienteId, arquivo);
        const partes = [
          `${res.folha?.gravados ?? 0} competência(s) de folha`,
          `${res.faturamento?.gravados ?? 0} de faturamento`,
        ];
        if (res.folha?.pulados) partes.push(`${res.folha.pulados} preservada(s)`);
        toast.success(partes.join(' · '));

        if (res.fatorRDeclarado != null) {
          toast.info(
            `Extrato informa Fator R de ${String(res.fatorRDeclarado).replace('.', ',')} — use para conferir o cálculo.`
          );
        }
        recarregar();
      } catch (error) {
        toast.error(apiErrMsg(error, 'Falha ao importar o extrato'));
      } finally {
        setImportando(false);
      }
    },
    [clienteId, recarregar]
  );

  return (
    <Card>
      <input
        ref={inputExtrato}
        type="file"
        accept="application/pdf"
        hidden
        onChange={handleExtrato}
      />
      <CardHeader
        title="Folha de pagamento"
        subheader="Uma fonte automática nunca sobrescreve um lançamento manual"
        action={
          <Stack direction="row" spacing={1}>
            <LoadingButton
              size="small"
              variant="outlined"
              loading={importando}
              startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
              onClick={(e) => setMenuImport(e.currentTarget)}
            >
              Importar
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

      <Menu anchorEl={menuImport} open={!!menuImport} onClose={() => setMenuImport(null)}>
        <MenuItem
          onClick={() => {
            setMenuImport(null);
            inputExtrato.current?.click();
          }}
        >
          Do extrato do PGDAS-D (PDF)
        </MenuItem>
        <MenuItem onClick={() => handleImport('pgdas')}>Do PGDAS-D declarado (API)</MenuItem>
        <MenuItem onClick={() => handleImport('guias')}>Das guias de INSS e FGTS</MenuItem>
        <MenuItem onClick={() => handleImport('cadastro')}>Do cadastro de salários</MenuItem>
      </Menu>

      <Scrollbar>
        <TableContainer sx={{ overflow: 'auto' }}>
          <Table size="small" sx={{ minWidth: 960 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />
            <TableBody>
              {folhas.map((folha) => (
                <TableRow key={`${folha.ano}-${folha.mes}`} hover>
                  <TableCell>{competenciaLabel(folha.ano, folha.mes)}</TableCell>
                  <TableCell>{fCurrency(folha.proLabore)}</TableCell>
                  <TableCell>{fCurrency(folha.salarios)}</TableCell>
                  <TableCell>{fCurrency(folha.decimoTerceiro)}</TableCell>
                  <TableCell>{fCurrency(folha.encargosCpp)}</TableCell>
                  <TableCell>{fCurrency(folha.fgts)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2">{fCurrency(folha.totalFolha)}</Typography>
                      {folha.anomalia && (
                        <Tooltip title={folha.anomaliaMotivo || 'Valor destoa do histórico'}>
                          <Iconify
                            icon="solar:danger-triangle-bold"
                            sx={{ color: 'warning.main' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Label variant="soft" color={origemColor(folha.origem)}>
                      {ORIGEM_FOLHA_LABELS[folha.origem] ?? folha.origem}
                    </Label>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setEditando({ ...folha })}>
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!folhasLoading && !folhas.length && (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD.length}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Nenhuma competência de folha lançada.
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Sem folha o Fator R não pode ser calculado. Use Importar ou lance
                        manualmente.
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
        <FolhaDialog
          clienteId={clienteId}
          folha={editando}
          onClose={() => setEditando(null)}
          onSaved={recarregar}
        />
      )}
    </Card>
  );
}

function FolhaDialog({ clienteId, folha, onClose, onSaved }) {
  const [valores, setValores] = useState(() =>
    CAMPOS.reduce((acc, campo) => ({ ...acc, [campo.name]: folha[campo.name] ?? 0 }), {})
  );
  const [ano, setAno] = useState(folha.ano);
  const [mes, setMes] = useState(folha.mes);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  const total = CAMPOS.reduce((soma, c) => soma + (Number(valores[c.name]) || 0), 0);

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await salvarFolha(clienteId, ano, mes, valores);
      toast.success('Folha salva. O lançamento manual prevalece sobre as fontes automáticas.');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Falha ao salvar folha'));
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async () => {
    setRemovendo(true);
    try {
      await removerFolha(clienteId, ano, mes);
      toast.success('Competência removida');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Falha ao remover competência'));
    } finally {
      setRemovendo(false);
    }
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitle>
        {folha.novo ? 'Lançar folha' : `Folha de ${competenciaLabel(folha.ano, folha.mes)}`}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {folha.anomalia && (
            <Alert severity="warning">{folha.anomaliaMotivo || 'Valor destoa do histórico.'}</Alert>
          )}

          {folha.novo && (
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

          {CAMPOS.map((campo) => (
            <TextField
              key={campo.name}
              type="number"
              label={campo.label}
              value={valores[campo.name]}
              onChange={(e) =>
                setValores((v) => ({ ...v, [campo.name]: Number(e.target.value) || 0 }))
              }
              inputProps={{ min: 0, step: '0.01' }}
              fullWidth
            />
          ))}

          <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
            <Typography variant="subtitle2">Total da competência</Typography>
            <Typography variant="subtitle1">{fCurrency(total)}</Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        {!folha.novo && (
          <LoadingButton color="error" loading={removendo} onClick={handleRemover}>
            Remover
          </LoadingButton>
        )}
        <Box sx={{ flexGrow: 1 }} />
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
