'use client';

import { toast } from 'sonner';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate, fToNow, fDateTime } from 'src/utils/format-time';

import {
  baixarAnexo,
  removerAnexo,
  deletarTarefa,
  getTarefaById,
  adicionarAnexo,
  getAnexoBlobUrl,
  reatribuirTarefa,
  abrirAnexoInline,
  removerComentario,
  getHistoricoTarefa,
  adicionarComentario,
  alterarStatusTarefa,
  alternarChecklistItem,
} from 'src/actions/tarefas';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Lightbox } from 'src/components/lightbox';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { MentionText, MentionInput, getMentionedUserIds } from 'src/components/mention';

import { PopViewDialog } from 'src/sections/pops/pop-view-dialog';

import { useAuthContext } from 'src/auth/hooks';

import { AnexoImagem } from './anexo-imagem';
import {
  isGestor,
  setorNome,
  statusColor,
  statusLabel,
  clienteLabel,
  prioridadeColor,
  prioridadeLabel,
  transicoesPermitidas,
} from './utils';

// ----------------------------------------------------------------------

const MAX_ANEXO_BYTES = 20 * 1024 * 1024; // 20MB

// Linhas de referência a anexos dentro do texto do comentário (ex.: "📎 print.png").
const REF_PREFIX = '📎 ';

const EXT_IMAGEM = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'avif'];

/** True quando o anexo é uma imagem (por contentType ou extensão do nome). */
function ehImagem(anexo) {
  if (!anexo) return false;
  if (anexo.contentType?.startsWith('image/')) return true;
  const ext = (anexo.nomeArquivo || '').split('.').pop()?.toLowerCase();
  return EXT_IMAGEM.includes(ext);
}

/**
 * Separa o corpo do comentário das linhas de referência a anexos e casa cada
 * referência com o anexo correspondente da tarefa (por nome do arquivo).
 */
function parseComentario(texto = '', anexos = []) {
  const linhas = texto.split('\n');
  const corpo = [];
  const refs = [];
  linhas.forEach((l) => {
    if (l.startsWith(REF_PREFIX)) {
      const nome = l.slice(REF_PREFIX.length).trim();
      const anexo = anexos.find((a) => a.nomeArquivo === nome);
      refs.push(anexo || { nomeArquivo: nome });
    } else {
      corpo.push(l);
    }
  });
  return { corpo: corpo.join('\n').trim(), refs };
}

function Linha({ label, children }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 110 }}>
        {label}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

/**
 * Drawer de detalhes da tarefa: status, comentários, anexos, reatribuição e histórico.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {() => void} props.onClose
 * @param {string}   props.tarefaId
 * @param {Array}    props.usuarios     internos p/ reatribuição
 * @param {Array}    props.setores      setores ativos ({ slug, nome }) p/ exibir nomes
 * @param {() => void} props.onChanged  chamado quando algo muda (recarregar lista)
 * @param {() => void} props.onEditar   abre o form de edição (gestores)
 */
export function TarefaDetailsDrawer({
  open,
  onClose,
  tarefaId,
  usuarios = [],
  setores = [],
  onChanged,
  onEditar,
}) {
  const { user } = useAuthContext();
  const role = user?.role;
  const userId = user?.id || user?._id;
  const gestor = isGestor(role);

  const fileInputRef = useRef(null);
  const comentFileInputRef = useRef(null);

  const [tarefa, setTarefa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [novoComentario, setNovoComentario] = useState('');
  const [comentarioArquivos, setComentarioArquivos] = useState([]);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [enviandoAnexo, setEnviandoAnexo] = useState(false);
  const [novoStatus, setNovoStatus] = useState('');
  const [motivoCancel, setMotivoCancel] = useState('');
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [reatribuirPara, setReatribuirPara] = useState(null);
  const [salvandoReatribuir, setSalvandoReatribuir] = useState(false);
  const [historico, setHistorico] = useState(null);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [confirmRemover, setConfirmRemover] = useState({ open: false, tipo: null, id: null });

  // Checklist (composição imutável — só o marcar/desmarcar acontece aqui)
  const [alternandoItemId, setAlternandoItemId] = useState(null);

  // POP vinculado
  const [popOpen, setPopOpen] = useState(false);

  // Preview de imagem (lightbox de 1 slide). Busca o anexo (view) como blob.
  const [preview, setPreview] = useState({ open: false, src: '', nome: '' });

  const abrirPreview = async (anexo) => {
    try {
      const url = await getAnexoBlobUrl(tarefaId, anexo._id, 'view');
      setPreview({ open: true, src: url, nome: anexo.nomeArquivo || 'imagem' });
    } catch (e) {
      toast.error(e?.message || 'Não foi possível abrir a imagem.');
    }
  };

  const fecharPreview = () => {
    if (preview.src) URL.revokeObjectURL(preview.src);
    setPreview({ open: false, src: '', nome: '' });
  };

  const handleBaixarAnexo = async (anexo) => {
    try {
      await baixarAnexo(tarefaId, anexo._id, anexo.nomeArquivo);
    } catch (e) {
      toast.error(e?.message || 'Não foi possível baixar o anexo.');
    }
  };

  const handleVisualizarAnexo = (anexo) => {
    abrirAnexoInline(tarefaId, anexo._id).catch((e) =>
      toast.error(e?.message || 'Não foi possível abrir o anexo.')
    );
  };

  const carregar = useCallback(async () => {
    if (!tarefaId) return;
    setLoading(true);
    try {
      const data = await getTarefaById(tarefaId);
      setTarefa(data);
    } catch (e) {
      toast.error(e?.message || 'Erro ao carregar a tarefa.');
    } finally {
      setLoading(false);
    }
  }, [tarefaId]);

  useEffect(() => {
    if (open && tarefaId) {
      setNovoStatus('');
      setMotivoCancel('');
      setReatribuirPara(null);
      setHistorico(null);
      carregar();
    }
  }, [open, tarefaId, carregar]);

  const notificarMudanca = () => {
    carregar();
    onChanged?.();
  };

  const transicoes = tarefa ? transicoesPermitidas(tarefa.status) : [];

  // --- status ---
  const handleAlterarStatus = async () => {
    if (!novoStatus) return;
    if (novoStatus === 'cancelada' && !motivoCancel.trim()) {
      toast.error('Informe o motivo do cancelamento.');
      return;
    }
    setSalvandoStatus(true);
    try {
      await alterarStatusTarefa(tarefa._id, novoStatus, motivoCancel.trim());
      toast.success('Status atualizado.');
      setNovoStatus('');
      setMotivoCancel('');
      notificarMudanca();
    } catch (e) {
      // A mensagem do backend explica o motivo (ex.: itens obrigatórios pendentes).
      toast.error(e?.response?.data?.message || e?.message || 'Erro ao alterar status.');
    } finally {
      setSalvandoStatus(false);
    }
  };

  // --- checklist ---
  const handleAlternarItem = async (item) => {
    setAlternandoItemId(item._id);
    try {
      await alternarChecklistItem(tarefa._id, item._id, !item.concluido);
      notificarMudanca();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Erro ao atualizar item.');
    } finally {
      setAlternandoItemId(null);
    }
  };

  // --- comentários ---
  const adicionarArquivosComentario = (fileList) => {
    const novos = Array.from(fileList || []).filter((f) => {
      if (f.size > MAX_ANEXO_BYTES) {
        toast.error(`"${f.name}" excede o limite de 20MB.`);
        return false;
      }
      return true;
    });
    if (novos.length) setComentarioArquivos((prev) => [...prev, ...novos]);
  };

  const handleArquivoComentario = (e) => {
    adicionarArquivosComentario(e.target.files);
    e.target.value = '';
  };

  // Ctrl+V de imagem (print): cola direto como anexo do comentário.
  const handleColarComentario = (e) => {
    const itens = e.clipboardData?.items;
    if (!itens) return;
    const imagens = [];
    for (let i = 0; i < itens.length; i += 1) {
      const it = itens[i];
      if (it.kind === 'file' && it.type.startsWith('image/')) {
        const blob = it.getAsFile();
        if (blob) {
          const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
          imagens.push(new File([blob], `print-${Date.now()}-${i}.${ext}`, { type: blob.type }));
        }
      }
    }
    if (imagens.length) {
      e.preventDefault(); // não cola o binário como texto
      adicionarArquivosComentario(imagens);
    }
  };

  const removerArquivoComentario = (idx) =>
    setComentarioArquivos((prev) => prev.filter((_, i) => i !== idx));

  const handleAdicionarComentario = async () => {
    const temTexto = Boolean(novoComentario.trim());
    const arquivos = comentarioArquivos;
    if (!temTexto && arquivos.length === 0) return;

    const mencionados = getMentionedUserIds(novoComentario, usuarios);
    setEnviandoComentario(true);
    try {
      // 1) Sobe cada arquivo como anexo da tarefa (sequencial — um por requisição).
      const enviados = [];
      for (let i = 0; i < arquivos.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await adicionarAnexo(tarefa._id, arquivos[i]);
        enviados.push(arquivos[i].name);
      }

      // 2) Monta o texto com as referências aos anexos enviados.
      const referencias = enviados.map((nome) => `${REF_PREFIX}${nome}`).join('\n');
      const texto = [novoComentario.trim(), referencias].filter(Boolean).join('\n').trim();

      // 3) Publica o comentário.
      await adicionarComentario(tarefa._id, texto, mencionados);

      setNovoComentario('');
      setComentarioArquivos([]);
      const partes = [];
      if (enviados.length) partes.push(`${enviados.length} anexo(s)`);
      if (mencionados.length) partes.push(`${mencionados.length} menção(ões)`);
      toast.success(`Comentário enviado${partes.length ? ` — ${partes.join(', ')}` : ''}.`);
      notificarMudanca();
    } catch (e) {
      toast.error(e?.message || 'Erro ao comentar.');
    } finally {
      setEnviandoComentario(false);
    }
  };

  const podeRemoverComentario = (c) => {
    const autorId = c.autor?._id ?? c.autor;
    return role === 'admin' || String(autorId) === String(userId);
  };

  // --- anexos ---
  const handleSelecionarArquivo = () => fileInputRef.current?.click();

  const handleArquivo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_ANEXO_BYTES) {
      toast.error('Arquivo acima do limite de 20MB.');
      return;
    }
    setEnviandoAnexo(true);
    try {
      await adicionarAnexo(tarefa._id, file);
      toast.success('Anexo enviado.');
      notificarMudanca();
    } catch (e2) {
      toast.error(e2?.message || 'Erro ao enviar anexo.');
    } finally {
      setEnviandoAnexo(false);
    }
  };

  // --- reatribuição ---
  const handleReatribuir = async () => {
    if (!reatribuirPara?._id) return;
    setSalvandoReatribuir(true);
    try {
      await reatribuirTarefa(tarefa._id, reatribuirPara._id);
      toast.success('Tarefa reatribuída.');
      setReatribuirPara(null);
      notificarMudanca();
    } catch (e) {
      toast.error(e?.message || 'Erro ao reatribuir.');
    } finally {
      setSalvandoReatribuir(false);
    }
  };

  // --- histórico ---
  const handleCarregarHistorico = async () => {
    setLoadingHistorico(true);
    try {
      const data = await getHistoricoTarefa(tarefa._id);
      setHistorico(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (e) {
      toast.error(e?.message || 'Erro ao carregar histórico.');
    } finally {
      setLoadingHistorico(false);
    }
  };

  // --- remoção (comentário / anexo / tarefa) ---
  const executarRemocao = async () => {
    const { tipo, id } = confirmRemover;
    setConfirmRemover({ open: false, tipo: null, id: null });
    try {
      if (tipo === 'tarefa') {
        // Exclusão definitiva: fecha o drawer e recarrega a lista (sem re-fetch da tarefa).
        await deletarTarefa(tarefa._id);
        toast.success('Tarefa excluída.');
        onChanged?.();
        onClose();
        return;
      }
      if (tipo === 'comentario') await removerComentario(tarefa._id, id);
      if (tipo === 'anexo') await removerAnexo(tarefa._id, id);
      toast.success('Removido.');
      notificarMudanca();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Erro ao remover.');
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: { xs: 1, sm: 460 } } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2.5, pb: 2 }}
        >
          <Typography variant="h6">Detalhes da tarefa</Typography>
          <Stack direction="row" spacing={1}>
            {gestor && tarefa && (
              <IconButton onClick={() => onEditar?.(tarefa)} title="Editar">
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            )}
            {gestor && tarefa && (
              <IconButton
                color="error"
                title="Excluir tarefa"
                onClick={() => setConfirmRemover({ open: true, tipo: 'tarefa', id: tarefa._id })}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            )}
            <IconButton onClick={onClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </Stack>
        <Divider />

        {loading || !tarefa ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Scrollbar sx={{ flexGrow: 1 }}>
            <Stack spacing={2.5} sx={{ p: 2.5 }}>
              {/* Cabeçalho */}
              <Stack spacing={1}>
                <Typography variant="subtitle1">{tarefa.titulo}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Label variant="soft" color={statusColor(tarefa.status)}>
                    {statusLabel(tarefa.status)}
                  </Label>
                  <Label variant="soft" color={prioridadeColor(tarefa.prioridade)}>
                    {prioridadeLabel(tarefa.prioridade)}
                  </Label>
                  {tarefa.atrasada && (
                    <Label variant="soft" color="error">
                      Atrasada
                    </Label>
                  )}
                </Stack>
              </Stack>

              {tarefa.descricao && (
                <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                  {tarefa.descricao}
                </Typography>
              )}

              <Stack spacing={1.5}>
                <Linha label="Responsável">
                  <Typography variant="body2">
                    {tarefa.responsavel?.name || tarefa.responsavel?.email || '-'}
                  </Typography>
                </Linha>
                <Linha label="Cliente">
                  <Typography variant="body2">{clienteLabel(tarefa.cliente)}</Typography>
                </Linha>
                <Linha label="Setores">
                  {tarefa.setores?.length ? (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {tarefa.setores.map((s) => (
                        <Label key={s} variant="soft" color="default">
                          {setorNome(s, setores)}
                        </Label>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      —
                    </Typography>
                  )}
                </Linha>
                <Linha label="Prazo">
                  <Typography variant="body2">{fDate(tarefa.prazo)}</Typography>
                </Linha>
                {tarefa.competencia && (
                  <Linha label="Competência">
                    <Typography variant="body2">{tarefa.competencia}</Typography>
                  </Linha>
                )}
                {tarefa.status === 'cancelada' && tarefa.motivoCancelamento && (
                  <Linha label="Motivo">
                    <Typography variant="body2">{tarefa.motivoCancelamento}</Typography>
                  </Linha>
                )}
                {tarefa.pop && (
                  <Linha label="POP">
                    <Button
                      size="small"
                      variant="soft"
                      color="info"
                      startIcon={<Iconify icon="solar:document-text-bold" />}
                      onClick={() => setPopOpen(true)}
                    >
                      {tarefa.pop.titulo || 'Ver procedimento'}
                    </Button>
                  </Linha>
                )}
              </Stack>

              <Divider />

              {/* Checklist */}
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2">
                    Checklist ({(tarefa.checklist || []).filter((i) => i.concluido).length}/
                    {tarefa.checklist?.length || 0})
                  </Typography>
                </Stack>

                {(tarefa.checklist || []).length > 0 && (
                  <LinearProgress
                    variant="determinate"
                    color={
                      tarefa.checklist.every((i) => i.concluido) ? 'success' : 'primary'
                    }
                    value={
                      (tarefa.checklist.filter((i) => i.concluido).length /
                        tarefa.checklist.length) *
                      100
                    }
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                )}

                {(tarefa.checklist || []).length === 0 && (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Esta tarefa não possui checklist. Os passos são definidos na criação da
                    tarefa ou no template recorrente.
                  </Typography>
                )}

                {[...(tarefa.checklist || [])]
                  .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
                  .map((item) => (
                    <Stack
                      key={item._id}
                      direction="row"
                      alignItems="flex-start"
                      spacing={0.5}
                      sx={{ p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'background.neutral' } }}
                    >
                      <Checkbox
                        size="small"
                        checked={Boolean(item.concluido)}
                        disabled={alternandoItemId === item._id}
                        onChange={() => handleAlternarItem(item)}
                        sx={{ mt: -0.5 }}
                      />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                          <Typography
                            variant="body2"
                            sx={{
                              ...(item.concluido && {
                                color: 'text.disabled',
                                textDecoration: 'line-through',
                              }),
                            }}
                          >
                            {item.titulo}
                          </Typography>
                          {item.obrigatorio && (
                            <Label variant="soft" color="warning" sx={{ height: 18 }}>
                              Obrigatório
                            </Label>
                          )}
                        </Stack>
                        {item.descricao && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}
                          >
                            {item.descricao}
                          </Typography>
                        )}
                        {item.concluido && (item.concluidoPor?.name || item.dataConclusao) && (
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', color: 'text.disabled' }}
                          >
                            {[item.concluidoPor?.name, fDateTime(item.dataConclusao)]
                              .filter(Boolean)
                              .join(' • ')}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  ))}
              </Stack>

              <Divider />

              {/* Alterar status */}
              {transicoes.length > 0 ? (
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">Alterar status</Typography>
                  <TextField
                    select
                    size="small"
                    label="Novo status"
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value)}
                    fullWidth
                  >
                    {transicoes.map((s) => (
                      <MenuItem key={s} value={s}>
                        {statusLabel(s)}
                      </MenuItem>
                    ))}
                  </TextField>
                  {novoStatus === 'cancelada' && (
                    <TextField
                      size="small"
                      label="Motivo do cancelamento"
                      value={motivoCancel}
                      onChange={(e) => setMotivoCancel(e.target.value)}
                      required
                      fullWidth
                      multiline
                      rows={2}
                    />
                  )}
                  <LoadingButton
                    variant="contained"
                    size="small"
                    loading={salvandoStatus}
                    disabled={!novoStatus}
                    onClick={handleAlterarStatus}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Aplicar
                  </LoadingButton>
                </Stack>
              ) : (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Tarefa em estado terminal — não há transições de status disponíveis.
                </Typography>
              )}

              {/* Reatribuir (gestores) */}
              {gestor && (
                <>
                  <Divider />
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Reatribuir</Typography>
                    <Autocomplete
                      size="small"
                      options={usuarios}
                      value={reatribuirPara}
                      getOptionLabel={(o) => o?.name || o?.email || ''}
                      isOptionEqualToValue={(o, v) => o._id === v._id}
                      onChange={(_, value) => setReatribuirPara(value)}
                      renderInput={(params) => <TextField {...params} label="Novo responsável" />}
                    />
                    <LoadingButton
                      variant="outlined"
                      size="small"
                      loading={salvandoReatribuir}
                      disabled={!reatribuirPara}
                      onClick={handleReatribuir}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Reatribuir
                    </LoadingButton>
                  </Stack>
                </>
              )}

              <Divider />

              {/* Anexos */}
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2">
                    Anexos ({tarefa.anexos?.length || 0})
                  </Typography>
                  <LoadingButton
                    size="small"
                    startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                    loading={enviandoAnexo}
                    onClick={handleSelecionarArquivo}
                  >
                    Enviar
                  </LoadingButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={handleArquivo}
                  />
                </Stack>
                {(tarefa.anexos || []).map((a) => {
                  const img = ehImagem(a);
                  return (
                    <Stack
                      key={a._id}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}
                    >
                      {img ? (
                        <AnexoImagem
                          tarefaId={tarefa._id}
                          anexo={a}
                          tipo="thumbnail"
                          onClick={() => abrirPreview(a)}
                          sx={{
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            objectFit: 'cover',
                            borderRadius: 0.75,
                            cursor: 'zoom-in',
                          }}
                        />
                      ) : (
                        <Iconify icon="solar:paperclip-bold" width={18} />
                      )}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {a.nomeArquivo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {fDateTime(a.dataEnvio)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        title="Visualizar"
                        onClick={() => (img ? abrirPreview(a) : handleVisualizarAnexo(a))}
                      >
                        <Iconify icon="solar:eye-bold" width={18} />
                      </IconButton>
                      <IconButton size="small" title="Baixar" onClick={() => handleBaixarAnexo(a)}>
                        <Iconify icon="eva:download-fill" width={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setConfirmRemover({ open: true, tipo: 'anexo', id: a._id })}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </Stack>
                  );
                })}
              </Stack>

              <Divider />

              {/* Comentários */}
              <Stack spacing={2}>
                <Typography variant="subtitle2">
                  Comentários ({tarefa.comentarios?.length || 0})
                </Typography>

                {(tarefa.comentarios || []).length === 0 && (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Nenhum comentário ainda. Use @ para mencionar e notificar alguém.
                  </Typography>
                )}

                {(tarefa.comentarios || []).map((c) => {
                  const autorNome = c.autor?.name || c.autor?.email || 'Usuário';
                  const { corpo, refs } = parseComentario(c.texto, tarefa.anexos);
                  return (
                    <Stack key={c._id} direction="row" spacing={1.5} alignItems="flex-start">
                      <Avatar src={c.autor?.avatarUrl} sx={{ width: 34, height: 34, fontSize: 14 }}>
                        {autorNome.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box
                        sx={{
                          flexGrow: 1,
                          minWidth: 0,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'background.neutral',
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography variant="subtitle2">{autorNome}</Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              {fToNow(c.dataComentario)}
                            </Typography>
                            {podeRemoverComentario(c) && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  setConfirmRemover({ open: true, tipo: 'comentario', id: c._id })
                                }
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                              </IconButton>
                            )}
                          </Stack>
                        </Stack>
                        {corpo && (
                          <Typography
                            variant="body2"
                            component="div"
                            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                          >
                            <MentionText text={corpo} />
                          </Typography>
                        )}

                        {refs.length > 0 && (
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mt: corpo ? 1 : 0 }}
                          >
                            {refs.map((a, i) => {
                              if (a._id && ehImagem(a)) {
                                return (
                                  <AnexoImagem
                                    key={a._id}
                                    tarefaId={tarefa._id}
                                    anexo={a}
                                    tipo="thumbnail"
                                    onClick={() => abrirPreview(a)}
                                    sx={{
                                      width: 88,
                                      height: 88,
                                      objectFit: 'cover',
                                      borderRadius: 1,
                                      cursor: 'zoom-in',
                                      border: (theme) => `solid 1px ${theme.vars.palette.divider}`,
                                    }}
                                  />
                                );
                              }
                              return (
                                <Chip
                                  key={a._id || i}
                                  size="small"
                                  variant="outlined"
                                  icon={<Iconify icon="solar:paperclip-bold" width={14} />}
                                  label={a.nomeArquivo}
                                  clickable={Boolean(a._id)}
                                  onClick={a._id ? () => handleBaixarAnexo(a) : undefined}
                                />
                              );
                            })}
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                  );
                })}

                <Stack spacing={1}>
                  {comentarioArquivos.length > 0 && (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {comentarioArquivos.map((f, i) => (
                        <Chip
                          key={i}
                          size="small"
                          variant="outlined"
                          icon={<Iconify icon="solar:paperclip-bold" width={14} />}
                          label={f.name}
                          onDelete={() => removerArquivoComentario(i)}
                        />
                      ))}
                    </Stack>
                  )}

                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <IconButton
                      title="Anexar arquivo"
                      onClick={() => comentFileInputRef.current?.click()}
                      sx={{ height: 40 }}
                    >
                      <Iconify icon="eva:attach-2-fill" />
                    </IconButton>
                    <input
                      ref={comentFileInputRef}
                      type="file"
                      hidden
                      multiple
                      onChange={handleArquivoComentario}
                    />

                    <MentionInput
                      value={novoComentario}
                      onChange={setNovoComentario}
                      users={usuarios}
                      size="small"
                      placeholder="Comente... @ menciona, Ctrl+V cola print"
                      fullWidth
                      maxRows={4}
                      onPaste={handleColarComentario}
                    />

                    <LoadingButton
                      variant="contained"
                      size="small"
                      loading={enviandoComentario}
                      disabled={!novoComentario.trim() && comentarioArquivos.length === 0}
                      onClick={handleAdicionarComentario}
                      sx={{ minWidth: 48, height: 40 }}
                    >
                      <Iconify icon="eva:paper-plane-fill" />
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Stack>

              {/* Histórico (gestores) */}
              {gestor && (
                <>
                  <Divider />
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2">Histórico</Typography>
                      <Button
                        size="small"
                        onClick={handleCarregarHistorico}
                        disabled={loadingHistorico}
                      >
                        {historico ? 'Recarregar' : 'Carregar'}
                      </Button>
                    </Stack>
                    {loadingHistorico && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={20} />
                      </Box>
                    )}
                    {historico && historico.length === 0 && (
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Sem registros de auditoria.
                      </Typography>
                    )}
                    {(historico || []).map((h, idx) => (
                      <Stack
                        key={h._id || idx}
                        spacing={0.25}
                        sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {h.acao || h.action || h.tipo || 'Alteração'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {fDateTime(h.createdAt || h.data || h.dataHora)}
                          {h.usuario?.name ? ` • ${h.usuario.name}` : ''}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
            </Stack>
          </Scrollbar>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmRemover.open}
        onClose={() => setConfirmRemover({ open: false, tipo: null, id: null })}
        title={confirmRemover.tipo === 'tarefa' ? 'Excluir tarefa?' : 'Remover?'}
        content={
          {
            tarefa:
              'A exclusão é permanente: comentários, anexos e checklist da tarefa serão perdidos.',
            anexo: 'Confirma a remoção do anexo?',
            comentario: 'Confirma a remoção do comentário?',
          }[confirmRemover.tipo] || 'Confirma a remoção?'
        }
        action={
          <Button variant="contained" color="error" onClick={executarRemocao}>
            {confirmRemover.tipo === 'tarefa' ? 'Excluir' : 'Remover'}
          </Button>
        }
      />

      <PopViewDialog
        open={popOpen}
        onClose={() => setPopOpen(false)}
        popId={tarefa?.pop?._id}
      />

      <Lightbox
        slides={
          preview.src
            ? [{ src: preview.src, download: { url: preview.src, filename: preview.nome } }]
            : []
        }
        open={preview.open}
        close={fecharPreview}
        index={0}
        disableThumbnails
        disableDownload={false}
      />
    </>
  );
}
