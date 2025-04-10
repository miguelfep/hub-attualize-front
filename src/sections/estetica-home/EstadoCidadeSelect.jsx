import { cities } from 'brazil-geodata';
import React, { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Box, Grid } from '@mui/material';

import { Field } from 'src/components/hook-form';

const estados = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

export default function EstadoCidadeSelect({ estadoName = 'estado', cidadeName = 'cidade' }) {
  const { control, watch, setValue } = useFormContext();
  const estadoSelecionado = watch(estadoName);
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      if (estadoSelecionado) {
        try {
          const cidadesData = await cities.getCitiesByState(estadoSelecionado);
          if (Array.isArray(cidadesData)) {
            setCidadesDisponiveis(cidadesData.map((cidade) => cidade.text));
          } else {
            setCidadesDisponiveis([]);
          }
        } catch (error) {
          console.error('Erro ao buscar cidades:', error);
          setCidadesDisponiveis([]);
        }
      } else {
        setCidadesDisponiveis([]);
      }
    };
    fetchCities();
  }, [estadoSelecionado]);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name={estadoName}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Field.MultiSelect
                {...field}
                label="Estado"
                fullWidth
                options={estados.map((estado) => ({ label: estado.nome, value: estado.sigla }))}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setValue(cidadeName, ''); // Reseta a cidade ao trocar de estado
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={cidadeName}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Field.Select
                {...field}
                label="Cidade"
                fullWidth
                options={cidadesDisponiveis.map((cidade) => ({ label: cidade, value: cidade }))}
                disabled={!estadoSelecionado || cidadesDisponiveis.length === 0}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
