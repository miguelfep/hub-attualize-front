'use client';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { useGetAllClientes } from 'src/actions/clientes';
import {
  updateGuiaFiscal,
  deleteGuiaFiscal,
  useGetGuiasFiscais,
  visualizarGuiaFiscal,
} from 'src/actions/guias-fiscais';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import {
  TIPOS_POR_CATEGORIA,
  getCompetenciaSugerida,
  CATEGORIA_LABELS_REVISAO,
  STATUS_PROCESSAMENTO_REVISAO,
} from '../utils';

// ----------------------------------------------------------------------
// Fila de revisão manual: documentos que o parser + IA não classificaram.
// Enquanto em revisão, o cliente NÃO vê o documento no portal. Ao concluir
// (status "processado"), o backend resolve a pasta (Fiscal → ano → mês),
// move o arquivo, renomeia (ex.: DAS-2026-06.pdf) e notifica o cliente.
// ----------------------------------------------------------------------

const COMPETENCIA_REGEX = /^(0[1-9]|1[0-2])\/\d{4}$/;

function nomeCliente(clienteRef) {
  if (!clienteRef) return 'Sem cliente — selecione ao classificar';
  if (typeof clienteRef !== 'object') return '-';
  return clienteRef.nome || clienteRef.razaoSocial || clienteRef.cnpj || '-';
}

function labelClienteOption(cliente) {
  const nome = cliente?.name || cliente?.razaoSocial || cliente?.nome || 'Cliente';
  return cliente?.cnpj ? `${nome} — ${cliente.cnpj}` : nome;
}

function apiErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    (typeof error === 'string' ? error : error?.message) ||
    fallback
  );
}

// ----------------------------------------------------------------------

function RevisaoClassificarDialog({ guia, open, onClose, onDone }) {
  const [categoria, setCategoria] = useState('');
  const [tipoGuia, setTipoGuia] = useState('');
  const [competencia, setCompetencia] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [clienteSel, setClienteSel] = useState(null);
  const [saving, setSaving] = useState(false);

  const semCliente = !!guia && !guia.clienteId;
  const { data: clientes, isLoading: loadingClientes } = useGetAllClientes({ status: true });

  // Pré-preenche com as sugestões do backend quando o dialog abre para outra guia
  const [lastGuiaId, setLastGuiaId] = useState(null);
  if (guia && guia._id !== lastGuiaId) {
    setLastGuiaId(guia._id);
    setCategoria(
      guia.categoria && guia.categoria !== 'ARQUIVO_GERAL' ? guia.categoria : ''
    );
    setTipoGuia(
      guia.tipoGuia && guia.tipoGuia !== 'NAO_IDENTIFICADO' ? guia.tipoGuia : ''
    );
    setCompetencia(getCompetenciaSugerida(guia));
    setDataVencimento(
      guia.dataVencimento ? String(guia.dataVencimento).slice(0, 10) : ''
    );
    setClienteSel(null);
  }

  const tiposDisponiveis = TIPOS_POR_CATEGORIA[categoria] || [];
  const precisaCompetencia = categoria === 'GUIA_FISCAL' || categoria === 'GUIA_DP';
  const ehExtrato = tipoGuia === 'EXTRATO_PGDAS';
  const competenciaValida = !competencia || COMPETENCIA_REGEX.test(competencia.trim());

  const podeSalvar =
    !!categoria &&
    !!tipoGuia &&
    (!semCliente || !!clienteSel) &&
    (!precisaCompetencia || (competencia && competenciaValida)) &&
    !saving;

  const handleSalvar = async () => {
    try {
      setSaving(true);
      const payload = {
        categoria,
        tipoGuia,
        statusProcessamento: 'processado',
      };
      if (semCliente && clienteSel) {
        payload.clienteId = clienteSel._id || clienteSel.id;
      }
      if (competencia?.trim()) {
        payload.competencia = competencia.trim();
      }
      // Extrato PGDAS é declaratório — nunca envia vencimento
      if (dataVencimento && !ehExtrato) {
        payload.dataVencimento = dataVencimento;
      }

      await updateGuiaFiscal(guia._id, payload);
      toast.success(
        'Documento classificado e publicado para o cliente na pasta correta.'
      );
      onDone();
      onClose();
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error(
          apiErrorMessage(
            error,
            'Já existe guia deste tipo para esta competência neste cliente.'
          )
        );
      } else {
        toast.error(apiErrorMessage(error, 'Não foi possível concluir a revisão.'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!guia) return null;

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={saving ? undefined : onClose}>
      <DialogTitle>Classificar documento</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{guia.nomeArquivo || 'Documento'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Cliente: {nomeCliente(guia.clienteId)}
            </Typography>
            {guia.dadosExtraidos?.valor ? (
              <Typography variant="body2" color="text.secondary">
                Valor extraído: {fCurrency(guia.dadosExtraidos.valor)}
              </Typography>
            ) : null}
          </Stack>

          {guia.erros?.length ? (
            <Alert severity="warning">
              {guia.erros.map((erro, i) => (
                <Typography key={i} variant="body2">
                  • {erro}
                </Typography>
              ))}
            </Alert>
          ) : null}

          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:eye-bold" />}
            onClick={() => visualizarGuiaFiscal(guia._id, guia.nomeArquivo)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Visualizar PDF
          </Button>

          {semCliente && (
            <Autocomplete
              size="small"
              options={Array.isArray(clientes) ? clientes : []}
              loading={loadingClientes}
              value={clienteSel}
              onChange={(_, value) => setClienteSel(value)}
              getOptionLabel={labelClienteOption}
              isOptionEqualToValue={(opt, val) =>
                (opt._id || opt.id) === (val._id || val.id)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente *"
                  helperText={
                    guia.dadosExtraidos?.cnpjsEncontrados?.length
                      ? `CNPJs encontrados no PDF: ${guia.dadosExtraidos.cnpjsEncontrados.join(', ')}`
                      : 'O sistema não identificou o cliente — selecione manualmente'
                  }
                />
              )}
            />
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Categoria</InputLabel>
            <Select
              value={categoria}
              label="Categoria"
              onChange={(e) => {
                setCategoria(e.target.value);
                setTipoGuia('');
              }}
            >
              {Object.entries(CATEGORIA_LABELS_REVISAO).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={!categoria}>
            <InputLabel>Tipo</InputLabel>
            <Select value={tipoGuia} label="Tipo" onChange={(e) => setTipoGuia(e.target.value)}>
              {tiposDisponiveis.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label={`Competência (MM/AAAA)${precisaCompetencia ? ' *' : ''}`}
            placeholder="06/2026"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            error={!!competencia && !competenciaValida}
            helperText={
              competencia && !competenciaValida
                ? 'Formato inválido — use MM/AAAA (ex.: 06/2026)'
                : 'Define a pasta de destino (ex.: Fiscal → 2026 → Junho)'
            }
          />

          {!ehExtrato && (
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Data de vencimento"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSalvar}
          disabled={!podeSalvar}
          startIcon={saving ? <CircularProgress size={18} /> : <Iconify icon="eva:checkmark-fill" />}
        >
          {saving ? 'Publicando...' : 'Classificar e publicar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export function GuiaFiscalRevisaoPanel() {
  const { data, isLoading, mutate } = useGetGuiasFiscais({
    statusProcessamento: STATUS_PROCESSAMENTO_REVISAO,
    limit: 100,
  });

  const guias = useMemo(() => data?.guias || [], [data?.guias]);

  const [guiaSelecionada, setGuiaSelecionada] = useState(null);
  const [guiaParaExcluir, setGuiaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const handleExcluir = useCallback(async () => {
    if (!guiaParaExcluir) return;
    try {
      setExcluindo(true);
      await deleteGuiaFiscal(guiaParaExcluir._id);
      toast.success('Documento excluído.');
      setGuiaParaExcluir(null);
      mutate();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Não foi possível excluir o documento.'));
    } finally {
      setExcluindo(false);
    }
  }, [guiaParaExcluir, mutate]);

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">Revisão manual</Typography>
          {guias.length > 0 && <Label color="warning">{guias.length}</Label>}
        </Stack>
        <Tooltip title="Atualizar lista">
          <IconButton onClick={() => mutate()} size="small">
            <Iconify icon="eva:refresh-fill" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Documentos enviados que o sistema não conseguiu classificar com segurança. Eles{' '}
        <strong>não aparecem para o cliente</strong> até serem classificados aqui.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : guias.length === 0 ? (
        <Alert severity="success" variant="outlined">
          Nenhum documento aguardando revisão. 🎉
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {guias.map((guia) => (
            <Card key={guia._id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                spacing={2}
              >
                <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap title={guia.nomeArquivo}>
                    {guia.nomeArquivo || 'Documento'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {nomeCliente(guia.clienteId)}
                    {guia.createdAt ? ` • enviado em ${fDate(guia.createdAt)}` : ''}
                    {getCompetenciaSugerida(guia)
                      ? ` • competência sugerida: ${getCompetenciaSugerida(guia)}`
                      : ''}
                  </Typography>
                  {guia.erros?.length ? (
                    <Typography variant="caption" color="warning.main">
                      {guia.erros[0]}
                    </Typography>
                  ) : null}
                </Stack>

                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                  <Tooltip title="Visualizar PDF">
                    <IconButton
                      size="small"
                      onClick={() => visualizarGuiaFiscal(guia._id, guia.nomeArquivo)}
                    >
                      <Iconify icon="solar:eye-bold" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setGuiaParaExcluir(guia)}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="solar:checklist-minimalistic-bold" />}
                    onClick={() => setGuiaSelecionada(guia)}
                  >
                    Classificar
                  </Button>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <RevisaoClassificarDialog
        guia={guiaSelecionada}
        open={!!guiaSelecionada}
        onClose={() => setGuiaSelecionada(null)}
        onDone={() => mutate()}
      />

      <ConfirmDialog
        open={!!guiaParaExcluir}
        onClose={() => setGuiaParaExcluir(null)}
        title="Excluir documento"
        content={`Excluir "${guiaParaExcluir?.nomeArquivo || 'documento'}"? O arquivo será removido permanentemente.`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleExcluir}
            disabled={excluindo}
            startIcon={excluindo ? <CircularProgress size={18} /> : null}
          >
            Excluir
          </Button>
        }
      />
    </Card>
  );
}
