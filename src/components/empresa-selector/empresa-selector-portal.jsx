import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';
import { toast } from 'sonner';

import axios from 'src/utils/axios';
import { useSettingsContext } from 'src/contexts/SettingsContext';

// ----------------------------------------------------------------------

export function EmpresaSelectorPortal({ userId, onEmpresaChange, compact = false }) {
  
  const [empresas, setEmpresas] = useState([]);
  const [empresaAtiva, setEmpresaAtiva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  const { updateSettings } = useSettingsContext();

  const fetchEmpresas = useCallback(async () => {
    try {
      setLoadingEmpresas(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/empresas/${userId}`);
      
      if (response.data.success) {
        const { empresas: empresasData, empresaAtiva: empresaAtivaData, settings } = response.data.data;

        setEmpresas(empresasData || []);
        setEmpresaAtiva(empresaAtivaData);
        if (settings) {
          updateSettings(settings);
        }
      } else {
        console.log('API retornou success: false');
      }
    } catch (error) {
      console.error('Detalhes do erro:', error.response?.data);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoadingEmpresas(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchEmpresas();
    }
  }, [userId, fetchEmpresas]);

 

  const handleTrocarEmpresa = async (novaEmpresaId) => {
    if (novaEmpresaId === empresaAtiva) return;

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/trocar-empresa/${userId}`, {
        empresaId: novaEmpresaId
      });

      if (response.data.success) {
        const { empresaAtiva: novaAtiva, settings } = response.data.data || {};
        setEmpresaAtiva(novaAtiva || novaEmpresaId);
        toast.success('Empresa alterada com sucesso!');
        if (settings) {
          updateSettings(settings);
        }
        
        if (onEmpresaChange) onEmpresaChange(response.data.data.empresaAtiva);
        // Redireciona para lista de clientes se o usuário estiver em telas sensíveis
        const currentPath = window.location.pathname;
        if (currentPath.includes('/portal-cliente/clientes/') && !currentPath.endsWith('/clientes')) {
          window.location.href = '/portal-cliente/clientes';
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
          Carregando...
        </Typography>
      </Box>
    );
  }

  // Se tem apenas uma empresa, mostra apenas o nome
  if (empresas.length <= 1) {
    const empresa = empresas[0];    
    if (!empresa) {
      
      return null;
    }

   
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="solar:buildings-bold" width={18} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {empresa.nome}
        </Typography>
      </Stack>
    );
  }

  const empresaAtual = getEmpresaAtiva();
  

  if (compact) {
    // Versão compacta para header
    return (
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          value={empresaAtiva || ''}
          onChange={(e) => handleTrocarEmpresa(e.target.value)}
          disabled={loading}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {empresas.map((empresa) => (
            <MenuItem key={empresa._id} value={empresa._id}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:buildings-bold" width={16} />
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {empresa.nome}
                </Typography>
                {empresa._id === empresaAtiva && (
                  <Chip
                    label="Ativa"
                    size="small"
                    color="success"
                    sx={{ height: 16, fontSize: '0.65rem' }}
                  />
                )}
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // Versão completa
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
        <Tooltip title={`Empresa ativa: ${empresaAtual.nome}`}>
          <Chip
            label="Ativa"
            color="success"
            size="small"
            startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          />
        </Tooltip>
      )}
    </Stack>
  );
}
