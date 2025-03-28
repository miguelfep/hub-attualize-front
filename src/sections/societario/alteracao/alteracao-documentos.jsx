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
    uploadArquivo,
    deletarArquivo,
    downloadArquivo,
} from 'src/actions/mockalteracoes';

export default function AlteracaoDocumentos({ aberturaId }) {
    const { getValues, setValue, control } = useFormContext();
    
    const [editarDocs, possuiRT] = useWatch({
        control,
        name: ['editarDocs', 'possuiRT'],
        defaultValue: [false, false]
    });

    const handleUpload = async (name) => {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf';
            if (name === 'documentoRT') {
                fileInput.multiple = true; 
            }
            fileInput.onchange = async (event) => {
                const files = [...event.target.files];
                if (files && files.length > 0) {
                    try {
                        if (name === 'documentoRT') {
                            const uploadedFiles = [];
                            files.forEach(async (file) => {
                                const response = await uploadArquivo(aberturaId, name, file);
                                if (response.status === 200) {
                                    uploadedFiles.push(response.data);
                                    toast.success(`Arquivo de ${name} enviado com sucesso!`);
                                } else {
                                    throw new Error('Erro ao enviar arquivo.');
                                }
                            });
                            setValue(name, uploadedFiles.map(file => file[name]));
                        } else {
                            const file = files[0];
                            const response = await uploadArquivo(aberturaId, name, file);
                            if (response.status === 200) {
                                const updatedData = response.data;
                                Object.keys(updatedData).forEach((key) => {
                                    setValue(key, updatedData[key]);
                                });
                                toast.success(`${name} enviado com sucesso!`);
                            } else {
                                throw new Error('Erro ao enviar arquivo.');
                            }
                        }
                    } catch (error) {
                        console.error('Erro ao enviar arquivo(s):', error);
                        toast.error(`Erro ao enviar ${name}.`);
                    }
                }
            };
            fileInput.click();
        } catch (error) {
            toast.error(`Erro ao iniciar o envio de ${name}.`);
        }
    };

    const handleDownload = async (name, fileIndex = 0) => {
        try {
            const fileUrl = Array.isArray(getValues(name)) ? getValues(name)[fileIndex] : getValues(name);
            if (!fileUrl) throw new Error('Arquivo não disponível para download.');

            const filename = fileUrl.split('/').pop();
            const response = await downloadArquivo(aberturaId, name, filename);
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
                toast.success(`${name} baixado com sucesso.`);
            } else {
                throw new Error('Erro ao baixar arquivo.');
            }
        } catch (error) {
            toast.error(`Erro ao baixar ${name}.`);
        }
    };

    const handleDelete = async (name, fileIndex = null) => {
        try {
            const response = await deletarArquivo(aberturaId, name);
            if (response.status === 200) {
                const updatedData = response.data;
                if (name === 'documentoRT' && fileIndex !== null) {
                    const currentFiles = getValues(name) || [];
                    const updatedFiles = currentFiles.filter((_, idx) => idx !== fileIndex);
                    setValue(name, updatedFiles);
                } else {
                    Object.keys(updatedData).forEach((key) => {
                        setValue(key, updatedData[key]);
                    });
                }
                toast.success(`${name} deletado com sucesso.`);
            } else {
                throw new Error('Erro ao deletar arquivo.');
            }
        } catch (error) {
            toast.error(`Erro ao deletar ${name}.`);
        }
    };

    const documents = [
        { label: 'RG', name: 'rgAnexo' },
        { label: 'IPTU', name: 'iptuAnexo' },
        { label: 'Documento RT', name: 'documentoRT', toggle: 'possuiRT' },
    ];

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Documentos
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
                <FormControlLabel
                    control={
                        <Controller
                            name="notificarWhats"
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
                    label="Notificar whatsapp?"
                />
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

            <Grid container spacing={3}>
                {documents.map((doc) => {
                    if (doc.toggle && !possuiRT) return null;

                    const files = getValues(doc.name);
                    const isMultiple = doc.name === 'documentoRT' && Array.isArray(files);

                    return (
                        <Grid item xs={12} sm={6} md={4} key={doc.name}>
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
                                {files ? (
                                    isMultiple ? (
                                        files.map((_, index) => (
                                            <Box key={index} sx={{ mb: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => handleDownload(doc.name, index)}
                                                    fullWidth
                                                    sx={{ mb: 1 }}
                                                    disabled={!editarDocs}
                                                >
                                                    Baixar Arquivo {index + 1}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDelete(doc.name, index)}
                                                    fullWidth
                                                    disabled={!editarDocs}
                                                >
                                                    Deletar Arquivo {index + 1}
                                                </Button>
                                            </Box>
                                        ))
                                    ) : (
                                        <Box>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleDownload(doc.name)}
                                                fullWidth
                                                sx={{ mb: 1 }}
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
                                        </Box>
                                    )
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={() => handleUpload(doc.name)}
                                        fullWidth
                                        disabled={!editarDocs}
                                    >
                                        Enviar Documento{doc.name === 'documentoRT' ? 's' : ''}
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};