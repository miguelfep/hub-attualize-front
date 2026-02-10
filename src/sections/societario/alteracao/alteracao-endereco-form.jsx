import { toast } from "sonner";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import {
  Box,
  Grid,
  Switch,
  Divider,
  TextField,
  Typography,
  InputAdornment,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";

import { formatCep } from 'src/utils/format-input';

import { buscarCep } from "src/actions/cep";

export default function AlteracaoEnderecoForm({ enderecoAlteracao }) {
  const { control, watch, setValue } = useFormContext();
  const cepEnabled = watch("cepEnabled");
  const [loadingCep, setLoadingCep] = useState(false);

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/[\D]/g, '');

    if (cep.length === 8 && cepEnabled) {
      setLoadingCep(true);
      try {
        const data = await buscarCep(cep);

        setValue('logradouro', data.rua || '', { shouldValidate: true });
        setValue('bairro', data.bairro || '', { shouldValidate: true });
        setValue('cidade', data.cidade || '', { shouldValidate: true });
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };


  return (
    <>
      <Grid container spacing={3} sx={{ mt: { xs: 2, md: 2 } }}>
        <Grid item xs={12} md={12}>
          <Typography variant="h5" sx={{ mb: 2 }} gutterBottom>
            Endereço Comercial
          </Typography>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Caso queira alterar seu endereço comercial, habilite a opção <strong>Desejo alterar meu Endereço</strong> e preencha os respectivos campos com o novo <strong>CEP</strong>, <strong>número</strong> e <strong>complemento</strong>.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <Controller
            name="cep"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label="CEP"
                placeholder="00000-000"
                disabled={!cepEnabled || loadingCep}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                value={formatCep(field.value || '')}
                onChange={(e) => {
                  const formatted = formatCep(e.target.value);
                  field.onChange(formatted);
                }}
                onBlur={handleCepBlur}
                inputProps={{
                  maxLength: 9,
                }}
                InputProps={{
                  endAdornment: loadingCep && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name="cepEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                sx={{ mb: 1, minWidth: '200%' }}
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    name={field.name}
                    inputRef={field.ref}
                  />
                }
                label="Desejo alterar meu Endereço"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Controller
            name="logradouro"
            control={control}
            render={({ field, fieldState }) => (
              <TextField {...field} fullWidth label="Endereço" disabled error={!!fieldState.error} helperText={fieldState.error?.message} />
            )}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Controller
            name="bairro"
            control={control}
            render={({ field, fieldState }) => (
              <TextField {...field} fullWidth label="Bairro" disabled error={!!fieldState.error} helperText={fieldState.error?.message} />
            )}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Controller
            name="cidade"
            control={control}
            render={({ field, fieldState }) => (
              <TextField {...field} fullWidth label="Cidade" disabled error={!!fieldState.error} helperText={fieldState.error?.message} />
            )}
          />
        </Grid>
        <Grid item xs={12} md={1}>
          <Controller
            name="numero"
            control={control}
            render={({ field, fieldState }) => (
              <TextField {...field} fullWidth label="N°" disabled={!cepEnabled} error={!!fieldState.error} helperText={fieldState.error?.message} />
            )}
          />

        </Grid>
        <Grid item xs={12} md={2}>
          <Controller
            name="complemento"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Complemento" disabled={!cepEnabled} />
            )}
          />
        </Grid>
      </Grid>
      <Divider sx={{ mb: 2 }} />
    </>
  );
}