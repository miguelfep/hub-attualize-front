import React from "react";
import { toast } from "sonner";
import InputMask from "react-input-mask";
import { NumericFormat } from "react-number-format";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { Box, Grid, Button, Switch, Select, Divider, MenuItem, TextField, Typography, InputLabel, FormControl, FormControlLabel } from "@mui/material";

import { uploadArquivo, deletarArquivo, downloadArquivo } from "src/actions/mockalteracoes";

export default function AlteracaoQuadroSocioetarioForm({ aberturaId }) {
    const { control, watch, setValue, getValues } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "socios",
    });

    const estadoCivilOptions = [
        { value: "Solteiro", label: "Solteiro" },
        { value: "Casado", label: "Casado" },
        { value: "Divorciado", label: "Divorciado" },
        { value: "Viuvo", label: "Viúvo" },
        { value: "Uniao Estavel", label: "União Estável" },
    ];

    const handleUpload = async (index) => {
        try {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".pdf";
            fileInput.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    try {
                        const response = await uploadArquivo(aberturaId, `socios.${index}.cnhAnexo`, file);
                        if (response.status === 200) {
                            setValue(`socios.${index}.cnhAnexo`, response.data);
                            toast.success(`CNH do Sócio ${index + 1} enviada com sucesso!`);
                        } else {
                            throw new Error("Erro ao enviar arquivo.");
                        }
                    } catch (error) {
                        toast.error(`Erro ao enviar CNH do Sócio ${index + 1}.`);
                    }
                }
            };
            fileInput.click();
        } catch (error) {
            toast.error(`Erro ao iniciar o envio da CNH do Sócio ${index + 1}.`);
        }
    };

    const handleDownload = async (index) => {
        try {
            const fileUrl = getValues(`socios.${index}.cnhAnexo`);
            if (!fileUrl) throw new Error("Arquivo não disponível para download.");

            const filename = fileUrl.split("/").pop();
            const response = await downloadArquivo(aberturaId, `socios.${index}.cnhAnexo`, filename);
            if (response?.data) {
                const blob = new Blob([response.data], { type: response.data.type });
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
                toast.success(`CNH do Sócio ${index + 1} baixada com sucesso.`);
            } else {
                throw new Error("Erro ao baixar arquivo.");
            }
        } catch (error) {
            toast.error(`Erro ao baixar CNH do Sócio ${index + 1}.`);
        }
    };

    const handleDelete = async (index) => {
        try {
            const response = await deletarArquivo(aberturaId, `socios.${index}.cnhAnexo`);
            if (response.status === 200) {
                setValue(`socios.${index}.cnhAnexo`, "");
                toast.success(`CNH do Sócio ${index + 1} deletada com sucesso.`);
            } else {
                throw new Error("Erro ao deletar arquivo.");
            }
        } catch (error) {
            toast.error(`Erro ao deletar CNH do Sócio ${index + 1}.`);
        }
    };

    const handleNumeroSociosChange = (event) => {
        const novoNumero = event.target.value;
        const currentLength = fields.length;

        if (novoNumero > currentLength) {
            const novosSocios = Array(novoNumero - currentLength).fill({
                nome: "",
                cpf: "",
                rg: "",
                cnh: "",
                endereco: "",
                profissao: "",
                porcentagem: "",
                naturalidade: "",
                estadoCivil: "",
                administrador: false,
                regimeBens: "",
                cnhAnexo: "",
            });
            append(novosSocios);
        } else if (novoNumero < currentLength) {
            remove([...Array(currentLength - novoNumero).keys()].map(i => currentLength - 1 - i));
        }
    };

    return (
        <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={12}>
                <TextField
                    select
                    fullWidth
                    label="Número de Sócios"
                    value={fields.length}
                    onChange={handleNumeroSociosChange}
                    required
                >
                    {[...Array(10).keys()].map((i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                            {i + 1}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>

            {fields.map((socio, index) => (
                <React.Fragment key={socio.id}>
                    <Grid item xs={12}>
                        <Typography variant="h6">{`Dados do Sócio ${index + 1}`}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Controller
                            name={`socios.${index}.nome`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nome"
                                    fullWidth
                                    disabled={!watch(`socioEnabled.${index}`)}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Controller
                            name={`socios.${index}.cpf`}
                            control={control}
                            render={({ field }) => (
                                <InputMask
                                    mask="999.999.999-99"
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={!watch(`socioEnabled.${index}`)}
                                >
                                    {(inputProps) => <TextField {...inputProps} label="CPF" fullWidth disabled={!watch(`socioEnabled.${index}`)}
                                    />}
                                </InputMask>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Controller
                            name={`socios.${index}.rg`}
                            control={control}
                            render={({ field }) => (
                                <InputMask
                                    mask="99.999.999-9"
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={!watch(`socioEnabled.${index}`)}
                                >
                                    {(inputProps) => <TextField {...inputProps} label="RG" fullWidth disabled={!watch(`socioEnabled.${index}`)}
                                    />}
                                </InputMask>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Controller
                            name={`socios.${index}.cnh`}
                            control={control}
                            render={({ field }) => (
                                <InputMask
                                    mask="999999999"
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={!watch(`socioEnabled.${index}`)}
                                >
                                    {(inputProps) => <TextField {...inputProps} label="CNH" fullWidth disabled={!watch(`socioEnabled.${index}`)}
                                    />}
                                </InputMask>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <Controller
                            name={`socios.${index}.endereco`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Endereço"
                                    fullWidth
                                    disabled={!watch(`socioEnabled.${index}`)}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Controller
                            name={`socios.${index}.profissao`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Profissão"
                                    fullWidth
                                    disabled={!watch(`socioEnabled.${index}`)}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Controller
                            name={`socios.${index}.porcentagem`}
                            control={control}
                            render={({ field }) => (
                                <NumericFormat
                                    {...field}
                                    customInput={TextField}
                                    label="Porcentagem"
                                    decimalScale={2}
                                    allowNegative={false}
                                    max={99.99}
                                    decimalSeparator="."
                                    suffix="%"
                                    fullWidth
                                    disabled={!watch(`socioEnabled.${index}`)}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={6} sm={12}>
                        <Controller
                            name={`socios.${index}.naturalidade`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Naturalidade"
                                    fullWidth
                                    disabled={!watch(`socioEnabled.${index}`)}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={6} sm={12}>
                        <Controller
                            name={`socioEnabled.${index}`}
                            control={control}
                            defaultValue={false}
                            render={({ field: switchField }) => (
                                <>
                                    <FormControl fullWidth>
                                        <InputLabel id={`estado-civil-select-label-${index}`}>Estado Civil</InputLabel>
                                        <Controller
                                            name={`socios.${index}.estadoCivil`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    labelId={`estado-civil-select-label-${index}`}
                                                    label="Estado Civil"
                                                    fullWidth
                                                    disabled={!switchField.value}
                                                    value={field.value || ""}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>Selecione uma opção</em>
                                                    </MenuItem>
                                                    {estadoCivilOptions.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </FormControl>

                                    {watch(`socios.${index}.estadoCivil`) === "Casado" && (
                                        <Grid item xs={6} sm={12} sx={{ mt: 3 }}>
                                            <Controller
                                                name={`socios.${index}.regimeBens`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        select
                                                        label="Regime de Bens"
                                                        value={field.value || ""}
                                                        onChange={field.onChange}
                                                        fullWidth
                                                        disabled={!watch(`socioEnabled.${index}`)}
                                                    >
                                                        <MenuItem value="Comunhão Parcial de Bens">Comunhão Parcial de Bens</MenuItem>
                                                        <MenuItem value="Comunhão Universal de Bens">Comunhão Universal de Bens</MenuItem>
                                                        <MenuItem value="Separação Total de Bens">Separação Total de Bens</MenuItem>
                                                    </TextField>
                                                )}
                                            />
                                        </Grid>
                                    )}

                                    <Grid item xs={12} sm={12} md={12} key={`socios.${index}.cnhAnexo`}>
                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                padding: 2,
                                                textAlign: 'center',
                                                marginTop: 3,
                                                marginBottom: 2
                                            }}
                                        >
                                            <Typography variant="subtitle1" gutterBottom>
                                                CNH
                                            </Typography>
                                            <Box>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    sx={{ mb: 1 }}
                                                    disabled={!switchField.value}
                                                    onClick={() => handleUpload(index, 'cnhAnexo')}
                                                >
                                                    Enviar Anexo
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    disabled={!switchField.value}
                                                    onClick={() => handleDelete(index, 'cnhAnexo')}
                                                >
                                                    Deletar
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios.${index}.administrador`}
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={field.value || false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            disabled={!switchField.value}
                                                        />
                                                    }
                                                    label="É Administrador?"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            sx={{ mb: 1 }}
                                            control={
                                                <Switch
                                                    checked={switchField.value}
                                                    onChange={(e) => switchField.onChange(e.target.checked)}
                                                />
                                            }
                                            label="Editar Sócio"
                                        />
                                    </Grid>
                                </>
                            )}
                        />
                    </Grid>

                    {index < fields.length - 1 && (
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Divider />
                            </Box>
                        </Grid>
                    )}
                </React.Fragment>
            ))}
        </Grid>
    );
}