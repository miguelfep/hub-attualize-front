import React, { useEffect } from 'react';

import {
  Box,
  Card,
  Grid,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { formatRg, formatCpf, formatCnh } from 'src/utils/format-input';

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
    <Box sx={{ mb: 4, px: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Quadro Societário
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {/* Campo para selecionar o número de sócios */}
      <Grid container spacing={0} sx={{ mb: 3, '& > *': { px: 2, mb: 2 } }}>
        <Grid xs={12} sm={4}>
          <TextField
            margin="normal"
            fullWidth
            select
            label="Número de Sócios"
            value={formData.socios.length}
            onChange={(e) => handleNumSociosChange(e.target.value)}
            required
            helperText="Selecione quantos sócios a empresa terá"
          >
            {[...Array(10).keys()].map((i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {i + 1}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Renderização dinâmica dos campos dos sócios */}
      {formData.socios.map((socio, index) => (
        <Card key={index} sx={{ mb: 3, p: 3, bgcolor: 'background.neutral' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            {`Sócio ${index + 1}`}
          </Typography>
          <Grid container spacing={0} sx={{ '& > *': { px: 2, mb: 2 } }}>
          <Grid xs={12} sm={4}>
            <TextField
              margin="normal"
              fullWidth
              label="Nome"
              value={socio.nome || ''}
              onChange={(e) => handleChange(index, 'nome', e.target.value)}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              margin="normal"
              fullWidth
              label="CPF"
              value={socio.cpf || ''}
              onChange={(e) => {
                const formatted = formatCpf(e.target.value);
                handleChange(index, 'cpf', formatted);
              }}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              margin="normal"
              fullWidth
              label="RG"
              value={socio.rg || ''}
              onChange={(e) => {
                const formatted = formatRg(e.target.value);
                handleChange(index, 'rg', formatted);
              }}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              margin="normal"
              fullWidth
              label="CNH"
              value={socio.cnh || ''}
              onChange={(e) => {
                const formatted = formatCnh(e.target.value);
                handleChange(index, 'cnh', formatted);
              }}
            />
          </Grid>
          <Grid xs={12} sm={8}>
            <TextField
              margin="normal"
              fullWidth
              label="Endereço"
              value={socio.endereco || ''}
              onChange={(e) => handleChange(index, 'endereco', e.target.value)}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              label="Naturalidade"
              value={socio.naturalidade || ''}
              onChange={(e) => handleChange(index, 'naturalidade', e.target.value)}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              label="Profissão"
              value={socio.profissao || ''}
              onChange={(e) => handleChange(index, 'profissao', e.target.value)}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              label="Porcentagem"
              type="number"
              value={socio.porcentagem || ''}
              onChange={(e) => handleChange(index, 'porcentagem', e.target.value)}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              select
              label="Estado Civil"
              value={socio.estadoCivil || ''}
              onChange={(e) => handleChange(index, 'estadoCivil', e.target.value)}
            >
              <MenuItem value="Solteiro">Solteiro</MenuItem>
              <MenuItem value="Casado">Casado</MenuItem>
              <MenuItem value="Divorciado">Divorciado</MenuItem>
              <MenuItem value="Viúvo">Viúvo</MenuItem>
              <MenuItem value="União estável">União estável</MenuItem>
            </TextField>
          </Grid>

          {socio.estadoCivil === 'Casado' && (
            <Grid xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                select
                label="Regime de Bens"
                value={socio.regimeBens || ''}
                onChange={(e) => handleChange(index, 'regimeBens', e.target.value)}
              >
                <MenuItem value="Comunhão Parcial de Bens">Comunhão Parcial de Bens</MenuItem>
                <MenuItem value="Comunhão Universal de Bens">Comunhão Universal de Bens</MenuItem>
                <MenuItem value="Separação Total de Bens">Separação Total de Bens</MenuItem>
              </TextField>
            </Grid>
          )}

          <Grid xs={12} sx={{ mt: 1, mb: 1 }}>
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

          </Grid>
        </Card>
      ))}
    </Box>
  );
};

export default SociosForm;
