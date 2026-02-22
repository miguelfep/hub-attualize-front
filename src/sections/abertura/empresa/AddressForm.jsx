import React from 'react';
import { toast } from 'sonner';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Grid,
  Stack,
  Divider,
  Checkbox,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { formatCep } from 'src/utils/format-input';
import { consultarCep } from 'src/utils/consultarCep';

import { Iconify } from 'src/components/iconify';

// Endereço fiscal da Attualize (Curitiba - PR) — usado quando o cliente opta por endereço fiscal
const ENDERECO_FISCAL_ATTUALIZE = {
  cep: '81570-001',
  logradouro: 'Av. Sen. Salgado Filho',
  numero: '1847',
  complemento: 'Sobreloja',
  bairro: 'Guabirotuba',
  cidade: 'Curitiba',
  estado: 'PR',
};

const AddressForm = ({ formData, setFormData }) => {
  const theme = useTheme();
  const [loadingCep, setLoadingCep] = React.useState(false);
  const usarEnderecoFiscal = !!formData.usarEnderecoFiscal;

  const handleToggleEnderecoFiscal = (checked) => {
    setFormData((prev) => ({
      ...prev,
      usarEnderecoFiscal: checked,
      enderecoComercial: checked
        ? { ...ENDERECO_FISCAL_ATTUALIZE }
        : {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
          },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      enderecoComercial: {
        ...prev.enderecoComercial,
        [name]: value,
      },
    }));
  };

  const handleCepChange = (e) => {
    const formatted = formatCep(e.target.value);
    setFormData((prev) => ({
      ...prev,
      enderecoComercial: {
        ...prev.enderecoComercial,
        cep: formatted,
      },
    }));
  };

  const handleCepBlur = async () => {
    const cep = formData.enderecoComercial.cep?.replace(/\D/g, '') || '';
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const data = await consultarCep(cep);
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            enderecoComercial: {
              ...prev.enderecoComercial,
              logradouro: data.logradouro || '',
              complemento: data.complemento || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              estado: data.uf || '',
            },
          }));
          toast.success('Endereço preenchido com sucesso!');
        } else {
          toast.error('CEP não encontrado.');
        }
      } catch (error) {
        toast.error('Erro ao buscar o CEP.');
      } finally {
        setLoadingCep(false);
      }
    } else if (cep.length > 0) {
      toast.error('CEP deve conter 8 dígitos.');
    }
  };

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Endereço Comercial
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Opção: Usar Endereço Fiscal da Attualize */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          border: `2px solid ${usarEnderecoFiscal ? theme.palette.primary.main : alpha(theme.palette.grey[500], 0.2)}`,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: 1,
          },
        }}
        onClick={() => handleToggleEnderecoFiscal(!usarEnderecoFiscal)}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={usarEnderecoFiscal}
              onChange={(e) => handleToggleEnderecoFiscal(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          }
          label={
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                <Iconify icon="solar:buildings-2-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Usar Endereço Fiscal da Attualize
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: '#FEC615',
                    color: '#333',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontWeight: 700,
                  }}
                >
                  +R$ 50/mês
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Não tem endereço comercial próprio? Use nosso endereço em Curitiba (PR) para registro da empresa.
                Ideal para quem atua em home office, online ou ainda não possui ponto físico.
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, display: 'block' }}>
                ✓ Endereço comercial legalizado • ✓ Recebimento de correspondências • ✓ Sem necessidade de
                comprovar uso do imóvel
              </Typography>
              {usarEnderecoFiscal && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                  Endereço que será utilizado: Av. Sen. Salgado Filho, 1847 - Sobreloja - Guabirotuba, Curitiba - PR,
                  81570-001
                </Typography>
              )}
            </Box>
          }
        />
      </Card>

      <Grid container spacing={0} sx={{ '& > *': { px: 2, mb: 2 } }}>
      {/* Campo de CEP */}
      <Grid xs={12} sm={3}>
        <TextField
          margin="normal"
          fullWidth
          label="CEP"
          name="cep"
          value={formData.enderecoComercial?.cep || ''}
          onChange={handleCepChange}
          onBlur={handleCepBlur}
          placeholder="00000-000"
          helperText="Digite o CEP para preencher automaticamente"
          disabled={usarEnderecoFiscal}
          InputProps={{
            endAdornment: loadingCep && !usarEnderecoFiscal && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid xs={12} sm={7}>
        <TextField
          margin="normal"
          fullWidth
          label="Logradouro"
          name="logradouro"
          value={formData.enderecoComercial?.logradouro || ''}
          onChange={handleChange}
          disabled={loadingCep || usarEnderecoFiscal}
        />
      </Grid>
      <Grid xs={12} sm={2}>
        <TextField
          margin="normal"
          fullWidth
          label="Número"
          name="numero"
          value={formData.enderecoComercial?.numero || ''}
          onChange={handleChange}
          disabled={usarEnderecoFiscal}
        />
      </Grid>
      <Grid xs={12} sm={3}>
        <TextField
          margin="normal"
          fullWidth
          label="Complemento"
          name="complemento"
          value={formData.enderecoComercial?.complemento || ''}
          onChange={handleChange}
          disabled={loadingCep || usarEnderecoFiscal}
        />
      </Grid>
      <Grid xs={12} sm={3}>
        <TextField
          margin="normal"
          fullWidth
          label="Bairro"
          name="bairro"
          value={formData.enderecoComercial?.bairro || ''}
          onChange={handleChange}
          disabled={loadingCep || usarEnderecoFiscal}
        />
      </Grid>
      <Grid xs={12} sm={4}>
        <TextField
          margin="normal"
          fullWidth
          label="Cidade"
          name="cidade"
          value={formData.enderecoComercial?.cidade || ''}
          onChange={handleChange}
          disabled={loadingCep || usarEnderecoFiscal}
        />
      </Grid>
      <Grid xs={12} sm={2}>
        <TextField
          margin="normal"
          fullWidth
          label="Estado"
          name="estado"
          value={formData.enderecoComercial?.estado || ''}
          onChange={handleChange}
          disabled={loadingCep || usarEnderecoFiscal}
        />
      </Grid>
    </Grid>
    </Box>
  );
};

export default AddressForm;
