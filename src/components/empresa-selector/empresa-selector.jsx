import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function EmpresaSelector({ userId, onEmpresaChange }) {
  const [empresas, setEmpresas] = useState([]);
  const [empresaAtiva, setEmpresaAtiva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchEmpresas();
    }
  }, [userId, fetchEmpresas]);

  const fetchEmpresas = useCallback(async () => {
    try {
      setLoadingEmpresas(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/empresas/${userId}`);
      
      if (response.data.success) {
        const { empresas: empresasData, empresaAtiva: empresaAtivaData } = response.data.data;  
        setEmpresas(empresasData || []);
        setEmpresaAtiva(empresaAtivaData);  
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoadingEmpresas(false);
    }
  }, [userId]);

  const handleTrocarEmpresa = async (novaEmpresaId) => {
    if (novaEmpresaId === empresaAtiva) return;

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/trocar-empresa/${userId}`, {
        empresaId: novaEmpresaId
      });

      if (response.data.success) {
        setEmpresaAtiva(novaEmpresaId);
        toast.success('Empresa alterada com sucesso!');
        
        if (onEmpresaChange) {
          onEmpresaChange(response.data.data.empresaAtiva);
        }
      }
    } catch (error) {
      console.error('Erro ao trocar empresa:', error);
      toast.error('Erro ao alterar empresa');
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaAtiva = () => empresas.find(empresa => empresa._id === empresaAtiva);

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  if (loadingEmpresas) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Carregando empresas...
        </Typography>
      </Box>
    );
  }

  // Se tem apenas uma empresa, não mostra o seletor
  if (empresas.length <= 1) {
    const empresa = empresas[0];
    if (!empresa) return null;

    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="solar:buildings-bold" width={20} sx={{ color: 'primary.main' }} />
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {empresa.razaoSocial}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatCNPJ(empresa.cnpj)}
          </Typography>
        </Stack>
      </Stack>
    );
  }

  const empresaAtual = getEmpresaAtiva();

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Iconify icon="solar:buildings-bold" width={20} sx={{ color: 'primary.main' }} />
      
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Empresa</InputLabel>
        <Select
          value={empresaAtiva || ''}
          label="Empresa"
          onChange={(e) => handleTrocarEmpresa(e.target.value)}
          disabled={loading}
          startAdornment={
            loading ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : (
              <Iconify icon="eva:arrow-downward-fill" width={16} sx={{ mr: 1, color: 'text.secondary' }} />
            )
          }
        >
          {empresas.map((empresa) => (
            <MenuItem key={empresa._id} value={empresa._id}>
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {empresa.nome}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatCNPJ(empresa.cnpj)}
                </Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {empresaAtual && (
        <Chip
          label="Ativa"
          color="success"
          size="small"
          startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
        />
      )}
    </Stack>
  );
}
