import { toast } from 'sonner';
import InputMask from 'react-input-mask';
import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm, Controller } from 'react-hook-form';

import { Box, Tab, Grid, Card, Tabs, Stack, Button, Switch, MenuItem, TextField, Typography, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { consultarCep } from 'src/utils/consultarCep';

import { updateAlteracao, uploadArquivoAlteracao, deletarArquivoAlteracao, downloadArquivoAlteracao } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

export default function AlteracaoKickoffForm({ currentAlteracao, handleAdvanceStatus }) {
    const loading = useBoolean();

    const validateFile = (file) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!allowedTypes.includes(file.type)) {
            return 'Tipo de arquivo não permitido. Use PDF, JPEG ou PNG.';
        }
        if (file.size > maxSize) {
            return 'Arquivo muito grande. O tamanho máximo é 5MB.';
        }
        return null;
    };

    const getDocumentLabel = (type, index) => {
        const labels = {
            cnhAnexo: `CNH do Sócio ${index + 1}`,
            comprovanteEnderecoAnexo: `Comprovante de Endereço do Sócio ${index + 1}`,
            rgAnexo: `RG do Representante`,
            iptuAnexo: `IPTU do Imóvel`,
            documentoRT: `Documento de Classe (Responsável Técnico)`,
        };
        return labels[type] || `Documento desconhecido (tipo: ${type || 'indefinido'})`;
    };

    const getDocumentPath = (documentType, index) =>
        index != null ? `socios.${index}.${documentType}` : documentType;


    const handleUpload = async (documentType, index = null) => {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf,image/*';
            fileInput.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const validationError = validateFile(file);
                    if (validationError) {
                        toast.error(validationError);
                        return;
                    }

                    const response = await uploadArquivoAlteracao(
                        currentAlteracao._id,
                        documentType,
                        file,
                        index
                    );

                    if (response.status === 200) {
                        const path = getDocumentPath(documentType, index);
                        setValue(path, response.data.filename);
                        toast.success(`${getDocumentLabel(documentType, index)} enviado com sucesso!`);
                    } else {
                        throw new Error(response.data?.error || 'Erro ao enviar arquivo.');
                    }
                }
            };
            fileInput.click();
        } catch (error) {
            toast.error(`Erro ao enviar ${getDocumentLabel(documentType, index)}.`);
        }
    };

    const handleDownload = async (documentType, index = null) => {
        try {
            const path = getDocumentPath(documentType, index);
            const fileUrl = getValues(path);
            if (!fileUrl) throw new Error('Arquivo não disponível para download.');
            const filename = fileUrl.split('/').pop();

            const response = await downloadArquivoAlteracao(
                currentAlteracao._id,
                documentType,
                filename,
                index
            );

            if (response?.data) {
                const blob = new Blob([response.data], { type: response.data.type });
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
                toast.success(`${getDocumentLabel(documentType, index)} baixado com sucesso.`);
            }
        } catch (error) {
            toast.error(`Erro ao baixar ${getDocumentLabel(documentType, index)}.`);
        }
    };

    const handleDelete = async (documentType, index = null) => {
        try {
            const path = getDocumentPath(documentType, index);
            const response = await deletarArquivoAlteracao(
                currentAlteracao._id,
                path
            );
            if (response.status === 200) {
                setValue(path, '');
                toast.success(`${getDocumentLabel(documentType, index)} deletado com sucesso.`);
            }
        } catch (error) {
            toast.error(`Erro ao deletar ${getDocumentLabel(documentType, index)}.`);
        }
    };



    const regimeBensOptions = [
        { value: 'Comunhão Parcial de Bens', label: 'Comunhão Parcial de Bens' },
        { value: 'Comunhão Universal de Bens', label: 'Comunhão Universal de Bens' },
        { value: 'Separação Total de Bens', label: 'Separação Total de Bens' },
    ];

    const estadoCivilOptions = [
        { value: 'Solteiro', label: 'Solteiro' },
        { value: 'Casado', label: 'Casado' },
        { value: 'Divorciado', label: 'Divorciado' },
        { value: 'Viuvo', label: 'Viuvo' },
    ];

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

    const { control, handleSubmit, reset, getValues, watch, setValue } = useForm({
        defaultValues: {
            id: currentAlteracao?._id || '',
            alteracoes: currentAlteracao?.alteracoes || [],
            razaoSocial: currentAlteracao?.nomeEmpresarial || '',
            nomeFantasia: currentAlteracao?.nomeFantasia || '',
            email: currentAlteracao?.email || '',
            telefoneComercial: currentAlteracao?.telefoneComercial || '',
            capitalSocial: currentAlteracao?.capitalSocial || '',
            regimeTributario: currentAlteracao?.regimeTributario || '',
            formaAtuacao: currentAlteracao?.formaAtuacao || '',
            enderecoComercial: {
                cep: currentAlteracao?.cep || '',
                logradouro: currentAlteracao?.logradouro || '',
                numero: currentAlteracao?.numero || '',
                complemento: currentAlteracao?.complemento || '',
                bairro: currentAlteracao?.bairro || '',
                cidade: currentAlteracao?.cidade || '',
                estado: currentAlteracao?.estado || '',
            },
            novasAtividades: currentAlteracao?.novasAtividades || '',
            socios: currentAlteracao?.socios?.length > 0
                ? currentAlteracao.socios.map(socio => ({
                    nome: socio?.nome || '',
                    cpf: socio?.cpf || '',
                    cnh: socio?.cnh || '',
                    cnhAnexo: socio?.cnhAnexo || '',
                    rg: socio?.rg || '',
                    estadoCivil: socio?.estadoCivil || '',
                    naturalidade: socio?.naturalidade || '',
                    porcentagem: Number(socio?.porcentagem) || 0,
                    regimeBens: socio?.regimeBens || '',
                    endereco: socio?.endereco || '',
                    profissao: socio?.profissao || '',
                    administrador: socio?.administrador || false,
                }))
                : [],
            responsavelTecnico: currentAlteracao?.responsavelTecnico || '',
            possuiRT: currentAlteracao?.possuiRT || false,
            marcaRegistrada: currentAlteracao?.marcaRegistrada || false,
            notificarWhats: currentAlteracao?.notificarWhatsapp || false,
            anotacoes: currentAlteracao?.anotacoes || '',
            urlMeetKickoff: currentAlteracao?.urlMeetKickoff || '',
        },
    });

    const [activeTab, setActiveTab] = useState(0);
    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    useEffect(() => {
        if (currentAlteracao) {
            reset(currentAlteracao);
        }
    }, [currentAlteracao, reset]);

    const handleCepBlur = async () => {
        const cep = getValues('enderecoComercial.cep').replace('-', '');
        if (cep.length === 8) {
            loading.onTrue();
            try {
                const data = await consultarCep(cep);
                if (data.erro) {
                    toast.error('CEP não encontrado');
                } else {
                    reset((prev) => ({
                        ...prev,
                        enderecoComercial: {
                            ...prev.enderecoComercial,
                            logradouro: data.logradouro || '',
                            complemento: data.complemento || '',
                            bairro: data.bairro || '',
                            cidade: data.localidade || '',
                            estado: data.uf || '',
                        },
                    }));
                }
            } catch (error) {
                toast.error('Erro ao buscar o CEP');
            } finally {
                loading.onFalse();
            }
        }
    };

    const handleSave = async () => {
        loading.onTrue();
        try {
            const dataToSave = { ...getValues() };
            await updateAlteracao(currentAlteracao._id, dataToSave, { statusAlteracao: 'kickoff' });
            toast.success('Dados salvos com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar os dados');
        } finally {
            loading.onFalse();
        }
    };

    const onSave = async (data) => {
        loading.onTrue();
        try {
            await updateAlteracao(currentAlteracao._id, data);
            toast.success('Dados salvos com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar os dados');
        } finally {
            loading.onFalse();
        }
    };

    const onApprove = async (data) => {
        loading.onTrue();
        try {
            await updateAlteracao(currentAlteracao._id, { ...data, statusAlteracao: 'kickoff', somenteAtualizar: false });
            toast.success('Alteração aprovada!');
            if (handleAdvanceStatus) handleAdvanceStatus('kickoff');
        } catch (error) {
            toast.error('Erro ao aprovar a alteração');
        } finally {
            loading.onFalse();
        }
    };

    const onReject = async (data) => {
        loading.onTrue();
        try {
            await updateAlteracao(currentAlteracao._id, { ...data, statusAlteracao: 'iniciado' });
            toast.error('Alteração reprovada!');
            if (handleAdvanceStatus) handleAdvanceStatus('iniciado');
        } catch (error) {
            toast.error('Erro ao reprovar a alteração');
        } finally {
            loading.onFalse();
        }
    };

    return (
        <Card sx={{ p: 3, mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Dados da Alteração" />
                <Tab label="Kickoff" />
            </Tabs>
            {activeTab === 0 && (
                <>
                    <Grid container spacing={2} mt={2}>
                        <Grid item xs={12}>
                            <Controller
                                name="alteracoes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Alterações"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="razaoSocial"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Razão Social" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="nomeFantasia"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Nome Fantasia" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="E-mail" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="telefoneComercial"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Telefone Comercial" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="capitalSocial"
                                control={control}
                                render={({ field }) => (
                                    <NumericFormat
                                        {...field}
                                        label="Capital Social"
                                        customInput={TextField}
                                        thousandSeparator="."
                                        decimalScale={2}
                                        fixedDecimalScale
                                        prefix="R$"
                                        decimalSeparator=","
                                        fullWidth
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="regimeTributario"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        label="Regime Tributário"
                                        fullWidth
                                        variant="outlined"
                                    >
                                        {regimeTributarioOptions.map((option, index) => (
                                            <MenuItem key={index} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="formaAtuacao"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        label="Forma de Atuação"
                                        fullWidth
                                        variant="outlined"
                                    >
                                        {formaAtuacaoOptions.map((option, index) => (
                                            <MenuItem key={index} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="responsavelTecnico"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        label="Responsável Técnico"
                                        fullWidth
                                        variant="outlined"
                                    >
                                        <MenuItem value="novoResponsavelTecnico">Novo Responsável Técnico</MenuItem>
                                        {currentAlteracao?.socios.map((socio, index) => (
                                            <MenuItem key={index} value={socio.nome}>
                                                {socio.nome}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6">Endereço Comercial</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Controller
                                name="enderecoComercial.cep"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="CEP"
                                        fullWidth
                                        variant="outlined"
                                        onBlur={handleCepBlur}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={8}>
                            <Controller
                                name="enderecoComercial.logradouro"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Logradouro" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.numero"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Número" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.complemento"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Complemento" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.bairro"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Bairro" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="enderecoComercial.cidade"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Cidade" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="enderecoComercial.estado"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Estado" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6">Informações dos Sócios</Typography>
                        </Grid>

                        {getValues('socios').map((socio, index) => {
                            const estadoCivilValue = watch(`socios[${index}].estadoCivil`);

                            return (
                                <React.Fragment key={index}>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].nome`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} label="Nome" fullWidth variant="outlined" />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].cpf`}
                                            control={control}
                                            render={({ field }) => (
                                                <InputMask {...field} mask="999.999.999-99">
                                                    {(inputProps) => (
                                                        <TextField {...inputProps} label="CPF" fullWidth variant="outlined" />
                                                    )}
                                                </InputMask>
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].rg`}
                                            control={control}
                                            render={({ field }) => (
                                                <InputMask {...field} mask="99.999.999-9">
                                                    {(inputProps) => (
                                                        <TextField {...inputProps} label="RG" fullWidth variant="outlined" />
                                                    )}
                                                </InputMask>
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].naturalidade`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label={`Naturalidade Sócio ${index + 1}`}
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].porcentagem`}
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    customInput={TextField}
                                                    label={`Porcentagem Sócio ${index + 1}`}
                                                    fullWidth
                                                    variant="outlined"
                                                    decimalScale={2}
                                                    suffix="%"
                                                    value={field.value}
                                                    onValueChange={(values) => field.onChange(values.floatValue)}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].estadoCivil`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select
                                                    {...field}
                                                    label="Estado Civil"
                                                    fullWidth
                                                    variant="outlined"
                                                >
                                                    {estadoCivilOptions.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                    {estadoCivilValue === 'Casado' && (
                                        <Grid item xs={12} sm={6}>
                                            <Controller
                                                name={`socios[${index}].regimeBens`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        select
                                                        {...field}
                                                        label={`Regime de Bens Sócio ${index + 1}`}
                                                        fullWidth
                                                        variant="outlined"
                                                    >
                                                        {regimeBensOptions.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                )}
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].endereco`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label={`Endereço do Sócio ${index + 1}`}
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].profissao`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label={`Profissão Sócio ${index + 1}`}
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].cnh`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label={`CNH do Sócio ${index + 1}`}
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].administrador`}
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={<Switch {...field} checked={field.value} />}
                                                    label={`Sócio Administrador ${index + 1}`}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </React.Fragment>
                            );
                        })}
                        <Grid item xs={12}>
                            <Typography variant="h6">Atividades Econômicas</Typography>
                        </Grid>
                        <Grid item xs={12} mb={2}>
                            <Controller
                                name='novasAtividades'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Novas Atividades"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2} mt={2}>
                            <Grid item xs={6} sm={6}>
                                <Controller
                                    name='iptuAnexo'
                                    control={control}
                                    render={({ field: { value } }) => (
                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                padding: 2,
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography variant="subtitle1" gutterBottom>
                                                <strong>IPTU do Imóvel</strong>
                                            </Typography>
                                            <Box>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    sx={{ mb: 1 }}
                                                    onClick={() => handleUpload('iptuAnexo')}
                                                >
                                                    Enviar Anexo
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    onClick={() => handleDelete('iptuAnexo')}
                                                >
                                                    Deletar
                                                </Button>
                                                {value && (
                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        sx={{ mt: 1 }}
                                                        onClick={() => handleDownload('iptuAnexo')}
                                                    >
                                                        Baixar
                                                    </Button>
                                                )}
                                            </Box>
                                            {value && typeof value === 'string' && (
                                                <Box mt={2}>
                                                    <Typography variant="body2" noWrap>{value}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={6} sm={6}>
                                <Controller
                                    name='rgAnexo'
                                    control={control}
                                    render={({ field: { value } }) => (
                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                padding: 2,
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography variant="subtitle1" gutterBottom>
                                                <strong>RG do Representante</strong>
                                            </Typography>
                                            <Box>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    sx={{ mb: 1 }}
                                                    onClick={() => handleUpload('rgAnexo')}
                                                >
                                                    Enviar Anexo
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    onClick={() => handleDelete('rgAnexo')}
                                                >
                                                    Deletar
                                                </Button>
                                                {value && (
                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        sx={{ mt: 1 }}
                                                        onClick={() => handleDownload('rgAnexo')}
                                                    >
                                                        Baixar
                                                    </Button>
                                                )}
                                            </Box>
                                            {value && typeof value === 'string' && (
                                                <Box mt={2}>
                                                    <Typography variant="body2" noWrap>{value}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={6} sm={6}>
                                <Controller
                                    name='documentoRT'
                                    control={control}
                                    render={({ field: { value } }) => (
                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                padding: 2,
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography variant="subtitle1" gutterBottom>
                                                <strong>Documento de Classe (Responsável Técnico)</strong>
                                            </Typography>
                                            <Box>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    sx={{ mb: 1 }}
                                                    onClick={() => handleUpload('documentoRT')}
                                                >
                                                    Enviar Anexo
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    onClick={() => handleDelete('documentoRT')}
                                                >
                                                    Deletar
                                                </Button>
                                                {value && (
                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        sx={{ mt: 1 }}
                                                        onClick={() => handleDownload('documentoRT')}
                                                    >
                                                        Baixar
                                                    </Button>
                                                )}
                                            </Box>
                                            {value && typeof value === 'string' && (
                                                <Box mt={2}>
                                                    <Typography variant="body2" noWrap>{value}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                />
                            </Grid>
                        </Grid>

                    </Grid>
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="center">
                        <Button
                            variant="contained"
                            onClick={handleSubmit(onSave)}
                            disabled={loading.value}
                            startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                        >
                            Salvar
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleSubmit(onReject)}
                            disabled={loading.value}
                            startIcon={<Iconify icon="eva:close-circle-fill" />}
                        >
                            Reprovar
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleSubmit(onApprove)}
                            disabled={loading.value}
                            startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                        >
                            Aprovar
                        </Button>
                    </Stack>
                </>
            )
            }

            {
                activeTab === 1 && (
                    <>
                        <Grid container spacing={2} mt={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name="anotacoes"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Anotações"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Controller
                                    name="urlMeetKickoff"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="URL do Meet"
                                            fullWidth
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 3 }} justifyContent="center">
                            <Button variant="contained" onClick={handleSave} disabled={loading.value}>
                                Salvar
                            </Button>
                        </Stack>
                    </>
                )
            }
        </Card >
    );
}