import { Controller, useFormContext } from "react-hook-form";

import { Grid, Switch, Tooltip, TextField, IconButton, FormControlLabel } from "@mui/material";

import { Iconify } from "src/components/iconify";

export default function AlteracaoCnaeForm( {atividadeAlteracao}) {
    const { control } = useFormContext();

    return (
        <Grid container spacing={3} sx={{ mt: { xs: 2, md: 2 } }}>
            <Grid item xs={12} md={12}>
                <Controller
                    name="atividadePrimariaEnabled"
                    control={control}
                    defaultValue={false}
                    render={({ field: switchField }) => (
                        <>
                            <Controller
                                name="atividadePrimaria"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Atividade Primária"
                                        disabled={!switchField.value}
                                    />
                                )}
                            />
                            {/* <FormControlLabel
                                sx={{ mb: 1 }}
                                control={
                                    <Switch
                                        checked={switchField.value}
                                        onChange={(e) => switchField.onChange(e.target.checked)}
                                    />
                                }
                                label="Editar Atividade Principal"
                            /> */}
                        </>
                    )}
                />
            </Grid>

            <Grid item xs={12} md={12}>
                <Controller
                    name="atividadeSecundariaEnabled"
                    control={control}
                    defaultValue={false}
                    render={({ field: switchField }) => (
                        <>
                            <Controller
                                name="atividadeSecundaria"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={5}
                                        label={
                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                Atividade Secundária
                                                <Tooltip title="Descreva as novas atividade que deseja adicionar ao seu negócio. Caso saiba o CNAE, adicione o código e sua descrição.">
                                                    <IconButton size="small" sx={{ ml: 1 }}>
                                                        <Iconify width={16} icon="eva:question-mark-circle-outline" />
                                                    </IconButton>
                                                </Tooltip>
                                            </span>
                                        }
                                        disabled={!switchField.value}
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
                                label="Editar Atividade Secundária"
                            />
                        </>
                    )}
                />
            </Grid>
        </Grid>
    );
}
