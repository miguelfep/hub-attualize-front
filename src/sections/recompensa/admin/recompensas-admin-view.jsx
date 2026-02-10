'use client';

import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRecompensas } from 'src/hooks/use-recompensas';

import { AprovarPixDialog } from './aprovar-pix-dialog';
import { RejeitarPixDialog } from './rejeitar-pix-dialog';
import { PixPendentesTable } from './pix-pendentes-table';

// ----------------------------------------------------------------------

export function RecompensasAdminView() {
  const { 
    pixPendentes, 
    loadingPixPendentes, 
    buscarPixPendentes, 
    aprovar, 
    rejeitar,
  } = useRecompensas();

  const [selectedPix, setSelectedPix] = useState(null);
  const [openAprovarDialog, setOpenAprovarDialog] = useState(false);
  const [openRejeitarDialog, setOpenRejeitarDialog] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    buscarPixPendentes();
  }, [buscarPixPendentes]);

  const handleRefresh = () => {
    buscarPixPendentes();
  };

  const handleAprovarClick = (pix) => {
    setSelectedPix(pix);
    setOpenAprovarDialog(true);
  };

  const handleRejeitarClick = (pix) => {
    setSelectedPix(pix);
    setOpenRejeitarDialog(true);
  };

  const handleAprovarConfirm = async () => {
    try {
      setLoadingAction(true);
      await aprovar(selectedPix._id);
      setOpenAprovarDialog(false);
      setSelectedPix(null);
    } catch (error) {
      console.error('Erro ao aprovar PIX:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRejeitarConfirm = async (motivo) => {
    try {
      setLoadingAction(true);
      await rejeitar(selectedPix._id, motivo);
      setOpenRejeitarDialog(false);
      setSelectedPix(null);
    } catch (error) {
      console.error('Erro ao rejeitar PIX:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack>
          <Typography variant="h4">Gestão de Recompensas</Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as solicitações de PIX dos clientes
          </Typography>
        </Stack>
        
        <Button
          variant="outlined"
          onClick={handleRefresh}
          disabled={loadingPixPendentes}
        >
          Atualizar
        </Button>
      </Stack>

      <Card>
        <Stack sx={{ p: 2 }}>
          <Typography variant="h6">
            Solicitações de PIX Pendentes ({pixPendentes.length})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Analise e aprove ou rejeite as solicitações de pagamento via PIX
          </Typography>
        </Stack>

        <PixPendentesTable
          pixPendentes={pixPendentes}
          loading={loadingPixPendentes}
          onAprovar={handleAprovarClick}
          onRejeitar={handleRejeitarClick}
        />
      </Card>

      <AprovarPixDialog
        open={openAprovarDialog}
        onClose={() => {
          setOpenAprovarDialog(false);
          setSelectedPix(null);
        }}
        pix={selectedPix}
        onConfirm={handleAprovarConfirm}
        loading={loadingAction}
      />

      <RejeitarPixDialog
        open={openRejeitarDialog}
        onClose={() => {
          setOpenRejeitarDialog(false);
          setSelectedPix(null);
        }}
        pix={selectedPix}
        onConfirm={handleRejeitarConfirm}
        loading={loadingAction}
      />
    </Stack>
  );
}
