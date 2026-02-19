import React from 'react';

import { Box, Divider, Grid, Tooltip, TextField, IconButton, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { formatPhone, formatCpf } from 'src/utils/format-input';

const GeneralInfoForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Informações Gerais
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={{ xs: 2, sm: 3 }}>
      {/* Primeira linha: Razão Social e Nome Fantasia */}
      <Grid xs={12} sm={6} sx={{ pr: { xs: 0, sm: 1.5 } }}>
        <TextField
          margin="normal"
          fullWidth
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
        />
      </Grid>
      <Grid xs={12} sm={6} sx={{ pl: { xs: 0, sm: 1.5 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Nome Fantasia"
          name="nomeFantasia"
          value={formData.nomeFantasia || ''}
          onChange={handleChange}
        />
      </Grid>

      {/* Segunda linha: Nome, CPF, Email e Email Financeiro */}
      <Grid xs={12} sm={3} sx={{ pr: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Nome"
          name="nome"
          value={formData.nome || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid xs={12} sm={3} sx={{ px: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="CPF"
          name="cpf"
          value={formData.cpf || ''}
          onChange={(e) => {
            const formatted = formatCpf(e.target.value);
            setFormData((prev) => ({ ...prev, cpf: formatted }));
          }}
          disabled
        />
      </Grid>
      <Grid xs={12} sm={3} sx={{ px: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="E-mail"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid xs={12} sm={3} sx={{ pl: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="E-mail Financeiro"
          name="emailFinanceiro"
          value={formData.emailFinanceiro || ''}
          onChange={handleChange}
        />
      </Grid>

      {/* Terceira linha: Telefone, Telefone Comercial e Horário de Funcionamento */}
      <Grid xs={12} sm={4} sx={{ pr: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Telefone"
          name="telefone"
          value={formData.telefone || ''}
          onChange={handleChange}
          disabled
        />
      </Grid>
      <Grid xs={12} sm={4} sx={{ px: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Telefone Comercial"
          name="telefoneComercial"
          value={formData.telefoneComercial || ''}
          onChange={(e) => {
            const formatted = formatPhone(e.target.value);
            setFormData((prev) => ({ ...prev, telefoneComercial: formatted }));
          }}
        />
      </Grid>
      <Grid xs={12} sm={4} sx={{ pl: { xs: 0, sm: 1 } }}>
        <TextField
          margin="normal"
          fullWidth
          label="Horário de Funcionamento"
          name="horarioFuncionamento"
          value={formData.horarioFuncionamento || ''}
          onChange={handleChange}
        />
      </Grid>

      {/* Quarta linha: Metragem do Imóvel e Metragem Utilizada */}
      <Grid xs={12} sm={6} sx={{ pr: { xs: 0, sm: 1.5 } }}>
        <TextField
          margin="normal"
          fullWidth
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
        />
      </Grid>
      <Grid xs={12} sm={6} sx={{ pl: { xs: 0, sm: 1.5 } }}>
        <TextField
          margin="normal"
          fullWidth
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
        />
      </Grid>

      {/* Quinta linha: Senha GOV */}
      <Grid xs={12}>
        <TextField
          margin="normal"
          fullWidth
          type="password"
          label="Senha GOV"
          name="senhaGOV"
          value={formData.senhaGOV || ''}
          onChange={handleChange}
          helperText="Senha para acesso ao portal GOV.br"
        />
      </Grid>
    </Grid>
    </Box>
  );
};

export default GeneralInfoForm;
