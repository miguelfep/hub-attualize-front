'use client';

import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { baseUrl } from 'src/utils/axios';

import { getQueueStats } from 'src/actions/queues';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

const INTERVALO_AUTO_REFRESH = 15000; // 15s

// Nome amigável e descrição de cada fila do backend.
const FILAS_INFO = {
  'guias-lote': {
    titulo: 'Lotes de guias (PDF)',
    descricao: 'Processamento assíncrono dos lotes de guias e documentos.',
    icone: 'solar:documents-bold',
  },
  'extrato-upload': {
    titulo: 'Extratos bancários',
    descricao: 'Importação de extratos OFX/PDF/Excel da conciliação.',
    icone: 'solar:card-transfer-bold',
  },
  'danfse-pdf': {
    titulo: 'DANFSe (NFS-e Nacional)',
    descricao: 'Download do PDF das notas no Emissor Nacional (gov.br).',
    icone: 'solar:bill-list-bold',
  },
};

const CONTADORES = [
  { campo: 'active', label: 'Ativos', cor: 'info' },
  { campo: 'waiting', label: 'Aguardando', cor: 'warning' },
  { campo: 'delayed', label: 'Agendados', cor: 'default' },
  { campo: 'completed', label: 'Concluídos', cor: 'success' },
  { campo: 'failed', label: 'Falhas', cor: 'error' },
];

function infoFila(nome) {
  return (
    FILAS_INFO[nome] || {
      titulo: nome,
      descricao: 'Fila BullMQ.',
      icone: 'solar:layers-bold',
    }
  );
}

function FilaCard({ fila }) {
  const info = infoFila(fila.nome);
  const temFalhas = (fila.failed || 0) > 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                display: 'flex',
                borderRadius: 1.5,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: (theme) =>
                  temFalhas ? theme.palette.error.lighter : theme.palette.primary.lighter,
                color: (theme) =>
                  temFalhas ? theme.palette.error.main : theme.palette.primary.main,
              }}
            >
              <Iconify icon={info.icone} width={26} />
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" noWrap>
                  {info.titulo}
                </Typography>
                {fila.pausada && (
                  <Label variant="soft" color="warning">
                    Pausada
                  </Label>
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {info.descricao}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {CONTADORES.map(({ campo, label, cor }) => (
              <Label
                key={campo}
                variant="soft"
                color={campo === 'failed' && !temFalhas ? 'default' : cor}
              >
                {label}: {fila[campo] ?? 0}
              </Label>
            ))}
          </Stack>

          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Fila: {fila.nome}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

/**
 * Painel de filas BullMQ da página Status do Sistema (admins). Mostra os
 * contadores por fila com auto-refresh e abre o Bull Board completo em nova
 * aba (o token vai na URL e vira cookie escopado no backend).
 */
export function StatusFilas() {
  const [filas, setFilas] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await getQueueStats();
      setFilas(Array.isArray(data) ? data : []);
      setErro('');
    } catch (e) {
      setErro(e?.response?.data?.message || e?.message || 'Erro ao consultar as filas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    const timer = setInterval(carregar, INTERVALO_AUTO_REFRESH);
    return () => clearInterval(timer);
  }, [carregar]);

  const abrirBullBoard = () => {
    const token = Cookies.get(STORAGE_KEY);
    if (!token) {
      toast.error('Sessão expirada — faça login novamente.');
      return;
    }
    window.open(`${baseUrl}queues/ui?token=${encodeURIComponent(token)}`, '_blank');
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap spacing={1}>
        <Typography variant="h6">Filas de processamento (BullMQ)</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:refresh-bold" />}
            onClick={carregar}
            disabled={carregando}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:monitor-bold" />}
            onClick={abrirBullBoard}
          >
            Abrir Bull Board
          </Button>
        </Stack>
      </Stack>

      <Typography variant="caption" sx={{ color: 'text.secondary', mt: -2 }}>
        Atualiza automaticamente a cada {INTERVALO_AUTO_REFRESH / 1000}s. O Bull Board abre em
        nova aba com a visão completa dos jobs (payloads, tentativas, erros e reprocessamento).
      </Typography>

      {erro && <Alert severity="error">{erro}</Alert>}

      {!filas && !erro && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {filas && (
        <Grid container spacing={3}>
          {filas.map((fila) => (
            <Grid key={fila.nome} xs={12} md={4}>
              <FilaCard fila={fila} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
