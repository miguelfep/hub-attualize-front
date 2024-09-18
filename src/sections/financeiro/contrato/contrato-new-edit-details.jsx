import { useState, useEffect, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';

import { fCurrency } from 'src/utils/format-number';

import { getServiceItens } from 'src/actions/serviceItens';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ContratoNewEditDetails({ contrato }) {
  // Adicione contrato como prop para edição
  const { control, setValue, watch } = useFormContext();
  const [itensServices, setItensServices] = useState([]);

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const values = watch();

  // Calcular o valor total de cada linha (quantidade * valorUnitario)
  const totalOnRow = values.items?.map((item) => item.quantidade * item.valorUnitario) || 0;

  // Calcular o valorMensalidade como a soma de todos os totais de linha
  const valorMensalidade = totalOnRow.reduce((acc, num) => acc + num, 0);

  // Atualizar o valorMensalidade no formulário para ser enviado no submit
  useEffect(() => {
    setValue('valorMensalidade', valorMensalidade);
  }, [setValue, valorMensalidade, values.items]);

  // Buscar os itens de serviço
  useEffect(() => {
    const fetchServiceItens = async () => {
      try {
        const response = await getServiceItens();
        setItensServices(response.servicesItem);
      } catch (error) {
        console.error('Erro ao buscar itens de serviço:', error);
      }
    };

    fetchServiceItens();
  }, []);

  // Preencher os dados ao editar o contrato
  useEffect(() => {
    if (contrato && contrato.items) {
      contrato.items.forEach((item) => {
        append({
          item: item.item || '',
          servico: item.servico || '',
          quantidade: item.quantidade || 1,
          valorUnitario: item.valorUnitario || 0,
          descricao: item.descricao || '',
          total: item.total || 0,
        });
      });
    }
  }, [contrato, append]);

  const handleAdd = () => {
    append({
      item: '',
      descricao: '',
      servico: '',
      quantidade: 1,
      valorUnitario: 0,
      total: 0,
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleClearService = useCallback(
    (index) => {
      setValue(`items[${index}].servico`, '');
      setValue(`items[${index}].descricao`, '');
      setValue(`items[${index}].quantidade`, 1);
      setValue(`items[${index}].valorUnitario`, 0);
      setValue(`items[${index}].total`, 0);
    },
    [setValue]
  );

  const handleSelectService = useCallback(
    (index, option) => {
      const selectedService = itensServices.find((service) => service._id === option);
      if (selectedService) {
        setValue(`items[${index}].servico`, selectedService._id); // Armazena o ID do serviço
        setValue(`items[${index}].descricao`, selectedService.descricao); // Preenche a descrição
        setValue(`items[${index}].valorUnitario`, selectedService.preco);
        setValue(`items[${index}].total`, selectedService.preco * values.items[index].quantidade);
      }
    },
    [setValue, values.items, itensServices]
  );

  const handleChangeQuantity = useCallback(
    (event, index) => {
      const quantidade = Number(event.target.value);
      const { valorUnitario } = values.items[index];
      setValue(`items[${index}].quantidade`, quantidade);
      setValue(`items[${index}].total`, quantidade * valorUnitario);
    },
    [setValue, values.items]
  );

  const handleChangePrice = useCallback(
    (event, index) => {
      const valorUnitario = Number(event.target.value);
      const { quantidade } = values.items[index];
      setValue(`items[${index}].valorUnitario`, valorUnitario);
      setValue(`items[${index}].total`, quantidade * valorUnitario);
    },
    [setValue, values.items]
  );

  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}
    >
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(valorMensalidade) || '-'}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Detalhes:
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
              <Field.Select
                name={`items[${index}].servico`}
                size="small"
                label="Serviço"
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 160 } }}
                value={values.items[index].servico}
                onChange={(event) => handleSelectService(index, event.target.value)}
              >
                <MenuItem
                  value=""
                  onClick={() => handleClearService(index)}
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                >
                  Selecione
                </MenuItem>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {itensServices.map((service) => (
                  <MenuItem key={service._id} value={service._id}>
                    {service.titulo}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                size="small"
                name={`items[${index}].descricao`}
                label="Descrição"
                InputLabelProps={{ shrink: true }}
                value={values.items[index]?.descricao || ''}
              />

              <Field.Text
                size="small"
                type="number"
                name={`items[${index}].quantidade`}
                label="Qtd"
                placeholder="0"
                onChange={(event) => handleChangeQuantity(event, index)}
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 56 } }}
              />

              <Field.Text
                size="small"
                type="number"
                name={`items[${index}].valorUnitario`}
                label="Preço"
                placeholder="0,00"
                onChange={(event) => handleChangePrice(event, index)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>R$</Box>
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: { md: 96 } }}
              />

              <Field.Text
                disabled
                size="small"
                type="number"
                name={`items[${index}].total`}
                label="Total"
                placeholder="0.00"
                value={
                  values.items[index].total ||
                  values.items[index].valorUnitario * values.items[index].quantidade
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>R$</Box>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  maxWidth: { md: 104 },
                  [`& .${inputBaseClasses.input}`]: {
                    textAlign: { md: 'right' },
                  },
                }}
              />
            </Stack>

            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => handleRemove(index)}
            >
              Remover
            </Button>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
      >
        <Button
          size="small"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
          sx={{ flexShrink: 0 }}
        >
          Adicionar Item
        </Button>
      </Stack>

      {renderTotal}
    </Box>
  );
}
