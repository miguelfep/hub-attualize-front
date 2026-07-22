import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import {
  getTemplates,
  criarTemplate,
  deletarTemplate,
  sincronizarTemplates,
} from 'src/actions/whatsapp';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { WaTemplateBuilderDialog } from './wa-template-builder-dialog';

// ----------------------------------------------------------------------

const STATUS_COLOR = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
  PAUSED: 'default',
  DISABLED: 'default',
};

const statusColor = (s) => STATUS_COLOR[String(s || '').toUpperCase()] || 'default';

// ----------------------------------------------------------------------

export function WaTemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [excluir, setExcluir] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await getTemplates({ todos: true });
      setTemplates(Array.isArray(res) ? res : res?.itens || res?.data || []);
    } catch (error) {
      toast.error(error?.message || 'Falha ao carregar templates.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSincronizar = async () => {
    setSincronizando(true);
    try {
      await sincronizarTemplates();
      toast.success('Templates sincronizados com a Meta.');
      carregar();
    } catch (error) {
      toast.error(error?.message || 'Falha ao sincronizar.');
    } finally {
      setSincronizando(false);
    }
  };

  const handleCriar = async (payload) => {
    await criarTemplate(payload); // erros tratados no dialog
    toast.success('Template enviado para aprovação da Meta.');
    setBuilderOpen(false);
    carregar();
  };

  const handleExcluir = async () => {
    if (!excluir) return;
    try {
      await deletarTemplate(excluir.name, { language: excluir.language });
      toast.success('Template excluído.');
      setExcluir(null);
      carregar();
    } catch (error) {
      toast.error(error?.message || 'Falha ao excluir.');
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6">Templates (HSM)</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Modelos aprovados pela Meta. Necessários para iniciar conversas e responder fora da
            janela de 24h.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <LoadingButton
            variant="outlined"
            startIcon={<Iconify icon="solar:refresh-bold" />}
            loading={sincronizando}
            onClick={handleSincronizar}
          >
            Sincronizar
          </LoadingButton>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setBuilderOpen(true)}
          >
            Novo template
          </Button>
        </Stack>
      </Stack>

      <Card variant="outlined">
        {carregando ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={26} />
          </Stack>
        ) : templates.length ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Idioma</TableCell>
                  <TableCell>Prévia</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={`${t.name}-${t.language}`} hover>
                    <TableCell sx={{ fontWeight: 'fontWeightMedium' }}>{t.name}</TableCell>
                    <TableCell sx={{ textTransform: 'lowercase' }}>{t.category || '—'}</TableCell>
                    <TableCell>{t.language}</TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                        {t.bodyPreview || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Label color={statusColor(t.status)} variant="soft">
                        {String(t.status || '').toLowerCase() || '—'}
                      </Label>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => setExcluir(t)} title="Excluir">
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyContent
            title="Nenhum template"
            description="Crie um template ou sincronize com a Meta."
            sx={{ py: 6 }}
          />
        )}
      </Card>

      <WaTemplateBuilderDialog
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onCriar={handleCriar}
      />

      <ConfirmDialog
        open={!!excluir}
        onClose={() => setExcluir(null)}
        title="Excluir template"
        content={`Excluir o template "${excluir?.name}" (${excluir?.language})? Isso remove na Meta.`}
        action={
          <Button variant="contained" color="error" onClick={handleExcluir}>
            Excluir
          </Button>
        }
      />
    </>
  );
}
