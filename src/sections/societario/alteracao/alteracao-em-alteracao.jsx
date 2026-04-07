import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NumericFormat, PatternFormat } from 'react-number-format';

import {
    Box,
    Tab,
    Tabs,
    Grid,
    Card,
    Chip,
    Stack,
    Button,
    Switch,
    Divider,
    MenuItem,
    TextField,
    Typography,
    LinearProgress,
    CircularProgress,
    FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { consultarCep } from 'src/utils/consultarCep';
import { normalizePhoneToE164 } from 'src/utils/phone-e164';

import { updateAlteracao, uploadArquivoAlteracao, deletarArquivoAlteracao, downloadArquivoAlteracao } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';
import { PhoneInput } from 'src/components/phone-input';

import { prepareDataForAlteracao } from './prepare-alteracao-payload';
import {
    REGIME_BENS_OPTIONS as regimeBensOptions,
    ESTADO_CIVIL_OPTIONS as estadoCivilOptions,
    FORMA_ATUACAO_OPTIONS as formaAtuacaoOptions,
    REGIME_TRIBUTARIO_OPTIONS as regimeTributarioOptions,
} from './alteracao-form-options';

// Componente de Card de Documento (movido para fora para evitar re-render)
function DocumentCard({ name, label, value, onUploadClick, onDownloadClick, onDeleteClick, readOnly }) {
    return (
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
                <strong>{label}</strong>
            </Typography>
            <Box>
                {!readOnly && (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mb: 1 }}
                            onClick={onUploadClick}
                        >
                            Enviar Anexo
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={onDeleteClick}
                            disabled={!value}
                        >
                            Deletar
                        </Button>
                    </>
                )}
                {value && (
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={onDownloadClick}
                    >
                        Baixar
                    </Button>
                )}
            </Box>
            {value && typeof value === 'string' && (
                <Box mt={2}>
                    <Typography variant="body2" noWrap>📎 {value.split('/').pop()}</Typography>
                </Box>
            )}
        </Box>
    );
}

const SITUACOES_ALTERACAO = [
    { value: 0, label: 'Solicitando Viabilidade', notificaCliente: true },
    { value: 1, label: 'Aprovação da Viabilidade', notificaCliente: false },
    { value: 2, label: 'Pagamento taxas de registro', notificaCliente: true },
    { value: 3, label: 'Assinatura do processo', notificaCliente: false },
    { value: 4, label: 'Protocolo do processo', notificaCliente: true },
    { value: 5, label: 'Aguardando deferimento', notificaCliente: false },
    { value: 6, label: 'Processo deferido', notificaCliente: true },
    { value: 7, label: 'Início de licenças e alvarás', notificaCliente: true },
    { value: 8, label: 'Alteração concluída', notificaCliente: true },
];

export default function AlteracaoEmAlteracaoForm({ currentAlteracao, handleAdvanceStatus, isArchived = false }) {
    const loading = useBoolean();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [situacaoAlteracao, setSituacaoAlteracao] = useState(currentAlteracao?.situacaoAlteracao ?? 0);
    const [etapasCompletadas, setEtapasCompletadas] = useState(currentAlteracao?.etapasCompletadas || []);
    const [notificarWhats, setNotificarWhats] = useState(currentAlteracao?.notificarWhats ?? true);

    const { control, handleSubmit, reset, getValues, watch, setValue } = useForm({
        defaultValues: {
            id: currentAlteracao?._id || '',
            alteracoes: currentAlteracao?.alteracoes || '',
            statusAlteracao: currentAlteracao?.statusAlteracao || '',
            situacaoAlteracao: currentAlteracao?.situacaoAlteracao || 0,
            razaoSocial: currentAlteracao?.razaoSocial || '',
            nomeFantasia: currentAlteracao?.nomeFantasia || '',
            email: currentAlteracao?.email || '',
            whatsapp: normalizePhoneToE164(currentAlteracao?.whatsapp),
            capitalSocial: currentAlteracao?.capitalSocial || '',
            regimeTributario: currentAlteracao?.regimeTributario || '',
            formaAtuacao: currentAlteracao?.formaAtuacao || '',
            enderecoComercial: {
                cep: currentAlteracao?.enderecoComercial?.cep || '',
                logradouro: currentAlteracao?.enderecoComercial?.logradouro || '',
                numero: currentAlteracao?.enderecoComercial?.numero || '',
                complemento: currentAlteracao?.enderecoComercial?.complemento || '',
                bairro: currentAlteracao?.enderecoComercial?.bairro || '',
                cidade: currentAlteracao?.enderecoComercial?.cidade || '',
                estado: currentAlteracao?.enderecoComercial?.estado || '',
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
            anotacoes: currentAlteracao?.anotacoes || '',
            urlMeetKickoff: currentAlteracao?.urlMeetKickoff || '',
            iptuAnexo: currentAlteracao?.iptuAnexo || '',
            rgAnexo: currentAlteracao?.rgAnexo || '',
            documentoRT: currentAlteracao?.documentoRT || '',
        },
    });

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    // Verifica se todas as etapas estão completas
    const todasEtapasCompletas = () => {
        if (situacaoAlteracao === 8) return true;
        const todasEtapas = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        return todasEtapas.every((etapa) => etapasCompletadas.includes(etapa));
    };

    useEffect(() => {
        if (currentAlteracao) {
            reset({
                ...currentAlteracao,
                whatsapp: normalizePhoneToE164(currentAlteracao?.whatsapp),
            });
            setSituacaoAlteracao(currentAlteracao.situacaoAlteracao ?? 0);
            setEtapasCompletadas(currentAlteracao.etapasCompletadas || []);
            setNotificarWhats(currentAlteracao.notificarWhats ?? true);
            setActiveTab(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAlteracao]);

    const handleCepBlur = async () => {
        const cep = getValues('enderecoComercial.cep')?.replace('-', '') || '';
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

    const handleSituacaoChange = async (event) => {
        const novaSituacao = parseInt(event.target.value, 10);
        const situacaoAnterior = situacaoAlteracao;

        setSaving(true);
        try {
            // Atualiza a situação da alteração
            await updateAlteracao(currentAlteracao._id, {
                situacaoAlteracao: novaSituacao,
                statusAlteracao: 'em_alteracao',
                somenteAtualizar: false,
                notificarWhats,
            });

            // Marca a etapa anterior como completada
            const novasEtapasCompletadas = [...etapasCompletadas];
            if (!novasEtapasCompletadas.includes(situacaoAnterior) && situacaoAnterior >= 0) {
                novasEtapasCompletadas.push(situacaoAnterior);
            }

            // Se a nova situação for a última (8 - Alteração concluída), marca todas as etapas
            if (novaSituacao === 8) {
                const todasEtapas = [0, 1, 2, 3, 4, 5, 6, 7, 8];
                todasEtapas.forEach((etapa) => {
                    if (!novasEtapasCompletadas.includes(etapa)) {
                        novasEtapasCompletadas.push(etapa);
                    }
                });
            }

            // Atualiza as etapas completadas
            await updateAlteracao(currentAlteracao._id, {
                etapasCompletadas: novasEtapasCompletadas,
                somenteAtualizar: true,
            });

            setSituacaoAlteracao(novaSituacao);
            setEtapasCompletadas(novasEtapasCompletadas);

            toast.success(
                notificarWhats
                    ? 'Situação atualizada! Mensagem enviada ao cliente.'
                    : 'Situação atualizada com sucesso!'
            );
        } catch (error) {
            console.error('Erro ao atualizar situação:', error);
            toast.error('Erro ao atualizar situação da alteração');
        } finally {
            setSaving(false);
        }
    };

    // ========== Funções de Documentos ==========
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
        return labels[type] || `Documento desconhecido`;
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

                    if (index != null) {
                        try {
                            toast.loading('Salvando dados do sócio...', { id: 'save-socio' });
                            await updateAlteracao(currentAlteracao._id, prepareDataForAlteracao({ ...getValues(), somenteAtualizar: true }));
                            toast.success('Dados salvos.', { id: 'save-socio' });
                        } catch (saveErr) {
                            toast.error('Erro ao salvar dados do sócio. Salve o formulário antes de enviar o documento.', { id: 'save-socio' });
                            return;
                        }
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
            const formPath = getDocumentPath(documentType, index);
            const fileUrl = getValues(formPath);
            if (!fileUrl) throw new Error('Arquivo não disponível para download.');
            const filename = fileUrl.split('/').pop();

            const downloadPath = index !== null ? `socios.${index}.${documentType}` : documentType;

            const response = await downloadArquivoAlteracao(
                currentAlteracao._id,
                downloadPath,
                filename
            );

            if (response?.data) {
                const contentType = response.data.type || response.headers?.['content-type'] || 'application/octet-stream';
                const blob = new Blob([response.data], { type: contentType });
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
                toast.success(`${getDocumentLabel(documentType, index)} baixado com sucesso.`);
            } else {
                throw new Error('Resposta vazia do servidor');
            }
        } catch (error) {
            console.error('Erro no download:', error);
            toast.error(`Erro ao baixar ${getDocumentLabel(documentType, index)}.`);
        }
    };

    const handleDelete = async (documentType, index = null) => {
        try {
            const deletePath = index !== null ? `socios.${index}.${documentType}` : documentType;
            const formPath = getDocumentPath(documentType, index);

            const response = await deletarArquivoAlteracao(
                currentAlteracao._id,
                deletePath
            );
            if (response.status === 200) {
                setValue(formPath, '');
                toast.success(`${getDocumentLabel(documentType, index)} deletado com sucesso.`);
            }
        } catch (error) {
            toast.error(`Erro ao deletar ${getDocumentLabel(documentType, index)}.`);
        }
    };

    const onSave = async (data) => {
        loading.onTrue();
        try {
            await updateAlteracao(currentAlteracao._id, prepareDataForAlteracao({ ...data, somenteAtualizar: true }));
            toast.success('Dados salvos com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar os dados');
        } finally {
            loading.onFalse();
        }
    };

    const progresso = ((situacaoAlteracao + 1) / SITUACOES_ALTERACAO.length) * 100;
    const todasCompletas = todasEtapasCompletas();

    return (
        <Card sx={{ width: '100%', maxWidth: '100%', p: 4, mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="standard" centered sx={{ mb: 3 }}>
                <Tab label={isArchived ? 'Alteração concluída' : 'Acompanhamento de Etapas'} />
                <Tab label="Dados da Alteração" />
                <Tab label="Documentos" />
            </Tabs>

            {/* ========== ABA 0: Acompanhamento de Etapas / Etapas concluídas ========== */}
            {activeTab === 0 && (
                <Box>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        {isArchived ? 'Etapas da Alteração concluídas' : 'Em Alteração - Acompanhamento de Etapas'}
                    </Typography>

                    {/* Barra de Progresso */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Progresso da Alteração
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {Math.round(progresso)}%
                            </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progresso} sx={{ height: 8, borderRadius: 1 }} />
                    </Box>

                    {/* Select de Situação + Switch de Notificação (oculto quando arquivado) */}
                    {!isArchived && (
                        <Grid container spacing={0} sx={{ mb: 3, '& > *': { px: 2, mb: 2 } }} alignItems="flex-start">
                            <Grid xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    label="Situação da Alteração"
                                    value={situacaoAlteracao}
                                    onChange={handleSituacaoChange}
                                    disabled={saving || loading.value}
                                    helperText={
                                        notificarWhats
                                            ? 'Ao alterar a situação, uma mensagem será enviada automaticamente ao cliente'
                                            : 'Notificação WhatsApp desativada - cliente não será notificado'
                                    }
                                >
                                    {SITUACOES_ALTERACAO.map((situacao) => (
                                        <MenuItem key={situacao.value} value={situacao.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <span>{situacao.value}. {situacao.label}</span>
                                                {situacao.notificaCliente ? (
                                                    <Iconify icon="ic:baseline-whatsapp" width={18} sx={{ color: 'success.main', ml: 1 }} />
                                                ) : null}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid xs={12} md={6}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: notificarWhats ? 'success.lighter' : 'grey.100',
                                        border: '1px solid',
                                        borderColor: notificarWhats ? 'success.light' : 'grey.300',
                                    }}
                                >
                                    <Iconify
                                        icon={notificarWhats ? 'ic:baseline-whatsapp' : 'ic:baseline-notifications-off'}
                                        width={24}
                                        sx={{ color: notificarWhats ? 'success.main' : 'grey.500', alignSelf: 'center' }}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={notificarWhats}
                                                onChange={(e) => setNotificarWhats(e.target.checked)}
                                                disabled={saving || loading.value}
                                                color="success"
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {notificarWhats ? 'Notificar cliente via WhatsApp' : 'Notificação WhatsApp desativada'}
                                            </Typography>
                                        }
                                        sx={{ m: 0 }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    )}

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            Etapas do Processo:
                        </Typography>
                        <Stack spacing={1}>
                            {SITUACOES_ALTERACAO.map((situacao) => {
                                const isCompleted = etapasCompletadas.includes(situacao.value);
                                const isCurrent = situacao.value === situacaoAlteracao;
                                const isPast = situacao.value < situacaoAlteracao;
                                const isAllCompleted = situacaoAlteracao === 8;

                                return (
                                    <Box
                                        key={situacao.value}
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: isCurrent
                                                ? 'primary.main'
                                                : isCompleted || isPast || isAllCompleted
                                                    ? 'success.lighter'
                                                    : 'divider',
                                            bgcolor: isCurrent
                                                ? 'primary.lighter'
                                                : isCompleted || isPast || isAllCompleted
                                                    ? 'success.lighter'
                                                    : 'background.paper',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: isCurrent
                                                    ? 'primary.main'
                                                    : isCompleted || isPast || isAllCompleted
                                                        ? 'success.main'
                                                        : 'grey.300',
                                                color: isCurrent || isCompleted || isPast || isAllCompleted ? 'white' : 'text.secondary',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {isCompleted || isPast || isAllCompleted ? (
                                                <Iconify icon="eva:checkmark-fill" width={20} />
                                            ) : (
                                                situacao.value + 1
                                            )}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: isCurrent ? 'bold' : 'normal',
                                                    color: isCurrent ? 'primary.main' : 'text.primary',
                                                }}
                                            >
                                                {situacao.label}
                                            </Typography>
                                        </Box>
                                        {isCurrent && <Chip label="Atual" size="small" color="primary" />}
                                        {(isCompleted || (isAllCompleted && !isCurrent)) && (
                                            <Chip label="Concluída" size="small" color="success" />
                                        )}
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>

                    {!isArchived && saving && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} />
                            <Typography variant="body2" color="text.secondary">
                                Salvando...
                            </Typography>
                        </Box>
                    )}

                    {!isArchived && !todasCompletas && (
                        <Box
                            sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: 1,
                                bgcolor: 'warning.lighter',
                                border: '1px solid',
                                borderColor: 'warning.main',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Iconify icon="eva:alert-circle-fill" width={24} sx={{ color: 'warning.main' }} />
                            <Typography variant="body2" sx={{ color: 'warning.darker' }}>
                                Etapas completadas: {etapasCompletadas.length} de {SITUACOES_ALTERACAO.length}
                            </Typography>
                        </Box>
                    )}

                    {(todasCompletas || isArchived) && (
                        <Box
                            sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: 1,
                                bgcolor: 'success.lighter',
                                border: '1px solid',
                                borderColor: 'success.main',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: 'success.main' }} />
                            <Typography variant="body2" sx={{ color: 'success.darker' }}>
                                {isArchived ? 'Alteração arquivada. Etapas concluídas.' : 'Todas as etapas foram concluídas! Alteração finalizada.'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {activeTab === 1 && (
                <Box>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Dados da Alteração
                    </Typography>

                    <Grid container spacing={0} sx={{ '& > *': { px: 2, mb: 2 } }}>
                        <Grid xs={12}>
                            <Controller
                                name="alteracoes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Alterações Solicitadas"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="razaoSocial"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Razão Social" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="nomeFantasia"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Nome Fantasia" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="E-mail" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="whatsapp"
                                control={control}
                                render={({ field }) => (
                                    <PhoneInput
                                        {...field}
                                        fullWidth
                                        country="BR"
                                        label="Whatsapp"
                                        placeholder="Digite o número"
                                        variant="outlined"
                                        size="small"
                                        value={field.value ?? ''}
                                        onChange={(newValue) => field.onChange(newValue ?? '')}
                                    />
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
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="regimeTributario"
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} label="Regime Tributário" fullWidth variant="outlined" size="small">
                                        {regimeTributarioOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
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
                                    <TextField select {...field} label="Forma de Atuação" fullWidth variant="outlined" size="small">
                                        {formaAtuacaoOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
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
                                    <TextField select {...field} label="Responsável Técnico" fullWidth variant="outlined" size="small">
                                        <MenuItem value="">Nenhum</MenuItem>
                                        <MenuItem value="novoResponsavelTecnico">Novo Responsável Técnico</MenuItem>
                                        {currentAlteracao?.socios?.map((socio, index) => (
                                            <MenuItem key={index} value={socio.nome}>{socio.nome}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* Endereço Comercial */}
                        <Grid xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1">Endereço Comercial</Typography>
                        </Grid>
                        <Grid xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.cep"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="CEP" fullWidth variant="outlined" size="small" onBlur={handleCepBlur} />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={8}>
                            <Controller
                                name="enderecoComercial.logradouro"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Logradouro" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.numero"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Número" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.complemento"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Complemento" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={4}>
                            <Controller
                                name="enderecoComercial.bairro"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Bairro" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="enderecoComercial.cidade"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Cidade" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Controller
                                name="enderecoComercial.estado"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Estado" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>

                        {/* Sócios */}
                        <Grid xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1">Informações dos Sócios</Typography>
                        </Grid>

                        {getValues('socios')?.map((socio, index) => {
                            const estadoCivilValue = watch(`socios[${index}].estadoCivil`);
                            return (
                                <React.Fragment key={index}>
                                    {index > 0 && (
                                        <Grid xs={12}>
                                            <Divider sx={{ my: 2 }} />
                                        </Grid>
                                    )}
                                    <Grid xs={12}>
                                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Sócio {index + 1}</Typography>
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].nome`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} label="Nome" fullWidth variant="outlined" size="small" />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].cpf`}
                                            control={control}
                                            render={({ field }) => (
                                                <PatternFormat
                                                    format="###.###.###-##"
                                                    customInput={TextField}
                                                    label="CPF"
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    value={field.value ?? ''}
                                                    onValueChange={(values) => field.onChange(values.formattedValue)}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    getInputRef={field.ref}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={4}>
                                        <Controller
                                            name={`socios[${index}].rg`}
                                            control={control}
                                            render={({ field }) => (
                                                <PatternFormat
                                                    format="##.###.###-#"
                                                    customInput={TextField}
                                                    label="RG"
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    value={field.value ?? ''}
                                                    onValueChange={(values) => field.onChange(values.formattedValue)}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    getInputRef={field.ref}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={4}>
                                        <Controller
                                            name={`socios[${index}].porcentagem`}
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    customInput={TextField}
                                                    label="Porcentagem"
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    decimalScale={2}
                                                    suffix="%"
                                                    onValueChange={(values) => field.onChange(values.floatValue)}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={4}>
                                        <Controller
                                            name={`socios[${index}].estadoCivil`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField select {...field} label="Estado Civil" fullWidth variant="outlined" size="small">
                                                    {estadoCivilOptions.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
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
                                                    <TextField select {...field} label="Regime de Bens" fullWidth variant="outlined" size="small">
                                                        {regimeBensOptions.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                                        ))}
                                                    </TextField>
                                                )}
                                            />
                                        </Grid>
                                    )}
                                    <Grid xs={12} sm={6}>
                                        <Controller
                                            name={`socios[${index}].administrador`}
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={<Switch {...field} checked={field.value} />}
                                                    label="Sócio Administrador"
                                                />
                                            )}
                                        />
                                    </Grid>
                                </React.Fragment>
                            );
                        })}

                        {/* Novas Atividades */}
                        <Grid xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1">Atividades Econômicas</Typography>
                        </Grid>
                        <Grid xs={12}>
                            <Controller
                                name="novasAtividades"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Novas Atividades"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>

                        {/* Anotações */}
                        <Grid xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1">Anotações Internas (Kickoff)</Typography>
                        </Grid>
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
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid xs={12}>
                            <Controller
                                name="urlMeetKickoff"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="URL do Meet Kickoff" fullWidth variant="outlined" size="small" />
                                )}
                            />
                        </Grid>
                    </Grid>

                    {!isArchived && (
                        <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="center">
                            <Button
                                variant="contained"
                                onClick={handleSubmit(onSave)}
                                disabled={loading.value}
                                startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                            >
                                Salvar Dados
                            </Button>
                        </Stack>
                    )}
                </Box>
            )}

            {activeTab === 2 && (
                <Box sx={{ mt: 3 }}>
                    <Grid container spacing={0} sx={{ mt: 2, '& > *': { px: 2, mb: 2 } }}>
                        <Grid xs={12}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify icon="eva:file-text-fill" width={24} />
                                Documentos da Alteração
                            </Typography>
                        </Grid>
                        <Grid xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                Documentos Gerais
                            </Typography>
                        </Grid>
                        <Grid xs={12} sm={6} md={4}>
                            <DocumentCard
                                label="IPTU do Imóvel"
                                value={watch('iptuAnexo')}
                                onUploadClick={() => handleUpload('iptuAnexo')}
                                onDownloadClick={() => handleDownload('iptuAnexo')}
                                onDeleteClick={() => handleDelete('iptuAnexo')}
                                readOnly={isArchived}
                            />
                        </Grid>
                        <Grid xs={12} sm={6} md={4}>
                            <DocumentCard
                                label="RG do Representante"
                                value={watch('rgAnexo')}
                                onUploadClick={() => handleUpload('rgAnexo')}
                                onDownloadClick={() => handleDownload('rgAnexo')}
                                onDeleteClick={() => handleDelete('rgAnexo')}
                                readOnly={isArchived}
                            />
                        </Grid>
                        <Grid xs={12} sm={6} md={4}>
                            <DocumentCard
                                label="Documento RT"
                                value={watch('documentoRT')}
                                onUploadClick={() => handleUpload('documentoRT')}
                                onDownloadClick={() => handleDownload('documentoRT')}
                                onDeleteClick={() => handleDelete('documentoRT')}
                                readOnly={isArchived}
                            />
                        </Grid>
                    </Grid>

                    {/* Documentos dos Sócios */}
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Documentos dos Sócios
                    </Typography>

                    {getValues('socios')?.map((socio, index) => (
                        <Box key={index} sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main' }}>
                                Sócio {index + 1}: {socio.nome || 'Sem nome'}
                            </Typography>
                            <Grid container spacing={0} sx={{ '& > *': { px: 2, mb: 2 } }}>
                                <Grid xs={12} sm={6}>
                                    <DocumentCard
                                        label={`CNH do Sócio ${index + 1}`}
                                        value={watch(`socios.${index}.cnhAnexo`)}
                                        onUploadClick={() => handleUpload('cnhAnexo', index)}
                                        onDownloadClick={() => handleDownload('cnhAnexo', index)}
                                        onDeleteClick={() => handleDelete('cnhAnexo', index)}
                                        readOnly={isArchived}
                                    />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                    <DocumentCard
                                        label={`Comprovante de Endereço ${index + 1}`}
                                        value={watch(`socios.${index}.comprovanteEnderecoAnexo`)}
                                        onUploadClick={() => handleUpload('comprovanteEnderecoAnexo', index)}
                                        onDownloadClick={() => handleDownload('comprovanteEnderecoAnexo', index)}
                                        onDeleteClick={() => handleDelete('comprovanteEnderecoAnexo', index)}
                                        readOnly={isArchived}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                </Box>
            )}
        </Card>
    );
}
