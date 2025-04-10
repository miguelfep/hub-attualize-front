'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';

import {
  Grid,
  Card,
  Stack,
  Button,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { consultarCep } from 'src/utils/consultarCep';

import { updateAbertura } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

import DocumentsManager from '../abertura/empresa/DocumentsManager';

export function AberturaValidacaoForm({ currentAbertura, setValue: setParentValue }) {
  const [formData, setFormData] = useState({
    nomeEmpresarial: '',
    nomeFantasia: '',
    nome: '',
    cpf: '',
    telefone: '',
    telefoneComercial: '',
    email: '',
    emailFinanceiro: '',
    horarioFuncionamento: '',
    enderecoComercial: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    socios: [
      {
        nome: '',
        cpf: '',
        rg: '',
        estadoCivil: '',
        naturalidade: '',
        porcentagem: '',
        administrador: false,
        endereco: '',
        profissao: '',
        cnh: '',
      },
    ],
    senhaGov: '',
    valorMensalidade: '',
    capitalSocial: '',
    observacoes: '',
    ...currentAbertura,
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const loading = useBoolean();

  const handleSocioChange = (index, field) => (e) => {
    const { value } = e.target;
    setFormData((prev) => {
      const updatedSocios = [...prev.socios];
      updatedSocios[index][field] = value;
      return { ...prev, socios: updatedSocios };
    });
  };

  const handleSwitchChange = (index, field) => (e) => {
    const { checked } = e.target;
    setFormData((prev) => {
      const updatedSocios = [...prev.socios];
      updatedSocios[index][field] = checked;
      return { ...prev, socios: updatedSocios };
    });
  };

  useEffect(() => {
    if (currentAbertura) {
      setFormData((prev) => ({ ...prev, ...currentAbertura }));
    }
  }, [currentAbertura]);

  const handleInputChange = (field) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parent, field) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
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
          setFormData((prev) => ({
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
        setLoadingCep(false);
      }
    }
  };

  const handleSave = async () => {
    loading.onTrue();
    try {
      await updateAbertura(currentAbertura._id, formData);
      toast.success('Dados salvos com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar os dados');
    } finally {
      loading.onFalse();
    }
  };

  const handleApprove = async () => {
    loading.onTrue();
    try {
      await updateAbertura(currentAbertura._id, {
        statusAbertura: 'kickoff',
        somenteAtualizar: false,
      });
      setParentValue('statusAbertura', 'kickoff');
      toast.success('Abertura aprovada!');
    } catch (error) {
      toast.error('Erro ao aprovar a abertura');
    } finally {
      loading.onFalse();
    }
  };

  const handleReject = async () => {
    loading.onTrue();
    try {
      await updateAbertura(currentAbertura._id, { statusAbertura: 'Iniciado' });
      setParentValue('statusAbertura', 'Iniciado');
      toast.error('Abertura reprovada!');
    } catch (error) {
      toast.error('Erro ao reprovar a abertura');
    } finally {
      loading.onFalse();
    }
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6">Dados da Abertura</Typography>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome Empresarial"
            value={formData.nomeEmpresarial}
            onChange={handleInputChange('nomeEmpresarial')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome Fantasia"
            value={formData.nomeFantasia}
            onChange={handleInputChange('nomeFantasia')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Nome"
            value={formData.nome}
            onChange={handleInputChange('nome')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="CPF"
            value={formData.cpf}
            onChange={handleInputChange('cpf')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            onChange={handleInputChange('email')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Email Financeiro"
            value={formData.emailFinanceiro}
            onChange={handleInputChange('emailFinanceiro')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Telefone"
            value={formData.telefone}
            onChange={handleInputChange('telefone')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Telefone Comercial"
            value={formData.telefoneComercial}
            onChange={handleInputChange('telefoneComercial')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Horario"
            value={formData.horarioFuncionamento}
            onChange={handleInputChange('horarioFuncionamento')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Metragem"
            value={formData.metragemImovel}
            onChange={handleInputChange('metragemImovel')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Metragem Utilizada"
            value={formData.metragemUtilizada}
            onChange={handleInputChange('metragemUtilizada')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            fullWidth
            label="Senha GOV"
            value={formData.senhaGOV}
            onChange={handleInputChange('senhaGOV')}
            margin="dense"
          />
        </Grid>
        {/* Endereço Comercial */}
        <Grid item xs={12}>
          <Typography variant="h6">Endereço Comercial</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="CEP"
            value={formData.enderecoComercial.cep}
            onChange={handleNestedInputChange('enderecoComercial', 'cep')}
            onBlur={handleCepBlur}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <TextField
            fullWidth
            label="Logradouro"
            value={formData.enderecoComercial.logradouro}
            onChange={handleNestedInputChange('enderecoComercial', 'logradouro')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Número"
            value={formData.enderecoComercial.numero}
            onChange={handleNestedInputChange('enderecoComercial', 'numero')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Complemento"
            value={formData.enderecoComercial.complemento}
            onChange={handleNestedInputChange('enderecoComercial', 'complemento')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Bairro"
            value={formData.enderecoComercial.bairro}
            onChange={handleNestedInputChange('enderecoComercial', 'bairro')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cidade"
            value={formData.enderecoComercial.cidade}
            onChange={handleNestedInputChange('enderecoComercial', 'cidade')}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Estado"
            value={formData.enderecoComercial.estado}
            onChange={handleNestedInputChange('enderecoComercial', 'estado')}
            margin="dense"
          />
        </Grid>

        {/* Sócios */}
        <Grid item xs={12}>
          <Typography variant="h6">Informações dos Sócios</Typography>
        </Grid>
        {formData.socios.map((socio, index) => (
          <React.Fragment key={index}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={`Nome Sócio ${index + 1}`}
                value={socio.nome}
                onChange={handleSocioChange(index, 'nome')}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={`CPF Sócio ${index + 1}`}
                value={socio.cpf}
                onChange={handleSocioChange(index, 'cpf')}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={`RG Sócio ${index + 1}`}
                value={socio.rg}
                onChange={handleSocioChange(index, 'rg')}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={`Estado Civil Sócio ${index + 1}`}
                select
                value={socio.estadoCivil}
                onChange={handleSocioChange(index, 'estadoCivil')}
                margin="dense"
              >
                <MenuItem value="Solteiro">Solteiro</MenuItem>
                <MenuItem value="Casado">Casado</MenuItem>
                <MenuItem value="Divorciado">Divorciado</MenuItem>
                <MenuItem value="Viúvo">Viúvo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={`Naturalidade Sócio ${index + 1}`}
                value={socio.naturalidade}
                onChange={handleSocioChange(index, 'naturalidade')}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumericFormat
                fullWidth
                label={`Porcentagem Sócio ${index + 1}`}
                customInput={TextField}
                value={socio.porcentagem}
                decimalScale={2}
                suffix="%"
                onValueChange={(values) => {
                  setFormData((prev) => {
                    const updatedSocios = [...prev.socios];
                    updatedSocios[index].porcentagem = values.value;
                    return { ...prev, socios: updatedSocios };
                  });
                }}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={`Regime de Bens Sócio ${index + 1}`}
                value={socio.regimeBens}
                onChange={handleSocioChange(index, 'regimeBens')}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={`Endereço Sócio ${index + 1}`}
                value={socio.endereco}
                onChange={handleSocioChange(index, 'endereco')}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={`Profissão Sócio ${index + 1}`}
                value={socio.profissao}
                onChange={handleSocioChange(index, 'profissao')}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={`CNH Sócio ${index + 1}`}
                value={socio.cnh}
                onChange={handleSocioChange(index, 'cnh')}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={socio.administrador}
                    onChange={handleSwitchChange(index, 'administrador')}
                  />
                }
                label={`Administrador Sócio ${index + 1}`}
              />
            </Grid>
            <Divider sx={{ my: 2, width: '100%' }} />
          </React.Fragment>
        ))}

        {/* Outros Campos */}
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
            onValueChange={(values) => {
              setFormData((prev) => ({
                ...prev,
                capitalSocial: values.value,
              }));
            }}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumericFormat
            fullWidth
            label="Valor Mensalidade"
            customInput={TextField}
            value={formData.valorMensalidade}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            prefix="R$ "
            onValueChange={(values) => {
              setFormData((prev) => ({
                ...prev,
                valorMensalidade: values.value,
              }));
            }}
            margin="dense"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Observações"
            value={formData.observacoes}
            onChange={handleInputChange('observacoes')}
            margin="dense"
          />
        </Grid>

        {/* DocumentsManager */}
        <DocumentsManager
          formData={formData}
          setFormData={setFormData}
          aberturaId={currentAbertura._id}
        />
      </Grid>

      {/* Botões de Ação */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="center">
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading.value}
          startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
        >
          Salvar
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleReject}
          disabled={loading.value}
          startIcon={<Iconify icon="eva:close-circle-fill" />}
        >
          Reprovar
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleApprove}
          disabled={loading.value}
          startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
        >
          Aprovar
        </Button>
      </Stack>
    </Card>
  );
}
