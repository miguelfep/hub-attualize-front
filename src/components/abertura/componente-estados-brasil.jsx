import { cities } from 'brazil-geodata';
import React, { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Grid } from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

// ----------------------------------------------------------------------

export default function EstadoCidadeSelect() {
  const { control } = useFormContext();
  const [estadoSelecionado, setEstadoSelecionado] = useState('');
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);

  // Lista de estados
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

  // Atualiza as cidades disponíveis quando um estado é selecionado
  useEffect(() => {
    const fetchCities = async () => {
      if (estadoSelecionado) {
        try {
          const cidadesData = await cities.getCitiesByState(estadoSelecionado);
          console.log('Cidades retornadas:', cidadesData);

          // Verifique se cidadesData é um array
          if (Array.isArray(cidadesData)) {
            const cidades = cidadesData.map((cidade) => cidade.text);
            setCidadesDisponiveis(cidades);
          } else {
            console.error('Cidades não estão em formato de array:', cidadesData);
            setCidadesDisponiveis([]); // Caso o retorno não seja o esperado
          }
        } catch (error) {
          console.error('Erro ao buscar cidades:', error);
          setCidadesDisponiveis([]);
        }
      } else {
        setCidadesDisponiveis([]); // Limpa a lista de cidades se nenhum estado estiver selecionado
      }
    };

    fetchCities();
  }, [estadoSelecionado]);

  return (
    <div>
      <Grid container spacing={3}>
        {/* Select para Estado */}
        <Grid item xs={12} sm={6}>
          {' '}
          {/* Define o tamanho do Grid */}
          <FormControl fullWidth variant="filled">
            <InputLabel id="estado-label">Estado</InputLabel>
            <Controller
              name="stepThree.estado"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="estado-label"
                  value={estadoSelecionado}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setEstadoSelecionado(e.target.value); // Atualiza o estado selecionado
                  }}
                >
                  {estados.map((estado) => (
                    <MenuItem key={estado.sigla} value={estado.sigla}>
                      {estado.nome}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid>

        {/* Select para Cidade */}
        <Grid item xs={12} sm={6}>
          {' '}
          {/* Define o tamanho do Grid */}
          <FormControl fullWidth variant="filled">
            <InputLabel id="cidade-label">Cidade</InputLabel>
            <Controller
              name="stepThree.cidade"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="cidade-label"
                  value={field.value || ''}
                  onChange={field.onChange}
                  disabled={!estadoSelecionado || cidadesDisponiveis.length === 0}
                >
                  {cidadesDisponiveis.map((cidade, index) => (
                    <MenuItem key={index} value={cidade}>
                      {cidade}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid>
      </Grid>
    </div>
  );
}
