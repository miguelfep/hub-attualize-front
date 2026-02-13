import { toast } from "sonner";
import React, { useState } from "react";
import { NumericFormat } from "react-number-format";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import {
  Box,
  Grid,
  Button,
  Switch,
  Select,
  Dialog,
  Divider,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from "@mui/material";

import { formatRg, formatCpf } from 'src/utils/format-input';

import { uploadArquivoAlteracao, deletarArquivoAlteracao, downloadArquivoAlteracao } from "src/actions/societario";

export default function AlteracaoQuadroSocioetarioForm({ alteracaoId }) {
  const { control, watch, setValue, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "socios",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [socioToDelete, setSocioToDelete] = useState(null);

  const estadoCivilOptions = [
    { value: "Solteiro", label: "Solteiro" },
    { value: "Casado", label: "Casado" },
    { value: "Divorciado", label: "Divorciado" },
    { value: "Viuvo", label: "Viúvo" },
    { value: "Uniao Estavel", label: "União Estável" },
  ];

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

  const getDocumentLabel = (type, index) => {
    const labels = {
      cnhAnexo: `CNH do Sócio ${index + 1}`,
      comprovanteEnderecoAnexo: `Comprovante de Endereço do Sócio ${index + 1}`,
    };
    return labels[type] || `Documento desconhecido (tipo: ${type || 'indefinido'})`;
  };

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

  const handleUpload = async (index, documentType) => {
    // Validar entradas
    if (!Number.isInteger(index) || index < 0) {
      toast.error('Índice inválido.');
      return;
    }
    if (!['cnhAnexo', 'comprovanteEnderecoAnexo'].includes(documentType)) {
      toast.error(`Tipo de documento inválido: ${documentType || 'indefinido'}.`);
      return;
    }

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
          try {
            const response = await uploadArquivoAlteracao(
              alteracaoId,
              documentType,
              file,
              index
            );
            if (response.data?.message === 'Arquivo enviado com sucesso') {
              setValue(`socios.${index}.${documentType}`, response.data.filename);
              toast.success(`${getDocumentLabel(documentType, index)} enviado com sucesso!`);
            } else {
              throw new Error(response.data?.error || 'Erro ao enviar arquivo.');
            }
          } catch (error) {
            toast.error(`Erro ao enviar ${getDocumentLabel(documentType, index)}.`);
          }
        } else {
          toast.error('Nenhum arquivo selecionado');
        }
      };
      fileInput.click();
    } catch (outerError) {
      toast.error(`Erro ao iniciar o envio de ${getDocumentLabel(documentType, index)}.`);
    }
  };

  const handleDownload = async (index, documentType) => {
    try {
      const fileUrl = getValues(`socios.${index}.${documentType}`);
      if (!fileUrl || !fileUrl.includes('/')) {
        toast.error(`URL inválida para o arquivo: ${getDocumentLabel(documentType, index)}.`);
        return;
      }

      const filename = fileUrl.split('/').pop() || `default_${documentType}.bin`;
      if (!filename.includes('.')) {
        toast.error(`Nome do arquivo inválido (sem extensão): ${getDocumentLabel(documentType, index)}.`);
        return;
      }
      const cleanFilename = encodeURIComponent(filename.trim()); // Apenas codifica

      // Usar socios.{index}.{documentType} para nova estrutura de pastas
      const downloadPath = `socios.${index}.${documentType}`;
      const response = await downloadArquivoAlteracao(alteracaoId, downloadPath, cleanFilename);
      if (!response || !response.data || response.status !== 200) {
        throw new Error('Falha na resposta da API ou arquivo não encontrado.');
      }

      const mimeTypes = {
        pdf: 'application/pdf',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
      };
      const extension = filename.split('.').pop().toLowerCase();
      const mimeType = mimeTypes[extension] || 'application/octet-stream';

      const blob = new Blob([response.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success(`${getDocumentLabel(documentType, index)} baixado com sucesso.`);
    } catch (error) {
      const errorMessage = error.response?.status === 404
        ? `Arquivo não encontrado no servidor: ${getDocumentLabel(documentType, index)}.`
        : error.response
          ? `Erro do servidor: ${error.response.status} - ${error.response.data?.message || error.message}`
          : error.message.includes('Network Error')
            ? 'Erro de rede: não foi possível conectar ao servidor.'
            : `Erro ao baixar ${getDocumentLabel(documentType, index)}: ${error.message}`;
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (index, documentType) => {
    try {
      const response = await deletarArquivoAlteracao(
        alteracaoId,
        `socios.${index}.${documentType}`
      );
      if (response.status === 200) {
        setValue(`socios.${index}.${documentType}`, '');
        toast.success(`${getDocumentLabel(documentType, index)} deletado com sucesso.`);
      } else {
        throw new Error('Erro ao deletar arquivo.');
      }
    } catch (error) {
      toast.error(`Erro ao deletar ${getDocumentLabel(documentType, index)}.`);
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
        etnia: "",
        grau_escolaridade: "",
        cnhAnexo: "",
        comprovanteEnderecoAnexo: "",
        socioEnabled: false,
      });
      append(novosSocios);
    } else if (novoNumero < currentLength) {
      remove([...Array(currentLength - novoNumero).keys()].map(i => currentLength - 1 - i));
    }
  };

  const handleDeleteSocio = (index) => {
    setSocioToDelete(index);
    setOpenDialog(true);
  };

  const confirmDeleteSocio = () => {
    if (socioToDelete !== null) {
      remove(socioToDelete);
      toast.success(`Sócio ${socioToDelete + 1} removido com sucesso!`);
    }
    setOpenDialog(false);
    setSocioToDelete(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSocioToDelete(null);
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, mt: 4 }} gutterBottom>
          Quadro Societário
        </Typography>
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Abaixo, você verá os sócios de sua empresa e suas respectivas informações. Caso deseje alterar, basta selecionar o novo número de sócios e preencher os novos campos vazios com os dados dele.
          Para adicionar e/ou alterar as informações de um sócio, é preciso habilitar o campo <strong style={{ color: 'blue' }}>Editar Sócio</strong>
          <br /> <br />
          Se possível, preencha todos os campos, e faça o upload dos documentos necessários.
          É possível fazer a remoção de um sócio clicando no botão <strong style={{ color: 'red' }}>Remover Sócio</strong>
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid xs={12} md={12}>
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
            <Grid xs={12}>
              <Typography variant="h6">{`Dados do Sócio ${index + 1}`}</Typography>
            </Grid>

            <Grid xs={12} sm={4}>
              <Controller
                name={`socios.${index}.nome`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Nome"
                    fullWidth
                    disabled={!watch(`socios.${index}.socioEnabled`)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid xs={12} sm={4}>
              <Controller
                name={`socios.${index}.cpf`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="CPF"
                    fullWidth
                    placeholder="000.000.000-00"
                    disabled={!watch(`socios.${index}.socioEnabled`)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
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

            <Grid xs={12} sm={4}>
              <Controller
                name={`socios.${index}.rg`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="RG"
                    fullWidth
                    placeholder="00.000.000-0"
                    disabled={!watch(`socios.${index}.socioEnabled`)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
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

            <Grid xs={12} sm={4}>
              <Controller
                name={`socios.${index}.cnh`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="CNH"
                    fullWidth
                    placeholder="000000000"
                    disabled={!watch(`socios.${index}.socioEnabled`)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    value={(field.value || '').replace(/\D/g, '')}
                    onChange={(e) => {
                      const numbers = e.target.value.replace(/\D/g, '');
                      field.onChange(numbers);
                    }}
                    inputProps={{
                      maxLength: 9,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid xs={12} sm={8}>
              <Controller
                name={`socios.${index}.endereco`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Endereço"
                    fullWidth
                    disabled={!watch(`socios.${index}.socioEnabled`)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <Controller
                name={`socios.${index}.profissao`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Profissão"
                    fullWidth
                    disabled={!watch(`socios.${index}.socioEnabled`)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <Controller
                name={`socios.${index}.porcentagem`}
                control={control}
                render={({ field, fieldState }) => (
                  <NumericFormat
                    {...field}
                    customInput={TextField}
                    label="Porcentagem"
                    decimalScale={2}
                    allowNegative={false}
                    max={100.00}
                    decimalSeparator="."
                    suffix="%"
                    fullWidth
                    disabled={!watch(`socios.${index}.socioEnabled`)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <Controller
                name={`socios.${index}.naturalidade`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Naturalidade"
                    fullWidth
                    disabled={!watch(`socios.${index}.socioEnabled`)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <Controller
                name={`socios.${index}.estadoCivil`}
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel id={`estado-civil-select-label-${index}`}>
                      Estado Civil
                    </InputLabel>
                    <Select
                      {...field}
                      labelId={`estado-civil-select-label-${index}`}
                      label="Estado Civil"
                      fullWidth
                      disabled={!watch(`socios.${index}.socioEnabled`)}
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
                  </FormControl>
                )}
              />
            </Grid>

            {watch(`socios.${index}.estadoCivil`) === "Casado" && (
              <Grid xs={12} sm={6}>
                <Controller
                  name={`socios.${index}.regimeBens`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      select
                      label="Regime de Bens"
                      value={field.value || ""}
                      onChange={field.onChange}
                      fullWidth
                      disabled={!watch(`socios.${index}.socioEnabled`)}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value="Comunhão Parcial de Bens">Comunhão Parcial de Bens</MenuItem>
                      <MenuItem value="Comunhão Universal de Bens">Comunhão Universal de Bens</MenuItem>
                      <MenuItem value="Separação Total de Bens">Separação Total de Bens</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            )}

            <Grid xs={12} sm={6}>
              <Controller
                name={`socios.${index}.etnia`}
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel id={`etnia-select-label-${index}`}>
                      Raça/Cor
                    </InputLabel>
                    <Select
                      {...field}
                      labelId={`etnia-select-label-${index}`}
                      label="Raça/Cor"
                      fullWidth
                      disabled={!watch(`socios.${index}.socioEnabled`)}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Selecione uma opção</em>
                      </MenuItem>
                      {etniaOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <Controller
                name={`socios.${index}.grau_escolaridade`}
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel id={`grau-escolaridade-select-label-${index}`}>
                      Grau de Escolaridade
                    </InputLabel>
                    <Select
                      {...field}
                      labelId={`grau-escolaridade-select-label-${index}`}
                      label="Grau de Escolaridade"
                      fullWidth
                      disabled={!watch(`socios.${index}.socioEnabled`)}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Selecione uma opção</em>
                      </MenuItem>
                      {grauEscolaridadeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <Controller
                name={`socios.${index}.administrador`}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={!watch(`socios.${index}.socioEnabled`)}
                      />
                    }
                    label="É Administrador?"
                  />
                )}
              />
            </Grid>

            <Grid xs={12} sm={12}>
              <Box sx={{ display: "flex", justifyContent: 'space-between', alignContent: "center" }}>
                <Controller
                  name={`socios.${index}.socioEnabled`}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      sx={{ mb: 1 }}
                      control={
                        <Switch
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label={`Editar Sócio ${index + 1}`}
                    />
                  )}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteSocio(index)}
                  disabled={fields.length === 1}
                >
                  Remover Sócio
                </Button>
              </Box>
            </Grid>

            <Grid xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Para modificar as informações de um sócio e fazer upload dos documentos, habilite o campo <strong>Editar Sócio</strong>
              </Typography>
            </Grid>

            {/* Aqui está a seção corrigida para upload de documentos */}
            <Grid container spacing={2} sx={{ mt: 2, mb: 4, px: 2 }}>
              {/* Bloco para CNH */}
              <Grid xs={6}>
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
                        Faça o upload da <strong>CNH</strong> em Enviar Anexo
                      </Typography>
                      <Box>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ mb: 1 }}
                          disabled={!watch(`socios.${index}.socioEnabled`)}
                          onClick={() => handleUpload(index, 'cnhAnexo')}
                        >
                          Enviar Anexo
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          disabled={!watch(`socios.${index}.socioEnabled`) || !value}
                          onClick={() => handleDelete(index, 'cnhAnexo')}
                        >
                          Deletar
                        </Button>
                        {value && (
                          <Button
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 1 }}
                            onClick={() => handleDownload(index, 'cnhAnexo')}
                          >
                            Baixar
                          </Button>
                        )}
                      </Box>
                      {value && typeof value === 'string' && (
                        <Box mt={2}>
                          <Typography variant="body2" noWrap>
                            {value.split('/').pop()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                />
              </Grid>

              {/* Bloco para Comprovante de Endereço */}
              <Grid xs={6}>
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
                        Faça o upload do <strong>Comprovante de Endereço</strong> em Enviar Anexo
                      </Typography>
                      <Box>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ mb: 1 }}
                          disabled={!watch(`socios.${index}.socioEnabled`)}
                          onClick={() => handleUpload(index, 'comprovanteEnderecoAnexo')}
                        >
                          Enviar Anexo
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          disabled={!watch(`socios.${index}.socioEnabled`) || !value}
                          onClick={() => handleDelete(index, 'comprovanteEnderecoAnexo')}
                        >
                          Deletar
                        </Button>
                        {value && (
                          <Button
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 1 }}
                            onClick={() => handleDownload(index, 'comprovanteEnderecoAnexo')}
                          >
                            Baixar
                          </Button>
                        )}
                      </Box>
                      {value && typeof value === 'string' && (
                        <Box mt={2}>
                          <Typography variant="body2" noWrap>
                            {value.split('/').pop()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                />
              </Grid>
            </Grid>

            {index < fields.length - 1 && (
              <Grid xs={12}>
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Divider />
                </Box>
              </Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar o Sócio {socioToDelete !== null ? socioToDelete + 1 : ""}?
            Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDeleteSocio} color="error" autoFocus>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>

      <Divider sx={{ mb: 2 }} />
    </>
  );
}