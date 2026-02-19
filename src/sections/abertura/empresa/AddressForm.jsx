import React from 'react';
import { toast } from 'sonner';

import { Box, Divider, Grid, TextField, InputAdornment, CircularProgress, Typography } from '@mui/material';

import { consultarCep } from 'src/utils/consultarCep';
import { formatCep } from 'src/utils/format-input';

const AddressForm = ({ formData, setFormData }) => {
  const [loadingCep, setLoadingCep] = React.useState(false);

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
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Endereço Comercial
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={{ xs: 2, sm: 3 }}>
      {/* Campo de CEP */}
      <Grid xs={12} sm={3} sx={{ pr: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="CEP"
          name="cep"
          value={formData.enderecoComercial.cep || ''}
          onChange={handleCepChange}
          onBlur={handleCepBlur}
          placeholder="00000-000"
          helperText="Digite o CEP para preencher automaticamente"
          InputProps={{
            endAdornment: loadingCep && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid xs={12} sm={7} sx={{ px: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Logradouro"
          name="logradouro"
          value={formData.enderecoComercial.logradouro || ''}
          onChange={handleChange}
          disabled={loadingCep}
        />
      </Grid>
      <Grid xs={12} sm={2} sx={{ pl: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Número"
          name="numero"
          value={formData.enderecoComercial.numero || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid xs={12} sm={3} sx={{ pr: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Complemento"
          name="complemento"
          value={formData.enderecoComercial.complemento || ''}
          onChange={handleChange}
          disabled={loadingCep}
        />
      </Grid>
      <Grid xs={12} sm={3} sx={{ px: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Bairro"
          name="bairro"
          value={formData.enderecoComercial.bairro || ''}
          onChange={handleChange}
          disabled={loadingCep}
        />
      </Grid>
      <Grid xs={12} sm={4} sx={{ px: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Cidade"
          name="cidade"
          value={formData.enderecoComercial.cidade || ''}
          onChange={handleChange}
          disabled={loadingCep}
        />
      </Grid>
      <Grid xs={12} sm={2} sx={{ pl: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Estado"
          name="estado"
          value={formData.enderecoComercial.estado || ''}
          onChange={handleChange}
          disabled={loadingCep}
        />
      </Grid>
    </Grid>
    </Box>
  );
};

export default AddressForm;
