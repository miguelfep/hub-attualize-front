import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm, Controller } from 'react-hook-form';

import { Tab, Tabs, Grid, Card, Stack, Button, Switch, Divider, MenuItem, TextField, Typography, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { consultarCep } from 'src/utils/consultarCep';
import { formatRg, formatCpf } from 'src/utils/format-input';

import { updateAlteracao } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

export default function AlteracaoFinalizadoForm({ currentAlteracao, handleAdvanceStatus }) {
    const loading = useBoolean();

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

    const { control, handleSubmit, reset, getValues, watch } = useForm({
        defaultValues: {
            id: currentAlteracao?._id || '',
            alteracoes: currentAlteracao?.alteracoes || [],
            statusAlteracao: currentAlteracao?.statusAlteracao || '',
            situacaoAlteracao: currentAlteracao?.situacaoAlteracao || 0,
            razaoSocial: currentAlteracao?.razaoSocial || '',
            nomeFantasia: currentAlteracao?.nomeFantasia || '',
            email: currentAlteracao?.email || '',
            whatsapp: currentAlteracao?.whatsapp || '',
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
                : [],
            responsavelTecnico: currentAlteracao?.responsavelTecnico || '',
            possuiRT: currentAlteracao?.possuiRT || false,
            marcaRegistrada: currentAlteracao?.marcaRegistrada || false,
            interesseRegistroMarca: currentAlteracao?.interesseRegistroMarca || false,
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
            await updateAlteracao(currentAlteracao._id, getValues());
            toast.success("Dados salvos com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar os dados");
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
            await updateAlteracao(currentAlteracao._id, {
                ...data,
                statusAlteracao: 'em_alteracao',
                somenteAtualizar: false,
                notificarWhats: false,
            });
            toast.success('Alteração reaberta!');
            if (handleAdvanceStatus) handleAdvanceStatus('em_alteracao');
        } catch (error) {
            toast.error('Erro ao reabrir a alteração');
        } finally {
            loading.onFalse();
        }
    };

    const onReject = async (data) => {
        loading.onTrue();
        try {
            await updateAlteracao(currentAlteracao._id, {
                ...data,
                statusAlteracao: 'iniciado',
                somenteAtualizar: false,
                notificarWhats: false,
            });
            toast.error('Alteração reiniciada!');
            if (handleAdvanceStatus) handleAdvanceStatus('iniciado');
        } catch (error) {
            toast.error('Erro ao reiniciar a alteração');
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
                    {currentAlteracao.statusAlteracao === 'em_alteracao' && (
                        <Grid container spacing={2} mt={2}>
                            <Grid xs={12}>
                                <Controller
                                    name="situacaoAlteracao"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Situação da Alteração"
                                            select
                                            fullWidth
                                            variant="outlined"
                                        >
                                            <MenuItem value={0}>Solicitando Viabilidade</MenuItem>
                                            <MenuItem value={1}>Aprovação da Viabilidade</MenuItem>
                                            <MenuItem value={2}>Pagamento taxas de registro</MenuItem>
                                            <MenuItem value={3}>Assinatura do processo</MenuItem>
                                            <MenuItem value={4}>Protocolo do processo</MenuItem>
                                            <MenuItem value={5}>Aguardando deferimento</MenuItem>
                                            <MenuItem value={6}>Processo deferido</MenuItem>
                                            <MenuItem value={7}>Inicio de licenças e alvaras</MenuItem>
                                            <MenuItem value={8}>Alteração concluida</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={loading.value}
                                >
                                    Salvar
                                </Button>
                            </Grid>
                            <Grid xs={12} sx={{ mt: 4 }}>
                                <Divider />
                            </Grid>
                        </Grid>
                    )}

                    <Grid container spacing={2} mt={2}>
                        <Grid xs={12}>
                            <Typography variant="h4" align="center" gutterBottom>
                                Dados da Alteração
                            </Typography>
                        </Grid>
                        <Grid xs={12}>
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
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="razaoSocial"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Razão Social" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="nomeFantasia"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Nome Fantasia" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="E-mail" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="whatsapp"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Whatsapp" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
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
                        <Grid xs={12} sm={6}>
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
                        <Grid xs={12} sm={6}>
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
                        <Grid xs={12} sm={6}>
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

                        <Grid xs={12}>
                            <Typography variant="h6">Endereço Comercial</Typography>
                        </Grid>
                        <Grid xs={12} sm={6} md={4}>
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
                        <Grid xs={12} sm={6} md={8}>
                            <Controller
                                name="enderecoComercial.logradouro"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Logradouro" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.numero"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Número" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.complemento"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Complemento" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.bairro"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Bairro" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="enderecoComercial.cidade"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Cidade" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="enderecoComercial.estado"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Estado" fullWidth variant="outlined" />
                                )}
                            />
                        </Grid>

                        <Grid xs={12}>
                            <Typography variant="h6">Informações dos Sócios</Typography>
                        </Grid>

                        {getValues('socios').map((socio, index) => {
                            const estadoCivilValue = watch(`socios[${index}].estadoCivil`);
                            return (
                                <React.Fragment key={index}>
                                    <Grid xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].nome`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} label="Nome" fullWidth variant="outlined" />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].cpf`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="CPF"
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="000.000.000-00"
                                                    value={formatCpf(field.value || '')}
                                                    onChange={(e) => {
                                                        const formatted = formatCpf(e.target.value);
                                                        field.onChange(formatted);
                                                    }}
                                                    inputProps={{
                                                        maxLength: 14,
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].rg`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="RG"
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="00.000.000-0"
                                                    value={formatRg(field.value || '')}
                                                    onChange={(e) => {
                                                        const formatted = formatRg(e.target.value);
                                                        field.onChange(formatted);
                                                    }}
                                                    inputProps={{
                                                        maxLength: 12,
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={6}>
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
                                    <Grid xs={12} sm={6}>
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
                                    <Grid xs={12} sm={6}>
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
                                        <Grid xs={12} sm={6}>
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
                                    <Grid xs={12} sm={6}>
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
                                    <Grid xs={12} sm={6}>
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
                                    <Grid xs={12} sm={6}>
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
                                    <Grid xs={12} sm={6}>
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
                                    <Grid xs={12} sm={6}>
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
                                    <Grid xs={12} sm={6}>
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

                        <Grid xs={12}>
                            <Typography variant="h6">Atividades Econômicas</Typography>
                        </Grid>
                    </Grid>
                    <Grid xs={12} mb={2} mt={2}>
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

                    {currentAlteracao.statusAlteracao === 'em_validacao' && (
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
                    )}
                </>
            )}

            {activeTab === 1 && (
                <Grid container spacing={2} mt={2}>
                    <Grid xs={12}>
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
                    <Grid xs={12} sm={12}>
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
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 3 }} justifyContent="center">
                <Button variant="contained" onClick={handleSave} disabled={loading.value}>
                    Salvar
                </Button>
            </Stack>
        </Card>
    );
}