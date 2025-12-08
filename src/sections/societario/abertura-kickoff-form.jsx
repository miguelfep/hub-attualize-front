'use client';

import { toast } from 'sonner';
import InputMask from 'react-input-mask';
import { NumericFormat } from 'react-number-format';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Tab,
  Grid,
  Card,
  Tabs,
  Stack,
  Button,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { consultarCep } from 'src/utils/consultarCep';

import { updateAbertura } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

import DocumentsManager from '../abertura/empresa/DocumentsManager';

export function AberturaKickoffForm({ currentAbertura }) {
  const [formData, setFormData] = useState({
    nomeEmpresarial: '',
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
    capitalSocial: 0,
    valorMensalidade: 0,
    observacoes: '',
    descricaoAtividades: '',
    responsavelReceitaFederal: '',
    formaAtuacao: '',
    numSocios: 1,
    socios: [
      {
        nome: '',
        cpf: '',
        rg: '',
        estadoCivil: '',
        naturalidade: '',
        porcentagem: 0,
        administrador: false,
        regimeBens: '',
        endereco: '',
        profissao: '',
        cnh: '',
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
    historiaNegocio: '',
    possuiAtividadeServico: false,
    atividadeServico: '',
    possuiAtividadeComercio: false,
    atividadeComercio: '',
    possuiMaquinas: false,
    maquinas: '',
    possuiSistema: false,
    sistemaUtilizado: '',
    urlMeetKickoff: '',
    proLabore: 0,
    previsaoFaturamento: 0,
    regimeTributario: '',
    ...currentAbertura,
  });

  const loading = useBoolean();
  const [loadingCep, setLoadingCep] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [numSocios, setNumSocios] = useState(1);

  const [values, setValues] = useState({
    showPassword: false,
  });

  const handleShowPassword = useCallback(() => {
    setValues({ ...values, showPassword: !values.showPassword });
  }, [values]);

  const handleMouseDownPassword = useCallback((event) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    if (currentAbertura) {
      setFormData((prev) => ({
        ...prev,
        ...currentAbertura,
        capitalSocial: currentAbertura.capitalSocial || 0,
        valorMensalidade: currentAbertura.valorMensalidade || 0,
        proLabore: currentAbertura.proLabore || 0,
        previsaoFaturamento: currentAbertura.previsaoFaturamento || 0,
        socios: currentAbertura.socios || prev.socios,
        enderecoComercial: {
          ...prev.enderecoComercial,
          ...currentAbertura.enderecoComercial,
        },
      }));
      setNumSocios(currentAbertura.socios?.length || 1);
    }
  }, [currentAbertura]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const [field, subfield] = name.split('.');

    if (field === 'socios') {
      const updatedSocios = [...formData.socios];
      updatedSocios[parseInt(subfield, 10)] = {
        ...updatedSocios[parseInt(subfield, 10)],
        [name.split('.').pop()]: type === 'checkbox' ? checked : value,
      };
      setFormData({ ...formData, socios: updatedSocios });
    } else if (field === 'enderecoComercial') {
      setFormData({
        ...formData,
        enderecoComercial: {
          ...formData.enderecoComercial,
          [subfield]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleNumSociosChange = (event) => {
    const value = parseInt(event.target.value, 10);
    const newSocios = [...formData.socios];

    if (value > numSocios) {
      for (let i = numSocios; i < value; i += 1) {
        newSocios.push({
          nome: '',
          cpf: '',
          rg: '',
          estadoCivil: '',
          naturalidade: '',
          porcentagem: 0,
          administrador: false,
          regimeBens: '',
          endereco: '',
          profissao: '',
          cnh: '',
        });
      }
    } else {
      newSocios.splice(value);
    }

    setNumSocios(value);
    setFormData({ ...formData, socios: newSocios });
  };

  const handleCapitalSocialChange = (currencyValues) => {
    const { floatValue } = currencyValues;
    setFormData((prevData) => ({
      ...prevData,
      capitalSocial: floatValue,
    }));
  };

  const handleValorMensalidadeChange = (currencyValues) => {
    const { floatValue } = currencyValues;
    setFormData((prevData) => ({
      ...prevData,
      valorMensalidade: floatValue,
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
          setFormData((prevData) => ({
            ...prevData,
            enderecoComercial: {
              ...prevData.enderecoComercial,
              logradouro: data.logradouro,
              complemento: data.complemento,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf,
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

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

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

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="Dados da Abertura" />
        <Tab label="Kickoff" />
      </Tabs>
      {activeTab === 0 && (
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Razão Social"
              name="nomeEmpresarial"
              fullWidth
              value={formData.nomeEmpresarial || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nome Fantasia"
              name="nomeFantasia"
              fullWidth
              value={formData.nomeFantasia || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Nome"
              name="nome"
              fullWidth
              value={formData.nome || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="CPF"
              name="cpf"
              fullWidth
              value={formData.cpf || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Email"
              name="email"
              fullWidth
              value={formData.email || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Email Financeiro"
              name="emailFinanceiro"
              fullWidth
              value={formData.emailFinanceiro || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Telefone"
              name="telefone"
              fullWidth
              value={formData.telefone || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Telefone Comercial"
              name="telefoneComercial"
              fullWidth
              value={formData.telefoneComercial || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Horário de Funcionamento"
              name="horarioFuncionamento"
              fullWidth
              value={formData.horarioFuncionamento || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Metragem do Imóvel"
              helperText="*Metragem total do imovel"
              name="metragemImovel"
              fullWidth
              value={formData.metragemImovel || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Metragem Utilizada"
              helperText="*Área construida"
              name="metragemUtilizada"
              fullWidth
              value={formData.metragemUtilizada || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              type={values.showPassword ? 'text' : 'password'}
              label="Senha GOV"
              name="senhaGOV"
              fullWidth
              value={formData.senhaGOV || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:shield-key-bold" width={24} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {values.showPassword ? (
                        <Iconify icon="solar:eye-bold" width={24} />
                      ) : (
                        <Iconify icon="solar:eye-closed-bold" width={24} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {/* Endereço */}
          <Grid item xs={12}>
            <Typography variant="h6">Endereço Comercial</Typography>
          </Grid>

          <Grid item xs={12} sm={3}>
            <InputMask
              mask="99999-999"
              value={formData.enderecoComercial.cep}
              onChange={(e) => handleChange(e)}
              onBlur={handleCepBlur}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="CEP"
                  name="enderecoComercial.cep"
                  fullWidth
                  variant="outlined"
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

          <Grid item xs={12} sm={6}>
            <TextField
              label="Rua"
              name="enderecoComercial.logradouro"
              fullWidth
              value={formData.enderecoComercial.logradouro || ''}
              onChange={handleChange}
              disabled={loadingCep}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Número"
              name="enderecoComercial.numero"
              fullWidth
              value={formData.enderecoComercial.numero || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Complemento"
              name="enderecoComercial.complemento"
              fullWidth
              value={formData.enderecoComercial.complemento || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Bairro"
              name="enderecoComercial.bairro"
              fullWidth
              value={formData.enderecoComercial.bairro || ''}
              onChange={handleChange}
              disabled={loadingCep}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Cidade"
              name="enderecoComercial.cidade"
              fullWidth
              value={formData.enderecoComercial.cidade || ''}
              onChange={handleChange}
              disabled={loadingCep}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Estado"
              name="enderecoComercial.estado"
              fullWidth
              value={formData.enderecoComercial.estado || ''}
              onChange={handleChange}
              disabled={loadingCep}
            />
          </Grid>

          {/* Seletor de número de sócios */}
          <Grid item xs={12} sm={12}>
            <TextField
              select
              label="Número de Sócios"
              fullWidth
              value={numSocios}
              onChange={handleNumSociosChange}
            >
              {[...Array(10).keys()].map((i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {i + 1}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Renderização dos sócios */}
          <Grid item xs={12}>
            <Typography variant="h6">Sócios</Typography>
          </Grid>
          {[...Array(numSocios).keys()].map((i) => (
            <React.Fragment key={i}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={`Nome Sócio ${i + 1}`}
                  name={`socios.${i}.nome`}
                  fullWidth
                  value={formData.socios[i]?.nome || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={`CPF Sócio ${i + 1}`}
                  name={`socios.${i}.cpf`}
                  fullWidth
                  value={formData.socios[i]?.cpf || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={`RG Sócio ${i + 1}`}
                  name={`socios.${i}.rg`}
                  fullWidth
                  value={formData.socios[i]?.rg || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={`CNH Sócio ${i + 1}`}
                  name={`socios.${i}.cnh`}
                  fullWidth
                  value={formData.socios[i]?.cnh || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={`Endereço Sócio ${i + 1}`}
                  name={`socios.${i}.endereco`}
                  fullWidth
                  value={formData.socios[i]?.endereco || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={`Profissão Sócio ${i + 1}`}
                  name={`socios.${i}.profissao`}
                  fullWidth
                  value={formData.socios[i]?.profissao || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label={`Estado Civil Sócio ${i + 1}`}
                  name={`socios.${i}.estadoCivil`}
                  fullWidth
                  value={formData.socios[i]?.estadoCivil || ''}
                  onChange={handleChange}
                >
                  <MenuItem value="Solteiro">Solteiro</MenuItem>
                  <MenuItem value="Casado">Casado</MenuItem>
                  <MenuItem value="Divorciado">Divorciado</MenuItem>
                  <MenuItem value="Viúvo">Viúvo</MenuItem>
                  <MenuItem value="União estável">União estável</MenuItem>
                </TextField>
              </Grid>

              {formData.socios[i]?.estadoCivil === 'Casado' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label={`Regime de Bens Sócio ${i + 1}`}
                    name={`socios.${i}.regimeBens`}
                    fullWidth
                    value={formData.socios[i]?.regimeBens || ''}
                    onChange={handleChange}
                  >
                    <MenuItem value="Comunhão Parcial de Bens">Comunhão Parcial de Bens</MenuItem>
                    <MenuItem value="Comunhão Universal de Bens">
                      Comunhão Universal de Bens
                    </MenuItem>
                    <MenuItem value="Separação Total de Bens">Separação Total de Bens</MenuItem>
                    <MenuItem value="União estável">União estável</MenuItem>
                  </TextField>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  label={`Porcentagem Sócio ${i + 1}`}
                  name={`socios.${i}.porcentagem`}
                  fullWidth
                  value={formData.socios[i]?.porcentagem || ''}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, type: 'number' },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Naturalidade"
                  name={`socios.${i}.naturalidade`}
                  fullWidth
                  value={formData.socios[i]?.naturalidade || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.socios[i]?.administrador || false}
                      onChange={handleChange}
                      name={`socios.${i}.administrador`}
                    />
                  }
                  label="É Administrador?"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Divider />
                </Box>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12} sm={6} md={6}>
            <NumericFormat
              label="Capital Social"
              customInput={TextField}
              value={formData.capitalSocial}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              onValueChange={handleCapitalSocialChange}
              fullWidth
            />
          </Grid>

          {/* Responsável na Receita Federal */}
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              select
              label="Responsável na Receita Federal"
              name="responsavelReceitaFederal"
              fullWidth
              value={formData.responsavelReceitaFederal || ''}
              onChange={handleChange}
            >
              {Array.isArray(formData.socios) &&
                formData.socios.map((socio, index) => (
                  <MenuItem key={index} value={socio.nome}>
                    {socio.nome}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              select
              label="Forma de Atuação"
              name="formaAtuacao"
              fullWidth
              value={formData.formaAtuacao || ''}
              onChange={handleChange}
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
              label="Valor Mensalidade"
              name="valorMensalidade"
              customInput={TextField}
              value={formData.valorMensalidade}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              onValueChange={handleValorMensalidadeChange}
              fullWidth
            />
          </Grid>

          {/* Descrição das Atividades */}
          <Grid item xs={12} sm={6} md={12}>
            <TextField
              multiline
              rows={5}
              label="Descrição das Atividades"
              name="descricaoAtividades"
              fullWidth
              value={formData.descricaoAtividades || ''}
              onChange={handleChange}
            />
          </Grid>

          {/* Observações */}
          <Grid item xs={12} sm={6} md={12}>
            <TextField
              multiline
              rows={2}
              label="Observações"
              name="observacoes"
              fullWidth
              value={formData.observacoes || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={12}>
            <DocumentsManager
              formData={formData}
              setFormData={setFormData}
              aberturaId={currentAbertura._id}
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
          <TextField
            multiline
            rows={4}
            label="História do Negócio"
            name="historiaNegocio"
            fullWidth
            value={formData.historiaNegocio || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.possuiAtividadeServico || false}
                onChange={handleChange}
                name="possuiAtividadeServico"
              />
            }
            label="Possui Atividade de Serviço?"
          />
        </Grid>
        {formData.possuiAtividadeServico && (
          <Grid item xs={12}>
            <TextField
              multiline
              rows={4}
              label="Atividade de Serviço"
              name="atividadeServico"
              fullWidth
              value={formData.atividadeServico || ''}
              onChange={handleChange}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.possuiAtividadeComercio || false}
                onChange={handleChange}
                name="possuiAtividadeComercio"
              />
            }
            label="Possui Atividade de Comércio?"
          />
        </Grid>
        {formData.possuiAtividadeComercio && (
          <Grid item xs={12}>
            <TextField
              multiline
              rows={4}
              label="Atividade de Comércio"
              name="atividadeComercio"
              fullWidth
              value={formData.atividadeComercio || ''}
              onChange={handleChange}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.possuiMaquinas || false}
                onChange={handleChange}
                name="possuiMaquinas"
              />
            }
            label="Possui Máquinas no local?"
          />
        </Grid>
        {formData.possuiMaquinas && (
          <Grid item xs={12}>
            <TextField
              multiline
              rows={4}
              label="Quais Máquinas?"
              name="maquinas"
              fullWidth
              value={formData.maquinas || ''}
              onChange={handleChange}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.possuiSistema || false}
                onChange={handleChange}
                name="possuiSistema"
              />
            }
            label="Possui Sistema?"
          />
        </Grid>
        {formData.possuiSistema && (
          <Grid item xs={12}>
            <TextField
              multiline
              rows={3}
              label="Sistemas Utilizado"
              name="sistemaUtilizado"
              fullWidth
              value={formData.sistemaUtilizado || ''}
              onChange={handleChange}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            label="URL da Meet Kickoff"
            name="urlMeetKickoff"
            fullWidth
            value={formData.urlMeetKickoff || ''}
            onChange={handleChange}
          />
        </Grid>
        {/* Pro Labore */}
        <Grid item xs={12} sm={6} md={4}>
          <NumericFormat
            label="Pro Labore"
            customInput={TextField}
            value={formData.proLabore}
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            decimalScale={2}
            fixedDecimalScale
            onValueChange={({ floatValue }) =>
              setFormData((prevData) => ({
                ...prevData,
                proLabore: floatValue || 0,
              }))
            }
            fullWidth
          />
        </Grid>

        {/* Previsão de Faturamento */}
        <Grid item xs={12} sm={6} md={4}>
          <NumericFormat
            label="Previsão de Faturamento"
            customInput={TextField}
            value={formData.previsaoFaturamento}
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            decimalScale={2}
            fixedDecimalScale
            onValueChange={({ floatValue }) =>
              setFormData((prevData) => ({
                ...prevData,
                previsaoFaturamento: floatValue || 0,
              }))
            }
            fullWidth
          />
        </Grid>

        {/* Regime Tributário */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            select
            label="Regime Tributário"
            name="regimeTributario"
            fullWidth
            value={formData.regimeTributario || ''}
            onChange={handleChange}
          >
            <MenuItem value="Simples">Simples</MenuItem>
            <MenuItem value="Real">Real</MenuItem>
            <MenuItem value="Presumido">Presumido</MenuItem>
            <MenuItem value="Simei">Simei</MenuItem>
          </TextField>
        </Grid>
        </Grid>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="center">
        <Button variant="contained" onClick={handleSave} disabled={loading.value}>
          Salvar
        </Button>
      </Stack>
    </Card>
  );
}

