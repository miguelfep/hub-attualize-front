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
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { getCanais, deletarCanal, testarConfig } from 'src/actions/whatsapp';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { WaCanalDialog } from './wa-canal-dialog';

// ----------------------------------------------------------------------

export function WaCanaisTab() {
  const [canais, setCanais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluir, setExcluir] = useState(null);
  const [testandoId, setTestandoId] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setCanais(await getCanais());
    } catch (error) {
      toast.error(error?.message || 'Falha ao carregar canais.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setDialogOpen(true);
  };

  const abrirEdicao = (canal) => {
    setEditando(canal);
    setDialogOpen(true);
  };

  const handleExcluir = async () => {
    if (!excluir?._id) return;
    try {
      await deletarCanal(excluir._id);
      toast.success('Canal removido.');
      setExcluir(null);
      carregar();
    } catch (error) {
      toast.error(error?.message || 'Falha ao remover o canal.');
    }
  };

  const handleTestar = async (canal) => {
    setTestandoId(canal._id);
    try {
      const res = await testarConfig({ canalId: canal._id });
      if (res?.ok === false) toast.error(res?.message || 'Conexão falhou.');
      else toast.success('Conexão OK com a Meta.');
    } catch (error) {
      toast.error(error?.message || 'Falha ao testar a conexão.');
    } finally {
      setTestandoId(null);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6">Canais / Números</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Cada canal é um número do WhatsApp com seu próprio Phone Number ID, WABA e token.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={abrirNovo}
        >
          Novo canal
        </Button>
      </Stack>

      <Card variant="outlined">
        {carregando ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={26} />
          </Stack>
        ) : canais.length ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Phone Number ID</TableCell>
                  <TableCell>WABA ID</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {canais.map((canal) => (
                  <TableRow key={canal._id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {canal.nome}
                        {canal.padrao && (
                          <Label color="info" variant="soft">
                            padrão
                          </Label>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{canal.phoneDisplay || '—'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                      {canal.phoneNumberId || '—'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                      {canal.wabaId || '—'}
                    </TableCell>
                    <TableCell align="center">
                      <Label color={canal.ativo ? 'success' : 'default'} variant="soft">
                        {canal.ativo ? 'ativo' : 'inativo'}
                      </Label>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleTestar(canal)}
                        disabled={testandoId === canal._id}
                        title="Testar conexão"
                      >
                        {testandoId === canal._id ? (
                          <CircularProgress size={18} />
                        ) : (
                          <Iconify icon="solar:test-tube-bold" />
                        )}
                      </IconButton>
                      <IconButton onClick={() => abrirEdicao(canal)} title="Editar">
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setExcluir(canal)}
                        title="Excluir"
                      >
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
            title="Nenhum canal cadastrado"
            description="Cadastre o primeiro número do WhatsApp para começar."
            sx={{ py: 6 }}
          />
        )}
      </Card>

      <WaCanalDialog
        open={dialogOpen}
        canal={editando}
        onClose={() => setDialogOpen(false)}
        onSalvo={() => {
          setDialogOpen(false);
          carregar();
        }}
      />

      <ConfirmDialog
        open={!!excluir}
        onClose={() => setExcluir(null)}
        title="Remover canal"
        content={`Tem certeza que deseja remover o canal "${excluir?.nome}"?`}
        action={
          <Button variant="contained" color="error" onClick={handleExcluir}>
            Remover
          </Button>
        }
      />
    </>
  );
}
