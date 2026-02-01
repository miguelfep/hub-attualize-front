'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { usePixPendentes, aprovarPix, rejeitarPix } from 'src/actions/recompensas';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { RejeitarPixDialog } from './rejeitar-pix-dialog';

// ----------------------------------------------------------------------

export function PixPendentesView() {
  const { pixPendentes, isLoading, mutate } = usePixPendentes();
  const [rejeitarDialogOpen, setRejeitarDialogOpen] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [confirmAprovarOpen, setConfirmAprovarOpen] = useState(false);

  const handleAprovar = async (transacaoId) => {
    try {
      await aprovarPix(transacaoId);
      toast.success('PIX aprovado com sucesso!');
      mutate();
    } catch (error) {
      console.error('Erro ao aprovar PIX:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao aprovar PIX';
      toast.error(errorMessage);
    }
  };

  const handleRejeitar = (transacao) => {
    setTransacaoSelecionada(transacao);
    setRejeitarDialogOpen(true);
  };

  const handleRejeitarConfirm = async (motivo) => {
    if (!transacaoSelecionada) return;

    try {
      await rejeitarPix(transacaoSelecionada._id, motivo);
      toast.success('PIX rejeitado com sucesso!');
      mutate();
      setRejeitarDialogOpen(false);
      setTransacaoSelecionada(null);
    } catch (error) {
      console.error('Erro ao rejeitar PIX:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao rejeitar PIX';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Chave PIX</TableCell>
                  <TableCell>Data Solicitação</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : pixPendentes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <EmptyContent
                        title="Nenhum PIX pendente"
                        description="Não há solicitações de PIX aguardando aprovação"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  pixPendentes.map((pix) => (
                    <TableRow key={pix._id}>
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2">
                            {pix.cliente?.nome || pix.cliente?.razaoSocial || '-'}
                          </Typography>
                          {pix.cliente?.email && (
                            <Typography variant="caption" color="text.secondary">
                              {pix.cliente.email}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" color="success.main">
                          {fCurrency(pix.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {pix.chavePix || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {pix.dataSolicitacao
                          ? fDate(pix.dataSolicitacao, 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<Iconify icon="solar:check-circle-bold" />}
                            onClick={() => setConfirmAprovarOpen(pix._id)}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Iconify icon="solar:close-circle-bold" />}
                            onClick={() => handleRejeitar(pix)}
                          >
                            Rejeitar
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={!!confirmAprovarOpen}
        onClose={() => setConfirmAprovarOpen(false)}
        title="Aprovar PIX"
        content="Tem certeza que deseja aprovar esta solicitação de PIX?"
        action={
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              handleAprovar(confirmAprovarOpen);
              setConfirmAprovarOpen(false);
            }}
          >
            Aprovar
          </Button>
        }
      />

      <RejeitarPixDialog
        open={rejeitarDialogOpen}
        onClose={() => {
          setRejeitarDialogOpen(false);
          setTransacaoSelecionada(null);
        }}
        onConfirm={handleRejeitarConfirm}
      />
    </>
  );
}
