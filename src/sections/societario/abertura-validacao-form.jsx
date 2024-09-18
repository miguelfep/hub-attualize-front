'use client';

import { toast } from 'sonner';
import InputMask from 'react-input-mask';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';

import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import {
  Box,
  Grid,
  Card,
  Stack,
  Button,
  Switch,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { consultarCep } from 'src/utils/consultarCep';

import { updateAbertura, deletarArquivo, downloadArquivo } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

import DialogDocumentsAbertura from './abertura-dialog-documento';

export function AberturaValidacaoForm({ currentAbertura, onStatusChange }) { 
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      nomeEmpresarial: '',
      dataCriacao: '',
      nomeFantasia: '',
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      emailFinanceiro: '',
      horarioFuncionamento: '',
      metragemImovel: '',
      metragemUtilizada: '',
      senhaGOV: '',
      capitalSocial: '',
      valorMensalidade: '',
      observacoes: '',
      situacaoAbertura: 0,
      notificarWhats: false,
      marcaRegistrada: false,
      interesseRegistroMarca: false,
      possuiRT: false,
      iptuAnexo: null,
      rgAenxo: null,
      numSocios: 1,
      socios: [
        {
          nome: '',
          cpf: '',
          rg: '',
          endereco: '',
          porcentagem: 0,
          estadoCivil: '',
          naturalidade: '',
          administrador: false,
        },
      ],
      enderecoComercial: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
      },
      responsavelReceitaFederal: '',
      formaAtuacao: '',
    },
  });

  const [documentosEnviados, setDocumentosEnviados] = useState({
    rg: currentAbertura?.rgAnexo != null,
    iptu: currentAbertura?.iptuAnexo != null,
    rt: currentAbertura?.rtAnexo != null,
  });

  // Função chamada ao sucesso do upload
  const handleFileUploadSuccess = (documento) => {
    setDocumentosEnviados((prevState) => ({
      ...prevState,
      [documento]: true,
    }));
  };

  const loading = useBoolean();
  const [loadingCep, setLoadingCep] = useState(false);
  const [numSocios, setNumSocios] = useState(1);
  const formData = watch();

  const StyledGrid = styled(Grid)(({ theme }) => ({
    marginTop: theme.spacing(4.8),
    [theme.breakpoints.down('md')]: {
      order: -1,
    },
  }));

  const handleDownload = async (clientId, documentType, filename) => {
    try {
      const response = await downloadArquivo(clientId, documentType, filename);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erro ao baixar o arquivo');
    }
  };

  const handleDelete = async (clientId, documentType) => {
    try {
      const response = await deletarArquivo(clientId, documentType);
      toast.success('Arquivo deletado com sucesso!');
    } catch (error) {
      toast.error('Erro ao deletar o arquivo');
    }
  };

  const renderDocument = (url, name, id, documento) => {
    if (url == null) {
      return <DialogDocumentsAbertura document={document} name={name} id={currentAbertura._id} />;
    }
    const filename = url.split('/').pop();
    return (
      <StyledGrid item xs={12} md={12}>
        <Box
          sx={{
            borderRadius: 1,
            p: (theme) => theme.spacing(2.5, 5.75, 4.75),
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ ml: -2.25, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">{name}</Typography>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2">Faça o download do {name} abaixo</Typography>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Stack direction="row" spacing={2}>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleDownload(id, name, filename)}
                startIcon={<Iconify icon="eva:file-text-outline" width={20} />} // Ícone de arquivo
              >
                Baixar {name}
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => handleDelete(id, name)}
                startIcon={<Iconify icon="eva:trash-2-outline" width={20} />} // Ícone de lixeira
              >
                Deletar
              </Button>
            </Stack>
          </Box>
        </Box>
      </StyledGrid>
    );
  };

  useEffect(() => {
    if (currentAbertura) {
      setValue('nomeEmpresarial', currentAbertura.nomeEmpresarial || '');
      setValue('dataCriacao', currentAbertura.dataCriacao || '');
      setValue('nomeFantasia', currentAbertura.nomeFantasia || '');
      setValue('nome', currentAbertura.nome || '');
      setValue('cpf', currentAbertura.cpf || '');
      setValue('telefone', currentAbertura.telefone || '');
      setValue('telefoneComercial', currentAbertura.telefoneComercial || '');
      setValue('email', currentAbertura.email || '');
      setValue('emailFinanceiro', currentAbertura.emailFinanceiro || '');
      setValue('horarioFuncionamento', currentAbertura.horarioFuncionamento || '');
      setValue('metragemImovel', currentAbertura.metragemImovel || '');
      setValue('metragemUtilizada', currentAbertura.metragemUtilizada || '');
      setValue('senhaGOV', currentAbertura.senhaGOV || '');
      setValue('capitalSocial', formatToBRL(currentAbertura.capitalSocial || 0)); // Formatar capital social
      setValue('observacoes', currentAbertura.observacoes || '');
      setValue('notificarWhats', currentAbertura.notificarWhats || false);
      setValue('marcaRegistrada', currentAbertura.marcaRegistrada || false);
      setValue('interesseRegistroMarca', currentAbertura.interesseRegistroMarca || false);
      setValue('possuiRT', currentAbertura.possuiRT || false);
      setNumSocios(currentAbertura.socios?.length || 1);
      setValue('responsavelReceitaFederal', currentAbertura.responsavelReceitaFederal || '');
      setValue('formaAtuacao', currentAbertura.formaAtuacao || '');
      setValue('valorMensalidade', formatToBRL(currentAbertura.valorMensalidade || 0));

       // Preencher os valores para cada sócio
    currentAbertura.socios?.forEach((socio, index) => {
      setValue(`socios.${index}.nome`, socio.nome || '');
      setValue(`socios.${index}.cpf`, socio.cpf || '');
      setValue(`socios.${index}.rg`, socio.rg || '');
      setValue(`socios.${index}.endereco`, socio.endereco || '');
      setValue(`socios.${index}.porcentagem`, socio.porcentagem || '');
      setValue(`socios.${index}.estadoCivil`, socio.estadoCivil || ''); // Estado Civil
      setValue(`socios.${index}.regimeBens`, socio.regimeBens || ''); // Regime de Bens
      setValue(`socios.${index}.naturalidade`, socio.naturalidade || '');
      setValue(`socios.${index}.administrador`, socio.administrador || false);
    });
      // Preenchendo o endereço comercial
      if (currentAbertura.enderecoComercial) {
        setValue('enderecoComercial.cep', currentAbertura.enderecoComercial.cep || '');
        setValue('enderecoComercial.logradouro', currentAbertura.enderecoComercial.logradouro || '');
        setValue('enderecoComercial.numero', currentAbertura.enderecoComercial.numero || '');
        setValue('enderecoComercial.complemento', currentAbertura.enderecoComercial.complemento || '');
        setValue('enderecoComercial.bairro', currentAbertura.enderecoComercial.bairro || '');
        setValue('enderecoComercial.cidade', currentAbertura.enderecoComercial.cidade || '');
        setValue('enderecoComercial.estado', currentAbertura.enderecoComercial.estado || '');
      }     
    }
  }, [currentAbertura, setValue]);

  const handleChange = (field) => (values) => {
    const { value } = values;
    setValue(field, value); // Atualiza o valor no formato numérico (sem símbolos de moeda)
  };

  const formatToBRL = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const parseBRL = (value) => Number(value.replace(/\D/g, '')) / 100;

  const handleSave = async () => {
    loading.onTrue();
  
    // Obtenha os dados do formulário preenchido
    const data = formData;
  
    // Prepare os dados que serão enviados para o servidor
    const preparedData = {
      ...data,
      capitalSocial: parseBRL(data.capitalSocial), // Converte o valor do capital social para número
      valorMensalidade: parseBRL(data.valorMensalidade), // Converte o valor da mensalidade para número
    };
  
    try {
      // Envia a requisição PUT para atualizar os dados do cliente
      const response = await updateAbertura(currentAbertura._id, preparedData);
      console.log(response);
      
      // Verifica se a requisição foi bem-sucedida
      if (response.status !== 200) {
        throw new Error('Erro ao atualizar os dados do cliente');
      }
  
      // Notifica o sucesso
      toast.success('Dados salvos com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar os dados');
    } finally {
      loading.onFalse();
    }
  };
  
  const handleCepBlur = async () => {
    const cep = formData.enderecoComercial.cep.replace('-', '');
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const data = await consultarCep(cep);
        if (data.erro) {
          toast.error('CEP não encontrado');
        } else {
          setValue('enderecoComercial.logradouro', data.logradouro);
          setValue('enderecoComercial.complemento', data.complemento);
          setValue('enderecoComercial.bairro', data.bairro);
          setValue('enderecoComercial.cidade', data.localidade);
          setValue('enderecoComercial.estado', data.uf);
        }
      } catch (error) {
        toast.error('Erro ao buscar o CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleApprove = async () => {
    loading.onTrue();
    try {
      await updateAbertura(currentAbertura._id, { statusAbertura: 'em_constituicao' });
      toast.success('Abertura aprovada!');
      onStatusChange('em_constituicao');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao aprovar a abertura');
    } finally {
      loading.onFalse();
    }
  };

  const handleReject = async () => {
    loading.onTrue();
    try {
      await updateAbertura(currentAbertura._id, { statusAbertura: 'Iniciado' });
      toast.error('Abertura reprovada!');
      onStatusChange('Iniciado');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao reprovar a abertura');
    } finally {
      loading.onFalse();
    }
  };

  return (
    <form onSubmit={handleSave}>
      <Card sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Dados da Abertura</Typography>
        </Box>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nome Empresarial"
              {...register('nomeEmpresarial')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nome Fantasia"
              {...register('nomeFantasia')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Nome" {...register('nome')} margin="dense" />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField fullWidth label="CPF" {...register('cpf')} margin="dense" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="Telefone" {...register('telefone')} margin="dense" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Telefone Comercial"
              {...register('telefoneComercial')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" {...register('email')} margin="dense" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Financeiro"
              {...register('emailFinanceiro')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Horário de Funcionamento"
              {...register('horarioFuncionamento')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Metragem do Imóvel"
              {...register('metragemImovel')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Metragem Utilizada"
              {...register('metragemUtilizada')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Endereço Comercial</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InputMask
              mask="99999-999"
              onBlur={handleCepBlur}
              {...register('enderecoComercial.cep')}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="CEP"
                  fullWidth
                  margin="dense"
                  InputProps={{
                    endAdornment: loadingCep && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </InputMask>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              label="Logradouro"
              {...register('enderecoComercial.logradouro')}
              margin="dense"
              disabled={loadingCep}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número"
              {...register('enderecoComercial.numero')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Complemento"
              {...register('enderecoComercial.complemento')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Bairro"
              {...register('enderecoComercial.bairro')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Cidade"
              {...register('enderecoComercial.cidade')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Estado"
              {...register('enderecoComercial.estado')}
              margin="dense"
            />
          </Grid>

       {/* Sócios */}
       <Grid item xs={12}>
            <Typography variant="h6">Informações dos Sócios</Typography>
          </Grid>
          {[...Array(numSocios)].map((_, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} sm={6}>
              <TextField
                  fullWidth
                  label={`Nome Sócio ${index + 1}`}
                  {...register(`socios.${index}.nome`)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={`CPF Sócio ${index + 1}`}
                  {...register(`socios.${index}.cpf`)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={`RG Sócio ${index + 1}`}
                  {...register(`socios.${index}.rg`)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={`Naturalidade Sócio ${index + 1}`}
                  {...register(`socios.${index}.naturalidade`)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={`Porcentagem Sócio ${index + 1}`}
                  {...register(`socios.${index}.porcentagem`)}
                  margin="dense"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, type: 'number' },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label={`Estado Civil Sócio ${index + 1}`}
                  {...register(`socios.${index}.estadoCivil`)}
                  value={formData.socios[index]?.estadoCivil || ''} // Define o valor do campo
                  margin="dense"
                >
                  <MenuItem value="Solteiro">Solteiro</MenuItem>
                  <MenuItem value="Casado">Casado</MenuItem>
                  <MenuItem value="Divorciado">Divorciado</MenuItem>
                  <MenuItem value="Viúvo">Viúvo</MenuItem>
                  <MenuItem value="União estável">União estável</MenuItem>
                </TextField>
            </Grid>
            {formData.socios[index]?.estadoCivil === 'Casado' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label={`Regime de Bens Sócio ${index + 1}`}
                    {...register(`socios.${index}.regimeBens`)}
                    value={formData.socios[index]?.regimeBens || ''} // Define o valor do campo
                    margin="dense"
                  >
                    <MenuItem value="Comunhão Parcial de Bens">Comunhão Parcial de Bens</MenuItem>
                    <MenuItem value="Comunhão Universal de Bens">Comunhão Universal de Bens</MenuItem>
                    <MenuItem value="Separação Total de Bens">Separação Total de Bens</MenuItem>
                  </TextField>
                </Grid>
              )}
            <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      {...register(`socios.${index}.administrador`)}
                      checked={formData.socios[index]?.administrador || false} // Usa checked para controlar o valor
                      onChange={(event) => setValue(`socios.${index}.administrador`, event.target.checked)} // Atualiza o valor quando alterado
                    />
                  }
                  label="É Administrador?"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
            </React.Fragment>
          ))}

          {/* Outros campos */}
          <Grid item xs={12} sm={6}>
            <NumericFormat
              fullWidth
              label="Capital Social"
              customInput={TextField}
              value={formData.capitalSocial}
              thousandSeparator="."
              decimalSeparator=","
              decimalScale={2}
              fixedDecimalScale
              prefix="R$ "
              onValueChange={handleChange('capitalSocial')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Responsável na Receita Federal"
              {...register('responsavelReceitaFederal')}
              value={formData.responsavelReceitaFederal || ''} // Define o valor do campo
              fullWidth
              margin="dense"
            >
              {formData.socios.map((socio, index) => (
                <MenuItem key={index} value={socio.nome}>
                  {socio.nome}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Forma de Atuação"
              {...register('formaAtuacao')}
              value={formData.formaAtuacao || ''} // Define o valor do campo
              fullWidth
              margin="dense"
            >
              <MenuItem value="Internet">Internet</MenuItem>
              <MenuItem value="Fora do estabelecimento">Fora do estabelecimento</MenuItem>
              <MenuItem value="Escritório administrativo">Escritório administrativo</MenuItem>
              <MenuItem value="Local próprio">Local próprio</MenuItem>
              <MenuItem value="Em estabelecimento de terceiros">
                Em estabelecimento de terceiros
              </MenuItem>
              <MenuItem value="Casa do cliente">Casa do cliente</MenuItem>
              <MenuItem value="Outros">Outros</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
          <NumericFormat
            fullWidth
            label="Valor da Mensalidade"
            customInput={TextField}
            value={formData.valorMensalidade}  // O valor formatado em BRL será exibido aqui
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            prefix="R$ "
            onValueChange={handleChange('valorMensalidade')}
            margin="dense"
          />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Observações"
              {...register('observacoes')}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <FormControlLabel
              control={
                <Switch
                  {...register('notificarWhats')}
                  defaultChecked={currentAbertura?.notificarWhats || false}
                />
              }
              label="Notificar pelo WhatsApp?"
            />
            <FormControlLabel
              control={
                <Switch
                  {...register('marcaRegistrada')}
                  defaultChecked={currentAbertura?.marcaRegistrada || false}
                />
              }
              label="Tem marca registrada?"
            />

            {/* Mostrar o campo de interesse em registrar a marca somente quando marcaRegistrada for falso */}
            {!formData.marcaRegistrada && (
              <FormControlLabel
                control={
                  <Switch
                    {...register('interesseRegistroMarca')}
                    defaultChecked={currentAbertura?.interesseRegistroMarca || false}
                  />
                }
                label="Interesse em registrar marca?"
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  {...register('possuiRT')}
                  defaultChecked={currentAbertura?.possuiRT || false}
                />
              }
              label="Possui RT?"
            />
          </Grid>
          <Divider />
          {/* Documentos */}
          <Grid item xs={12}>
            <Typography variant="h6">Documentos</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {renderDocument(currentAbertura.rgAnexo, 'RG', currentAbertura._id)}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {renderDocument(currentAbertura.iptuAnexo, 'IPTU', currentAbertura._id)}
          </Grid>
          {formData.possuiRT && (
            <Grid item xs={12} sm={6} md={4}>
              {renderDocument(currentAbertura.documentoRT, 'RT', currentAbertura._id)}
            </Grid>
          )}
        </Grid>
      </Card>
      <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 3 }} justifyContent="center">
        <Button
          variant="contained"
          onClick={handleSave} // Chame a função handleSave ao clicar
          disabled={loading.value}
          startIcon={<Iconify icon="eva:checkmark-circle-2-fill" width={20} />}
        >
          Salvar
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleReject}
          disabled={loading.value}
          startIcon={<Iconify icon="eva:close-circle-fill" width={20} />}
        >
          Reprovar
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleApprove}
          disabled={loading.value}
          startIcon={<Iconify icon="eva:checkmark-circle-2-fill" width={20} />}
        >
          Aprovar
        </Button>
      </Stack>
    </form>
  );
}
