import { toast } from "sonner";
import InputMask from "react-input-mask";
import { Controller, useFormContext } from "react-hook-form";

import { Grid, Switch, TextField, FormControlLabel } from "@mui/material";

import { buscarCep } from "src/actions/cep";


export default function AlteracaoEnderecoForm({ enderecoAlteracao }) {
  const { control, watch, setValue } = useFormContext();  
  const cepEnabled = watch("cepEnabled");

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/[\D]/g, '');

    if (cep.length === 8) {
      try {
        const data = await buscarCep(cep);

        setValue('logradouro', data.rua || '', { shouldValidate: true });
        setValue('bairro', data.bairro || '', { shouldValidate: true });
        setValue('cidade', data.cidade || '', { shouldValidate: true });
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      }
    }
  };

  return (
      <Grid container spacing={3} sx={{ mt: { xs: 2, md: 2 } }}>
        <Grid item xs={12} md={2}>
          <Controller
            name="cepEnabled"
            control={control}
            render={({ field: switchField }) => (
              <>
                <Controller
                  name="cep"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="CEP"
                      disabled={!switchField.value}
                      InputProps={{
                        inputComponent: InputMask,
                        inputProps: {
                          mask: "99.999-999",
                          value: field.value || '',
                          onChange: (e) => {
                            field.onChange(e.target.value);
                            if (switchField.value) {
                              handleCepChange(e);
                            }
                          },
                        },
                      }}
                    />
                  )}
                />
                <FormControlLabel
                  sx={{ mb: 1 }}
                  control={
                    <Switch
                      checked={switchField.value}
                      onChange={(e) => switchField.onChange(e.target.checked)}
                    />
                  }
                  label="Editar CEP"
                />
              </>
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Controller
            name="logradouro"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Endereço" disabled />
            )}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Controller
            name="bairro"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Bairro" disabled />
            )}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Controller
            name="cidade"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Cidade" disabled />
            )}
          />
        </Grid>
        <Grid item xs={12} md={1}>
          <Controller
            name="numero"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="N°" disabled={!cepEnabled} />
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
  );
}

