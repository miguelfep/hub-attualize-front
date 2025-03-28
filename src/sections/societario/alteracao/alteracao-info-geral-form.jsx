import InputMask from 'react-input-mask'
import { NumericFormat } from 'react-number-format';
import { Controller, useFormContext } from "react-hook-form"

import { Box, Grid, Switch, Select, MenuItem, TextField, Typography, FormControlLabel } from "@mui/material";

export default function AlteracaoInfoGeralForm({ infoGeralAlteracao }) {

    const { control } = useFormContext();

    const regimeTributarioOptions = [
        { value: 'Simples Nacional', label: 'Simples Nacional' },
        { value: 'Lucro Presumido', label: 'Lucro Presumido' },
        { value: 'Lucro Real', label: 'Lucro Real' },
    ];

    const formaAtuacaoOptions = [
        { value: 'Internet', label: 'Internet' },
        { value: 'Fora do estabelecimento', label: 'Fora do estabelecimento' },
        { value: 'Escritório administrativo', label: 'Escritório administrativo' },
        { value: 'Local próprio', label: 'Local próprio' },
        { value: 'Em estabelecimento de terceiros', label: 'Em estabelecimento de terceiros' },
        { value: 'Casa do cliente', label: 'Casa do cliente' },
        { value: 'Outros', label: 'Outros' },
    ]


    return (
        <>
            <Box>
                <Controller
                    name="descricao"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Descrição da Alteração"
                            multiline rows={2}
                            placeholder="Digite brevemente as alterações que deseja fazer"
                            fullWidth
                        />
                    )}
                />
            </Box>
            <Grid container spacing={3} sx={{ mt: { xs: 2, md: 2 } }}>
                <Grid item xs={12} md={6}>
                    <Controller
                        name="nomeEmpresarialEnabled"
                        control={control}
                        render={({ field: switchField }) => (
                            <>
                                <Controller
                                    name="nomeEmpresarial"
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
                                    label="Editar Razão Social"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
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
                                    label="Editar Nome Fantasia"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Controller
                        name="cnpj"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="CNPJ"
                                disabled
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
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
                                    label="Editar Email"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Controller
                        name="telefoneComercialEnabled"
                        control={control}
                        render={({ field: switchField }) => (
                            <>
                                <Controller
                                    name="telefoneComercial"
                                    control={control}
                                    render={({ field }) => (
                                        <InputMask
                                            {...field}
                                            mask="(99) 9 9999-9999"
                                            disabled={!switchField.value}
                                        >
                                            {(inputProps) => (
                                                <TextField
                                                    {...inputProps}
                                                    fullWidth
                                                    label="Telefone Comercial"
                                                    disabled={!switchField.value}
                                                />
                                            )}
                                        </InputMask>
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
                                    label="Editar Telefone Comercial"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
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
                                    label="Editar Capital Social"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
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
                                    label="Editar Regime Tributário"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller
                        name="formaAtuacaoEnabled"
                        control={control}
                        render={({ field: switchField }) => (
                            <>
                                <TextField
                                    {...switchField}
                                    name="formaAtuacao"
                                    select
                                    fullWidth
                                    label="Forma de Atuação"
                                    disabled={!switchField.value}
                                >
                                    {formaAtuacaoOptions.map((option) =>
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    )}
                                </TextField>
                                <FormControlLabel
                                    sx={{ mb: 1 }}
                                    control={
                                        <Switch
                                            checked={switchField.value}
                                            onChange={(e) => switchField.onChange(e.target.checked)}
                                        />
                                    }
                                    label="Editar Forma de Atuação"
                                />
                            </>
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller
                        name="responsavelTecnicoEnabled"
                        control={control}
                        render={({ field: switchField }) => (
                            <>
                                <TextField
                                    {...switchField}
                                    name="responsavelTecnico"
                                    select
                                    fullWidth
                                    label="Responsável Técnico"
                                    disabled={!switchField.value}
                                >
                                    <MenuItem value="novoResponsavelTecnico"> 
                                        <em>
                                            Adicionar Novo Responsável Técnico
                                        </em>
                                    </MenuItem>

                                    {
                                        infoGeralAlteracao.socios.map((socio, index) => (
                                            <MenuItem key={index} value={socio.nome}>
                                                {socio.nome}
                                            </MenuItem>
                                        ))
                                    }
                                </TextField>

                                {switchField.value === 'novoResponsavelTecnico' && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Anexe o comprovante de classe e o comprovante de residência do novo responsável nos campos indicados no fim do formulário.
                                    </Typography>
                                )}
                                <FormControlLabel
                                    sx={{ mb: 1 }}
                                    control={
                                        <Switch
                                            checked={switchField.value}
                                            onChange={(e) => switchField.onChange(e.target.checked)}
                                        />
                                    }
                                    label="Editar Responsável Técnico"
                                />
                            </>
                        )}
                    />

                </Grid>
            </Grid >
        </>
    );
}
