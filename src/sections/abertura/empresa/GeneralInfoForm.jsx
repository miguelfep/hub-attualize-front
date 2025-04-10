import React from 'react';
import InputMask from 'react-input-mask';

import { Grid, Tooltip, TextField, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

const GeneralInfoForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Primeira linha: Razão Social e Nome Fantasia */}
      <Grid item xs={12} sm={6}>
        <TextField
          label={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Razão Social
              <Tooltip title="Nome registrado oficialmente da empresa. Geralmente usado em contratos e documentos formais.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <Iconify width={16} icon="eva:question-mark-circle-outline" />
                </IconButton>
              </Tooltip>
            </span>
          }
          name="nomeEmpresarial"
          value={formData.nomeEmpresarial || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Nome Fantasia"
          name="nomeFantasia"
          value={formData.nomeFantasia || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      {/* Segunda linha: Nome, CPF, Email e Email Financeiro */}
      <Grid item xs={12} sm={3}>
        <TextField
          label="Nome"
          name="nome"
          value={formData.nome || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          label="CPF"
          name="cpf"
          value={formData.cpf || ''}
          onChange={handleChange}
          fullWidth
          disabled
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          label="E-mail"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          label="E-mail Financeiro"
          name="emailFinanceiro"
          value={formData.emailFinanceiro || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      {/* Terceira linha: Telefone, Telefone Comercial e Horário de Funcionamento */}
      <Grid item xs={12} sm={4}>
        <TextField
          label="Telefone"
          name="telefone"
          value={formData.telefone || ''}
          onChange={handleChange}
          fullWidth
          disabled
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <InputMask
          mask="(99) 9999-9999"
          maskChar={null}
          value={formData.telefoneComercial || ''}
          onChange={handleChange}
        >
          {(inputProps) => (
            <TextField
              label="Telefone Comercial"
              name="telefoneComercial"
              fullWidth
              {...inputProps}
            />
          )}
        </InputMask>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="Horário de Funcionamento"
          name="horarioFuncionamento"
          value={formData.horarioFuncionamento || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      {/* Quarta linha: Metragem do Imóvel e Metragem Utilizada */}
      <Grid item xs={12} sm={6}>
        <TextField
          label={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Metragem do Imóvel
              <Tooltip title="Área total do imóvel, incluindo áreas comuns e não utilizadas.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <Iconify width={16} icon="eva:question-mark-circle-outline" />
                </IconButton>
              </Tooltip>
            </span>
          }
          name="metragemImovel"
          value={formData.metragemImovel || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Metragem Utilizada
              <Tooltip title="Área efetivamente utilizada para as operações da empresa.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <Iconify width={16} icon="eva:question-mark-circle-outline" />
                </IconButton>
              </Tooltip>
            </span>
          }
          name="metragemUtilizada"
          value={formData.metragemUtilizada || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      {/* Quinta linha: Senha GOV */}
      <Grid item xs={12}>
        <TextField
          type="password"
          label="Senha GOV"
          name="senhaGOV"
          value={formData.senhaGOV || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default GeneralInfoForm;
