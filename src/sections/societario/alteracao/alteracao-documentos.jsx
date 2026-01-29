import React from 'react';
import { toast } from 'sonner';
import { useWatch, Controller, useFormContext } from 'react-hook-form';

import {
    Box,
    Grid,
    Button,
    Switch,
    Divider,
    Typography,
    FormControlLabel,
} from '@mui/material';

import {
    uploadArquivoAlteracao,
    deletarArquivoAlteracao,
    downloadArquivoAlteracao,
} from 'src/actions/societario';

export default function AlteracaoDocumentos({ alteracaoId }) {
    const { getValues, setValue, control } = useFormContext();

    const [editarDocs, possuiRT] = useWatch({
        control,
        name: ['editarDocs', 'possuiRT'],
        defaultValue: [false, false]
    });

    // Função para obter o nome amigável do documento
    const getDocumentName = (name) => {
        switch (name) {
            case 'documentoRT':
                return 'Documento de Classe';
            case 'rgAnexo':
                return 'RG do Representante';
            case 'iptuAnexo':
                return 'IPTU do Imóvel';
            default:
                return 'Documento';
        }
    };

    const handleUpload = async (name) => {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf,image/*';
            fileInput.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    try {
                        const response = await uploadArquivoAlteracao(alteracaoId, name, file);
                        if (response.data.message === 'Arquivo enviado com sucesso') {
                            setValue(name, response.data.filename, { shouldValidate: true });
                            toast.success(`${getDocumentName(name)} enviado com sucesso!`);
                        } else {
                            throw new Error('Erro ao enviar arquivo.');
                        }
                    } catch (error) {
                        toast.error(`Erro ao enviar ${getDocumentName(name)}.`);
                    }
                }
            };
            fileInput.click();
        } catch (error) {
            toast.error(`Erro ao iniciar o envio de ${getDocumentName(name)}.`);
        }
    };

    const handleDownload = async (name) => {
        try {
            const fileUrl = getValues(name);
            if (!fileUrl) throw new Error('Arquivo não disponível para download.');

            const filename = fileUrl.split('/').pop() || fileUrl;
            const response = await downloadArquivoAlteracao(alteracaoId, name, filename);
            if (response?.data) {
                const blob = new Blob([response.data], { type: response.data.type || 'application/pdf' });
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
                toast.success(`${getDocumentName(name)} baixado com sucesso.`);
            } else {
                throw new Error('Erro ao baixar arquivo.');
            }
        } catch (error) {
            toast.error(`Erro ao baixar ${getDocumentName(name)}.`);
        }
    };

    const handleDelete = async (name) => {
        try {
            const response = await deletarArquivoAlteracao(alteracaoId, name);
            if (response.status === 200) {
                setValue(name, '', { shouldValidate: true });
                toast.success(`${getDocumentName(name)} deletado com sucesso.`);
            } else {
                throw new Error('Erro ao deletar arquivo.');
            }
        } catch (error) {
            toast.error(`Erro ao deletar ${getDocumentName(name)}.`);
        }
    };

    const documents = [
        { label: 'RG do Representante', name: 'rgAnexo' },
        { label: 'IPTU do Imóvel', name: 'iptuAnexo' },
        { label: 'Documento de Classe (Responsável Técnico)', name: 'documentoRT', toggle: 'possuiRT' },
    ];

    return (
        <Box>
            <>
                <Typography variant="h6" gutterBottom>
                    Documentos
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 2 }}>
                    Esse área é dedicada ao anexo dos documentos. Caso deseje, é possível baixar, alterar e deletar os documentos.
                    <br /> <br />
                    Para realizar um upload, habilite o campo <strong>Editar Documentos</strong>, localizado ao lado direito logo abaixo, e anexe os documentos correspondentes em <strong>Enviar Documento</strong>. Para o anexo do documento de classe do Responsável Técnico, é necessário habilitar o campo <strong>Possui RT?</strong>, localizado logo abaixo.
                </Typography>

                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 1 }}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="marcaRegistrada"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value || false}
                                                onChange={field.onChange}
                                                disabled={!editarDocs}
                                            />
                                        )}
                                    />
                                }
                                label="Tem marca registrada?"
                            />
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="possuiRT"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value || false}
                                                onChange={field.onChange}
                                                disabled={!editarDocs}
                                            />
                                        )}
                                    />
                                }
                                label="Possui RT?"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ textAlign: 'end' }} >
                        <Box>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="editarDocs"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value || false}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                }
                                label="Editar Documentos"
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {documents.map((doc) => {
                        if (doc.toggle && !possuiRT) return null;
                        const file = getValues(doc.name);
                        return (
                            <Grid item xs={12} sm={6} md={6} key={doc.name}>
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
                                        {doc.label}
                                    </Typography>
                                    <Box>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleUpload(doc.name)}
                                            fullWidth
                                            disabled={!editarDocs || !!file}
                                        >
                                            Enviar Documento
                                        </Button>
                                        {file && (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => handleDownload(doc.name)}
                                                    fullWidth
                                                    sx={{ mt: 1, mb: 1 }}
                                                    disabled={!editarDocs}
                                                >
                                                    Baixar
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDelete(doc.name)}
                                                    fullWidth
                                                    disabled={!editarDocs}
                                                >
                                                    Deletar
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                    {file && (
                                        <Box mt={2}>
                                            <Typography variant="body2" color="text.secondary">
                                                📎 {file.split('/').pop()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </>
        </Box>
    );
}