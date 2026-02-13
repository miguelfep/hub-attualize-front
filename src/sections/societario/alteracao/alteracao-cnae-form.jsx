import { Controller, useFormContext } from "react-hook-form";

import { Box, Grid, Switch, Tooltip, Divider, TextField, IconButton, Typography, FormControlLabel } from "@mui/material";

import { Iconify } from "src/components/iconify";

export default function AlteracaoCnaeForm({ atividadeAlteracao, atividadeCliente }) {
    const { control } = useFormContext();

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
                    Atividade Comercial
                </Typography>
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Abaixo, você verá suas atividades comerciais. Caso deseje adicionar uma nova, habilite a opção, <strong>Desejo adicionar Novas Atividades</strong> e descrever a sua nova atividade.
                </Typography>
            </Box>
            <Grid xs={12} md={12}>
                <Controller
                    name="novasAtividadesEnabled"
                    control={control}
                    defaultValue={false}
                    render={({ field: switchField }) => (
                        <>
                            <Controller
                                name="novasAtividades"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={5}
                                        label={
                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                Novas Atividades
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
                                label="Desejo adicionar Novas Atividades"
                            />
                        </>
                    )}
                />
            </Grid>
            <Divider sx={{ mb: 3 }} />
        </>
    );
}
