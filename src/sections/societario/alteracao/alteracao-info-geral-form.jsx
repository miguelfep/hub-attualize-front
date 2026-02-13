import { NumericFormat } from 'react-number-format';
import { Controller, useFormContext } from "react-hook-form"

import { Box, Grid, Switch, Select, MenuItem, TextField, Typography, FormControlLabel } from "@mui/material";

import { formatPhone } from 'src/utils/format-input';

export default function AlteracaoInfoGeralForm({ infoGeralAlteracao }) {

    const { control, watch } = useFormContext();

    // Garantir que infoGeralAlteracao seja um objeto válido
    const safeInfoGeralAlteracao = infoGeralAlteracao || {};
    // Garantir que socios seja um array válido
    const socios = safeInfoGeralAlteracao.socios || [];

    const regimeTributarioOptions = [
        { value: 'simples', label: 'Simples Nacional' },
        { value: 'presumido', label: 'Lucro Presumido' },
        { value: 'real', label: 'Lucro Real' },
    ];

    const formaAtuacaoOptions = [
        { value: 'internet', label: 'Internet' },
        { value: 'fora_estabelecimento', label: 'Fora do estabelecimento' },
        { value: 'escritorio', label: 'Escritório administrativo' },
        { value: 'local_proprio', label: 'Local próprio' },
        { value: 'terceiro', label: 'Em estabelecimento de terceiros' },
        { value: 'casa_cliente', label: 'Casa do cliente' },
        { value: 'outros', label: 'Outros' },
    ]

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Informações Gerais
                </Typography>
            </Box>
            <Box>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Descreva de maneira objetiva as alterações que você deseja realizar em sua empresa
                    </Typography>
                </Box>
                <Controller
                    name="alteracoes"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            label="Novas Mudanças"
                            multiline rows={4}
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
            </Box>
            <Grid container spacing={3} sx={{ mt: { xs: 2, md: 2 } }}>
                <Grid xs={12} md={6}>
                    <Controller
                        name="razaoSocialEnabled"
                        control={control}
                        render={({ field: switchField }) => (
                            <>
                                <Controller
                                    name="razaoSocial"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Razão Social"
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
                                    label="Desejo alterar minha Razão Social"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid xs={12} md={6}>
                    <Controller
                        name="nomeFantasiaEnabled"
                        control={control}
                        render={({ field: switchField }) => (
                            <>
                                <Controller
                                    name="nomeFantasia"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Nome Fantasia"
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
                                    label="Desejo alterar meu Nome Fantasia"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid xs={12} md={4}>
                    <Controller
                        name="cnpj"
                        control={control}
                        render={({ field }) => (
                            <NumericFormat
                                {...field}
                                format="99.999.999/9999-99"
                                label="CNPJ"
                                fullWidth
                                customInput={TextField}
                                disabled
                            />
                        )}
                    />
                </Grid>
                <Grid xs={12} md={4}>
                    <Controller
                        name="emailEnabled"
                        control={control}
                        render={({ field: switchField }) => (
                            <>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Email"
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
                                    label="Desejo alterar meu Email"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid xs={12} md={4}>
                    <Controller
                        name="whatsapp"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="Telefone Comercial"
                                placeholder="(00) 0 0000-0000"
                                disabled={!watch('whatsappEnabled')}
                                value={formatPhone(field.value || '')}
                                onChange={(e) => {
                                    const formatted = formatPhone(e.target.value);
                                    field.onChange(formatted);
                                }}
                                inputProps={{
                                    maxLength: 17,
                                }}
                            />
                        )}
                    />
                    <Controller
                        name="whatsappEnabled"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                sx={{ mb: 1 }}
                                control={
                                    <Switch
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        name={field.name}
                                        inputRef={field.ref}
                                    />
                                }
                                label="Desejo alterar meu Whatsapp"
                            />
                        )}
                    />
                </Grid>
                <Grid xs={12} md={6}>
                    <Controller
                        name="capitalSocialEnabled"
                        control={control}
                        render={({ field: switchField }) => (
                            <>
                                <Controller
                                    name="capitalSocial"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            fullWidth
                                            label="Capital Social"
                                            prefix="R$ "
                                            decimalSeparator=","
                                            thousandSeparator="."
                                            decimalScale={2}
                                            fixedDecimalScale
                                            customInput={TextField}
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
                                    label="Desejo alterar meu Capital Social"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid xs={12} md={6}>
                    <Controller
                        name="regimeTributarioEnabled"
                        control={control}
                        render={({ field: switchField }) => (
                            <>
                                <Controller
                                    name="regimeTributario"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            labelId="regime-tributario-label"
                                            fullWidth
                                            disabled={!switchField.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            value={field.value || ''}
                                        >
                                            {regimeTributarioOptions.map((option, index) => (
                                                <MenuItem key={index} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
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
                                    label="Desejo alterar meu Regime Tributário"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid xs={12} sm={6}>
                    {/* Controller para formaAtuacao */}
                    <Controller
                        name="formaAtuacao"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                fullWidth
                                label="Forma de Atuação"
                                disabled={!watch('formaAtuacaoEnabled')}
                            >
                                {formaAtuacaoOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />

                    {/* Controller para o Switch */}
                    <Controller
                        name="formaAtuacaoEnabled"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                sx={{ mb: 1 }}
                                control={
                                    <Switch
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                }
                                label="Desejo alterar minha Forma de Atuação"
                            />
                        )}
                    />
                </Grid>
                <Grid xs={12} sm={6}>
                    <Controller
                        name="responsavelTecnico"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                fullWidth
                                label="Responsável Técnico"
                                disabled={!watch('responsavelTecnicoEnabled')}
                            >
                                <MenuItem value="novoResponsavelTecnico">
                                    <em>Adicionar Novo Responsável Técnico</em>
                                </MenuItem>

                                {socios.map((socio, index) => (
                                    <MenuItem key={index} value={socio.nome}>
                                        {socio.nome}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />

                    {/* Texto adicional se for novo */}
                    {watch('responsavelTecnico') === 'novoResponsavelTecnico' && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Anexe o comprovante de classe no campo indicado ao final do formulário.
                        </Typography>
                    )}

                    {/* SWITCH */}
                    <Controller
                        name="responsavelTecnicoEnabled"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                sx={{ mb: 1 }}
                                control={
                                    <Switch
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                }
                                label="Desejo alterar meu Responsável Técnico"
                            />
                        )}
                    />
                </Grid>
            </Grid>
        </>
    );
}
