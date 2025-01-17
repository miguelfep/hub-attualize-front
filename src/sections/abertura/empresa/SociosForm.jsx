import React, { useEffect } from 'react';
import InputMask from 'react-input-mask';

import { Box, Grid, Switch, Divider, MenuItem, TextField, Typography, FormControlLabel } from '@mui/material';

const SociosForm = ({ formData, setFormData }) => {
  // Inicializa com 1 sócio por padrão
  useEffect(() => {
    if (!formData.socios || formData.socios.length === 0) {
      setFormData((prev) => ({
        ...prev,
        socios: [
          {
            nome: '',
            cpf: '',
            rg: '',
            estadoCivil: '',
            naturalidade: '',
            porcentagem: 0,
            administrador: false,
            regimeBens: '',
            endereco: '',
            profissao: '',
            cnh: '',
          },
        ],
      }));
    }
  }, [formData.socios, setFormData]);

  const handleChange = (index, field, value) => {
    const updatedSocios = [...formData.socios];

    if (field === 'porcentagem') {
      // Limita o valor máximo a 100 para o campo porcentagem
      value = Math.min(100, Math.max(0, value));
    }

    updatedSocios[index][field] = value;
    setFormData((prev) => ({ ...prev, socios: updatedSocios }));
  };

  const handleNumSociosChange = (value) => {
    const numSocios = parseInt(value, 10);
    let updatedSocios = [...formData.socios];

    if (numSocios > updatedSocios.length) {
      for (let i = updatedSocios.length; i < numSocios; i += 1) {
        updatedSocios.push({
          nome: '',
          cpf: '',
          rg: '',
          estadoCivil: '',
          naturalidade: '',
          porcentagem: 0,
          administrador: false,
          regimeBens: '',
          endereco: '',
          profissao: '',
          cnh: '',
        });
      }
    } else {
      updatedSocios = updatedSocios.slice(0, numSocios);
    }

    setFormData((prev) => ({ ...prev, socios: updatedSocios }));
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Campo para selecionar o número de sócios */}
      <Grid item xs={12}>
        <TextField
          select
          label="Número de Sócios"
          value={formData.socios.length}
          onChange={(e) => handleNumSociosChange(e.target.value)}
          fullWidth
          required
        >
          {[...Array(10).keys()].map((i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {i + 1}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Renderização dinâmica dos campos dos sócios */}
      {formData.socios.map((socio, index) => (
        <React.Fragment key={index}>
          <Grid item xs={12}>
            <Typography variant="h6">{`Dados do Sócio ${index + 1}`}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Nome"
              value={socio.nome || ''}
              onChange={(e) => handleChange(index, 'nome', e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <InputMask
              mask="999.999.999-99"
              value={socio.cpf || ''}
              onChange={(e) => handleChange(index, 'cpf', e.target.value)}
            >
              {(inputProps) => (
                <TextField {...inputProps} label="CPF" fullWidth />
              )}
            </InputMask>
          </Grid>

          <Grid item xs={12} sm={4}>
            <InputMask
              mask="99.999.999-*"
              value={socio.rg || ''}
              onChange={(e) => handleChange(index, 'rg', e.target.value)}
            >
              {(inputProps) => (
                <TextField {...inputProps} label="RG" fullWidth />
              )}
            </InputMask>
          </Grid>

          <Grid item xs={12} sm={4}>
            <InputMask
              mask="99999999999"
              value={socio.cnh || ''}
              onChange={(e) => handleChange(index, 'cnh', e.target.value)}
            >
              {(inputProps) => (
                <TextField {...inputProps} label="CNH" fullWidth />
              )}
            </InputMask>
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              label="Endereço"
              value={socio.endereco || ''}
              onChange={(e) => handleChange(index, 'endereco', e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Naturalidade"
              value={socio.naturalidade || ''}
              onChange={(e) => handleChange(index, 'naturalidade', e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Profissão"
              value={socio.profissao || ''}
              onChange={(e) => handleChange(index, 'profissao', e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Porcentagem"
              type="number"
              value={socio.porcentagem || ''}
              onChange={(e) => handleChange(index, 'porcentagem', e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Estado Civil"
              value={socio.estadoCivil || ''}
              onChange={(e) => handleChange(index, 'estadoCivil', e.target.value)}
              fullWidth
            >
              <MenuItem value="Solteiro">Solteiro</MenuItem>
              <MenuItem value="Casado">Casado</MenuItem>
              <MenuItem value="Divorciado">Divorciado</MenuItem>
              <MenuItem value="Viúvo">Viúvo</MenuItem>
              <MenuItem value="União estável">União estável</MenuItem>
            </TextField>
          </Grid>

          {socio.estadoCivil === 'Casado' && (
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Regime de Bens"
                value={socio.regimeBens || ''}
                onChange={(e) => handleChange(index, 'regimeBens', e.target.value)}
                fullWidth
              >
                <MenuItem value="Comunhão Parcial de Bens">Comunhão Parcial de Bens</MenuItem>
                <MenuItem value="Comunhão Universal de Bens">Comunhão Universal de Bens</MenuItem>
                <MenuItem value="Separação Total de Bens">Separação Total de Bens</MenuItem>
              </TextField>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={socio.administrador || false}
                  onChange={(e) => handleChange(index, 'administrador', e.target.checked)}
                />
              }
              label="É Administrador?"
            />
          </Grid>

          {/* Divider entre sócios */}
          {index < formData.socios.length - 1 && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Divider />
              </Box>
            </Grid>
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default SociosForm;
