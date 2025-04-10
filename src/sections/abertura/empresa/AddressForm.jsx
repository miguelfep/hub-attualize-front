import React from 'react';
import { toast } from 'sonner';

import { Grid, TextField, InputAdornment, CircularProgress } from '@mui/material';

import { consultarCep } from 'src/utils/consultarCep'; // Substitua pelo caminho correto da sua função de consulta de CEP

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

  const handleCepBlur = async () => {
    const cep = formData.enderecoComercial.cep.replace('-', '');
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const data = await consultarCep(cep); // Função para buscar dados do CEP
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
    } else {
      toast.error('CEP inválido.');
    }
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {' '}
      {/* Adicionado margem inferior */}
      {/* Campo de CEP */}
      <Grid item xs={12} sm={3}>
        <TextField
          label="CEP"
          name="cep"
          value={formData.enderecoComercial.cep || ''}
          onChange={handleChange}
          onBlur={handleCepBlur}
          fullWidth
          InputProps={{
            endAdornment: loadingCep && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      {/* Outros campos de endereço */}
      <Grid item xs={12} sm={7}>
        <TextField
          label="Logradouro"
          name="logradouro"
          value={formData.enderecoComercial.logradouro || ''}
          onChange={handleChange}
          fullWidth
          disabled={loadingCep}
        />
      </Grid>
      <Grid item xs={12} sm={2}>
        <TextField
          label="Número"
          name="numero"
          value={formData.enderecoComercial.numero || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          label="Complemento"
          name="complemento"
          value={formData.enderecoComercial.complemento || ''}
          onChange={handleChange}
          fullWidth
          disabled={loadingCep}
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          label="Bairro"
          name="bairro"
          value={formData.enderecoComercial.bairro || ''}
          onChange={handleChange}
          fullWidth
          disabled={loadingCep}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="Cidade"
          name="cidade"
          value={formData.enderecoComercial.cidade || ''}
          onChange={handleChange}
          fullWidth
          disabled={loadingCep}
        />
      </Grid>
      <Grid item xs={12} sm={2}>
        <TextField
          label="Estado"
          name="estado"
          value={formData.enderecoComercial.estado || ''}
          onChange={handleChange}
          fullWidth
          disabled={loadingCep}
        />
      </Grid>
    </Grid>
  );
};

export default AddressForm;
