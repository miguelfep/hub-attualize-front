import React from 'react';
import { NumericFormat } from 'react-number-format';

import { Grid, Tooltip, MenuItem, TextField, Typography, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

const OthersInfo = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCurrencyChange = (values) => {
    const { formattedValue } = values;
    setFormData((prev) => ({
      ...prev,
      capitalSocial: formattedValue, // Salva o valor formatado como string
    }));
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid xs={12}>
        <Typography variant="h6">Outras Informações</Typography>
      </Grid>

      {/* Capital Social */}
      <Grid xs={12} sm={6}>
        <NumericFormat
          label={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Capital Social (R$)
              <Tooltip title="O capital social é o valor investido pelos sócios para iniciar as atividades da empresa.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <Iconify width={16} icon="eva:question-mark-circle-outline" />
                </IconButton>
              </Tooltip>
            </span>
          }
          value={formData.capitalSocial || ''}
          onValueChange={handleCurrencyChange}
          customInput={TextField}
          fullWidth
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          decimalScale={2}
          fixedDecimalScale
        />
      </Grid>

      {/* Responsável Técnico */}
      <Grid xs={12} sm={6}>
        <TextField
          select
          label="Responsável Técnico"
          value={formData.responsavelReceitaFederal || ''}
          onChange={(e) => handleChange('responsavelReceitaFederal', e.target.value)}
          fullWidth
        >
          {formData.socios.map((socio, index) => (
            <MenuItem key={index} value={socio.nome}>
              {socio.nome}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Forma de Atuação */}
      <Grid xs={12} sm={12}>
        <TextField
          select
          label="Forma de Atuação"
          value={formData.formaAtuacao || ''}
          onChange={(e) => handleChange('formaAtuacao', e.target.value)}
          fullWidth
        >
          <MenuItem value="Internet">Internet</MenuItem>
          <MenuItem value="Fora do estabelecimento">Fora do estabelecimento</MenuItem>
          <MenuItem value="Escritório administrativo">Escritório administrativo</MenuItem>
          <MenuItem value="Local próprio">Local próprio</MenuItem>
          <MenuItem value="Em estabelecimento de terceiros">
            Em estabelecimento de terceiros
          </MenuItem>
          <MenuItem value="Casa do cliente">Casa do cliente</MenuItem>
          <MenuItem value="Outros">Outros</MenuItem>
        </TextField>
      </Grid>

      {/* Descrição das Atividades */}
      <Grid xs={12}>
        <TextField
          multiline
          rows={4}
          label="Descrição das Atividades"
          value={formData.descricaoAtividades || ''}
          onChange={(e) => handleChange('descricaoAtividades', e.target.value)}
          fullWidth
        />
      </Grid>

      {/* Observações */}
      <Grid xs={12}>
        <TextField
          multiline
          rows={3}
          label="Observações"
          value={formData.observacoes || ''}
          onChange={(e) => handleChange('observacoes', e.target.value)}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default OthersInfo;
