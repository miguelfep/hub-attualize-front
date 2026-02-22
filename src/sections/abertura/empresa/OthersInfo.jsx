import React from 'react';
import { NumericFormat } from 'react-number-format';

import { Box, Grid, Divider, MenuItem, TextField, Typography } from '@mui/material';


const OthersInfo = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCurrencyChange = (values) => {
    const { floatValue } = values;
    setFormData((prev) => ({
      ...prev,
      capitalSocial: floatValue || 0,
    }));
  };

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Outras Informações
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={0} sx={{ '& > *': { px: 2, mb: 2 } }}>
      {/* Capital Social */}
      <Grid xs={12} sm={6}>
        <NumericFormat
          margin="normal"
          fullWidth
          label="Capital Social"
          value={formData.capitalSocial || ''}
          onValueChange={handleCurrencyChange}
          customInput={TextField}
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          decimalScale={2}
          fixedDecimalScale
          helperText="Valor investido pelos sócios para iniciar a empresa"
        />
      </Grid>

      {/* Responsável Técnico */}
      <Grid xs={12} sm={6}>
        <TextField
          margin="normal"
          fullWidth
          select
          label="Responsável Técnico"
          value={formData.responsavelReceitaFederal || ''}
          onChange={(e) => handleChange('responsavelReceitaFederal', e.target.value)}
          helperText="Selecione um dos sócios cadastrados"
        >
          {formData.socios && formData.socios.length > 0 ? (
            formData.socios.map((socio, index) => (
              <MenuItem key={index} value={socio.nome}>
                {socio.nome || `Sócio ${index + 1}`}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              Cadastre pelo menos um sócio primeiro
            </MenuItem>
          )}
        </TextField>
      </Grid>

      {/* Forma de Atuação */}
      <Grid xs={12}>
        <TextField
          margin="normal"
          fullWidth
          select
          label="Forma de Atuação"
          value={formData.formaAtuacao || ''}
          onChange={(e) => handleChange('formaAtuacao', e.target.value)}
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
          margin="normal"
          fullWidth
          multiline
          rows={4}
          label="Descrição das Atividades"
          value={formData.descricaoAtividades || ''}
          onChange={(e) => handleChange('descricaoAtividades', e.target.value)}
        />
      </Grid>

      {/* Observações */}
      <Grid xs={12}>
        <TextField
          margin="normal"
          fullWidth
          multiline
          rows={3}
          label="Observações"
          value={formData.observacoes || ''}
          onChange={(e) => handleChange('observacoes', e.target.value)}
        />
      </Grid>
    </Grid>
    </Box>
  );
};

export default OthersInfo;
