import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import {
  getConhecimento,
  criarConhecimento,
  buscarConhecimento,
  removerConhecimento,
  atualizarConhecimento,
  reindexarConhecimento,
} from 'src/actions/whatsapp';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------
// Base de conhecimento PESQUISÁVEL do bot (RAG): os itens não entram inteiros
// no prompt — a cada mensagem o bot busca só os trechos relevantes. Pode
// crescer à vontade sem aumentar o custo por conversa.
// ----------------------------------------------------------------------

function ItemConhecimento({ item, onSalvo, onRemovido }) {
  const [titulo, setTitulo] = useState(item.titulo);
  const [conteudo, setConteudo] = useState(item.conteudo);
  const [salvando, setSalvando] = useState(false);

  const alterado = titulo !== item.titulo || conteudo !== item.conteudo;

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const doc = await atualizarConhecimento(item._id, { titulo, conteudo });
      onSalvo(doc);
      toast.success('Item atualizado.');
    } catch (error) {
      toast.error(error?.message || 'Falha ao salvar o item.');
    } finally {
      setSalvando(false);
    }
  };

  const handleAtivo = async (ativo) => {
    try {
      const doc = await atualizarConhecimento(item._id, { ativo });
      onSalvo(doc);
    } catch (error) {
      toast.error(error?.message || 'Falha ao alterar o item.');
    }
  };

  const handleRemover = async () => {
    try {
      await removerConhecimento(item._id);
      onRemovido(item._id);
      toast.success('Item removido.');
    } catch (error) {
      toast.error(error?.message || 'Falha ao remover.');
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral', opacity: item.ativo ? 1 : 0.6 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            fullWidth
            size="small"
            label="Título / pergunta"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <Switch
            checked={item.ativo}
            onChange={(e) => handleAtivo(e.target.checked)}
            title={item.ativo ? 'Ativo (o bot usa)' : 'Pausado'}
          />
          <IconButton color="error" onClick={handleRemover} title="Remover">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>

        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          maxRows={12}
          label="Conteúdo"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />

        {alterado && (
          <LoadingButton
            size="small"
            variant="contained"
            loading={salvando}
            onClick={handleSalvar}
            sx={{ alignSelf: 'flex-start' }}
          >
            Salvar alterações
          </LoadingButton>
        )}
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function WaBotConhecimento() {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');

  const [novoAberto, setNovoAberto] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoConteudo, setNovoConteudo] = useState('');
  const [criando, setCriando] = useState(false);

  const [reindexando, setReindexando] = useState(false);
  const [testeQ, setTesteQ] = useState('');
  const [testeResultados, setTesteResultados] = useState(null);
  const [testando, setTestando] = useState(false);

  const carregar = useCallback(async (q = '') => {
    setCarregando(true);
    try {
      const res = await getConhecimento({ q, limit: 100 });
      setItens(res?.itens || []);
      setTotal(res?.total || 0);
    } catch (error) {
      toast.error(error?.message || 'Falha ao carregar a base de conhecimento.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleCriar = async () => {
    if (!novoTitulo.trim() || !novoConteudo.trim()) return;
    setCriando(true);
    try {
      const doc = await criarConhecimento({ titulo: novoTitulo.trim(), conteudo: novoConteudo.trim() });
      setItens((prev) => [doc, ...prev]);
      setTotal((t) => t + 1);
      setNovoTitulo('');
      setNovoConteudo('');
      setNovoAberto(false);
      toast.success('Item adicionado à base.');
    } catch (error) {
      toast.error(error?.message || 'Falha ao adicionar.');
    } finally {
      setCriando(false);
    }
  };

  const handleTestar = async () => {
    if (!testeQ.trim()) return;
    setTestando(true);
    try {
      const res = await buscarConhecimento(testeQ.trim());
      setTesteResultados(res?.itens || []);
    } catch (error) {
      toast.error(error?.message || 'Falha na busca.');
    } finally {
      setTestando(false);
    }
  };

  const handleReindexar = async () => {
    setReindexando(true);
    try {
      const res = await reindexarConhecimento();
      if (!res.total) toast.success('Todos os itens já estão indexados.');
      else if (res.falhas)
        toast.error(
          `${res.processados} reindexados, ${res.falhas} falharam${res.ultimoErro ? ` — ${res.ultimoErro}` : ''}`,
          { duration: 10000 }
        );
      else toast.success(`${res.processados} itens reindexados.`);
    } catch (error) {
      toast.error(error?.message || 'Falha na re-indexação.');
    } finally {
      setReindexando(false);
    }
  };

  const atualizarLocal = (doc) => {
    if (!doc) return;
    setItens((prev) => prev.map((i) => (i._id === doc._id ? doc : i)));
  };

  const removerLocal = (id) => {
    setItens((prev) => prev.filter((i) => i._id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle2">
          Base de conhecimento pesquisável {total ? `(${total} itens)` : ''}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          O bot busca aqui os trechos relevantes para cada pergunta — a base pode crescer à
          vontade sem aumentar o custo por conversa. Cadastre FAQs, políticas, prazos e
          procedimentos.
        </Typography>
      </Box>

      {/* Teste de busca (a mesma que o bot usa) */}
      <Card variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="Testar busca (como o bot pesquisa)"
            value={testeQ}
            onChange={(e) => setTesteQ(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleTestar()}
            placeholder="Ex.: qual o prazo para enviar as notas?"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTestar} disabled={testando}>
                    {testando ? <CircularProgress size={18} /> : <Iconify icon="eva:search-fill" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {testeResultados && (
            <Stack spacing={1}>
              {testeResultados.length ? (
                testeResultados.map((r) => (
                  <Stack key={r.id} direction="row" spacing={1} alignItems="center">
                    {r.relevancia > 0 && (
                      <Chip size="small" label={`${Math.round(r.relevancia * 100)}%`} />
                    )}
                    <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                      <b>{r.titulo}</b> — {r.conteudo}
                    </Typography>
                  </Stack>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: 'warning.main' }}>
                  Nada encontrado — o bot não teria material para essa pergunta.
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Filtro + novo item */}
      <Stack direction="row" spacing={1.5}>
        <TextField
          size="small"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && carregar(filtro)}
          placeholder="Filtrar itens…"
          sx={{ flexGrow: 1 }}
        />
        <LoadingButton
          variant="outlined"
          loading={reindexando}
          startIcon={<Iconify icon="solar:refresh-bold" />}
          onClick={handleReindexar}
          title="Re-gera os embeddings de itens pendentes ou indexados por modelo antigo"
        >
          Re-indexar
        </LoadingButton>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setNovoAberto((v) => !v)}
        >
          Novo item
        </Button>
      </Stack>

      {novoAberto && (
        <Card variant="outlined" sx={{ p: 2, borderColor: 'primary.main' }}>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Título / pergunta"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              placeholder="Ex.: Prazo de envio das notas fiscais"
            />
            <TextField
              size="small"
              multiline
              minRows={3}
              label="Conteúdo"
              value={novoConteudo}
              onChange={(e) => setNovoConteudo(e.target.value)}
              placeholder="O conteúdo completo que o bot pode usar para responder."
            />
            <Stack direction="row" spacing={1}>
              <LoadingButton
                variant="contained"
                loading={criando}
                disabled={!novoTitulo.trim() || !novoConteudo.trim()}
                onClick={handleCriar}
              >
                Adicionar
              </LoadingButton>
              <Button color="inherit" onClick={() => setNovoAberto(false)}>
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Lista */}
      {carregando ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={24} />
        </Stack>
      ) : itens.length ? (
        <Stack spacing={1.5}>
          {itens.map((item) => (
            <ItemConhecimento
              key={item._id}
              item={item}
              onSalvo={atualizarLocal}
              onRemovido={removerLocal}
            />
          ))}
        </Stack>
      ) : (
        <EmptyContent
          title="Base vazia"
          description="Adicione FAQs, políticas e procedimentos para o bot consultar."
          sx={{ py: 4 }}
        />
      )}
    </Stack>
  );
}
