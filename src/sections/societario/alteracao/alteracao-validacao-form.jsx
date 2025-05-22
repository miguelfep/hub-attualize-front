import { toast } from 'sonner';
import InputMask from 'react-input-mask';
import React, { useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm, Controller } from 'react-hook-form';

import { Box, Grid, Card, Stack, Button, Switch, MenuItem, TextField, Typography, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { consultarCep } from 'src/utils/consultarCep';

import { updateAlteracao, uploadArquivoAlteracao, deletarArquivoAlteracao, downloadArquivoAlteracao } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';



export default function AlteracaoValidacaoForm({ currentAlteracao, handleAdvanceStatus }) {

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

    const etniaOptions = [
        { value: "branca", label: "Branca" },
        { value: "preta", label: "Preta" },
        { value: "parda", label: "Parda" },
        { value: "amarela", label: "Amarela" },
        { value: "indigena", label: "Indigena" },
        { value: "prefiroNaoInformar", label: "Prefiro não informar" },
    ];

    const grauEscolaridadeOptions = [
        { value: "semInstrucao", label: "Sem Instrução" },
        { value: "fundamentalIncompleto", label: "Ensino Fundamental Incompleto" },
        { value: "fundamentalCompleto", label: "Ensino Fundamental Completo" },
        { value: "medioIncompleto", label: "Ensino Médio Incompleto" },
        { value: "medioCompleto", label: "Ensino Médio Completo" },
        { value: "superiorIncompleto", label: "Ensino Superior Incompleto" },
        { value: "superiorCompleto", label: "Ensino Superior Completo" },
        { value: "posGraduacao", label: "Pós-graduação" },
        { value: "mestrado", label: "Mestrado" },
        { value: "doutorado", label: "Doutorado" },
        { value: "prefiroNaoInformar", label: "Prefiro não informar" },
  ];

    const { control, handleSubmit, reset, getValues, setValue, watch } = useForm({
        defaultValues: {
            id: currentAlteracao?._id || '',
            alteracoes: currentAlteracao?.alteracoes || [],
            razaoSocial: currentAlteracao?.razaoSocial || '',
            nomeFantasia: currentAlteracao?.nomeFantasia || '',
            email: currentAlteracao?.email || '',
            whatsapp: currentAlteracao?.whatsapp || '',
            capitalSocial: currentAlteracao?.capitalSocial || '',
            regimeTributario: currentAlteracao?.regimeTributario || '',
            formaAtuacao: currentAlteracao?.formaAtuacao || '',
            cep: currentAlteracao?.enderecoComercial?.cep || currentAlteracao?.cliente?.[0]?.endereco?.cep || '',
            logradouro: currentAlteracao?.enderecoComercial?.logradouro?.logradouro || currentAlteracao?.cliente?.[0]?.endereco?.cidade || '',
            numero: currentAlteracao?.enderecoComercial?.numero || currentAlteracao?.cliente?.[0]?.endereco?.numero || '',
            complemento: currentAlteracao?.enderecoComercial?.complemento || currentAlteracao?.cliente?.[0]?.endereco?.complemento || '',
            bairro: currentAlteracao?.enderecoComercial?.bairro || currentAlteracao?.cliente?.[0]?.endereco?.bairro || '',
            cidade: currentAlteracao?.enderecoComercial?.cidade || currentAlteracao?.cliente?.[0]?.endereco?.cidade || '',
            estado: currentAlteracao?.enderecoComercial?.estado || currentAlteracao?.cliente?.[0]?.endereco?.estado || '',
        },
        novasAtividades: currentAlteracao?.novasAtividades || '',
        socios: currentAlteracao?.socios?.length > 0
            ? currentAlteracao.socios.map(socio => ({
                nome: socio?.nome || '',
                cpf: socio?.cpf || '',
                cnh: socio?.cnh || '',
                cnhAnexo: socio?.cnhAnexo || '',
                comprovanteEnderecoAnexo: socio?.comprovanteEnderecoAnexo || '',
                rg: socio?.rg || '',
                estadoCivil: socio?.estadoCivil || '',
                naturalidade: socio?.naturalidade || '',
                porcentagem: Number(socio?.porcentagem) || 0,
                regimeBens: socio?.regimeBens || '',
                etnia: socio?.etnia || '',
                grau_escolaridade: socio?.grau_escolaridade || '',
                endereco: socio?.endereco || '',
                profissao: socio?.profissao || '',
                administrador: socio?.administrador || false,
            }))
            : [
                {
                    nome: '',
                    cpf: '',
                    cnh: '',
                    cnhAnexo: '',
                    comprovanteEnderecoAnexo: '',
                    rg: '',
                    estadoCivil: '',
                    naturalidade: '',
                    porcentagem: 0,
                    regimeBens: '',
                    endereco: '',
                    profissao: '',
                    administrador: false,
                },
            ],
        responsavelTecnico: currentAlteracao?.responsavelTecnico || '',
        possuiRT: currentAlteracao?.possuiRT || false,
        marcaRegistrada: currentAlteracao?.marcaRegistrada || false,
        anotacoes: currentAlteracao?.anotacoes || '',
        urlMeetKickoff: currentAlteracao?.urlMeetKickoff || '',
    },
    );

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
                            name="razaoSocial" responsave
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
                            name="whatsapp"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Whatsapp" fullWidth variant="outlined" />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="capitalSocial"
                            control={control}
                            render={({ field }) => (
                                <NumericFormat {...field} label="Capital Social" customInput={TextField} thousandSeparator="." decimalScale={2} fixedDecimalScale prefix="R$" decimalSeparator="," fullWidth variant="outlined" />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="regimeTributario"
                            control={control}
                            render={({ field }) => (
                                <TextField select {...field} label="Regime Tributário" fullWidth variant="outlined">
                                    {regimeTributarioOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
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
                                <TextField select {...field} label="Forma de Atuação" fullWidth variant="outlined">
                                    {formaAtuacaoOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
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
                                <TextField select {...field} value={field.value || ''} label="Responsável Técnico" fullWidth variant="outlined">
                                    <MenuItem value="responsavelTecnico">Novo Responsável Técnico</MenuItem>
                                    {currentAlteracao?.socios?.map((socio, index) => (
                                        <MenuItem key={index} value={socio.nome}>{socio.nome}</MenuItem>
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


                    {getValues('socios')?.map((socio, index) => {
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
                                        name={`socios[${index}].etnia`}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                select
                                                {...field}
                                                label="Raça/Cor"
                                                fullWidth
                                                variant="outlined"
                                            >
                                                {etniaOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name={`socios[${index}].grau_escolaridade`}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                select
                                                {...field}
                                                label="Grau de Escolaridade"
                                                fullWidth
                                                variant="outlined"
                                            >
                                                {grauEscolaridadeOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
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
                                <Grid container spacing={2} sx={{ mt: 2, mb: 4, px: 2 }}>
                                    <Grid item xs={6}>
                                        <Controller
                                            name={`socios.${index}.cnhAnexo`}
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
                                                        <strong>CNH do Sócio</strong>
                                                    </Typography>
                                                    <Box>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            fullWidth
                                                            sx={{ mb: 1 }}
                                                            // disabled={!watch(`socios.${index}.socioEnabled`)}
                                                            onClick={() => handleUpload('cnhAnexo', index)}
                                                        >
                                                            Enviar Anexo
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            fullWidth
                                                            // disabled={!watch(`socios.${index}.socioEnabled`) || !value}
                                                            onClick={() => handleDelete('cnhAnexo', index)}
                                                        >
                                                            Deletar
                                                        </Button>
                                                        {value && (
                                                            <Button
                                                                variant="outlined"
                                                                fullWidth
                                                                sx={{ mt: 1 }}
                                                                onClick={() => handleDownload('cnhAnexo', index)}
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

                                    {/* Bloco para Comprovante de Endereço */}
                                    <Grid item xs={6}>
                                        <Controller
                                            name={`socios.${index}.comprovanteEnderecoAnexo`}
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
                                                        <strong>Comprovante de Endereço do Sócio</strong>
                                                    </Typography>
                                                    <Box>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            fullWidth
                                                            sx={{ mb: 1 }}
                                                            // disabled={!watch(`socios.${index}.socioEnabled`)}
                                                            onClick={() => handleUpload('comprovanteEnderecoAnexo', index)}
                                                        >
                                                            Enviar Anexo
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            fullWidth
                                                            // disabled={!watch(`socios.${index}.socioEnabled`) || !value}
                                                            onClick={() => handleDelete('comprovanteEnderecoAnexo', index)}
                                                        >
                                                            Deletar
                                                        </Button>
                                                        {value && (
                                                            <Button
                                                                variant="outlined"
                                                                fullWidth
                                                                sx={{ mt: 1 }}
                                                                onClick={() => handleDownload('comprovanteEnderecoAnexo', index)}
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

                <Grid container spacing={2} mt={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6">Documentos</Typography>
                    </Grid>
                </Grid>

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

                {currentAlteracao.statusAlteracao === 'em_validacao' &&
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
                }
            </>
        </Card >
    );
}