'use client';

import { toast } from 'sonner';
import InputMask from 'react-input-mask';
import React, { useState, useEffect } from 'react';

import { styled } from '@mui/material/styles';
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
  InputAdornment,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { consultarCep } from 'src/utils/consultarCep';

import { updateAbertura, deletarArquivo, downloadArquivo } from 'src/actions/societario';

import DialogDocumentsAbertura from './abertura-dialog-documento';

// Funções auxiliares para formatar e remover formatação de moeda
const formatCurrency = (value) => {
  const numberValue = Number(value.replace(/[^\d]/g, '')) / 100;
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const unformatCurrency = (value) => Number(value.replace(/[^\d]/g, '')) / 100;

export function AberturaConstituicaoForm({ currentAbertura, fetchAbertura }) {
  const [formData, setFormData] = useState({
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
    notificarWhats: false,
    marcaRegistrada: false,
    interesseRegistroMarca: false,
    possuiRT: false,
    iptuAnexo: null,
    rgAnexo: null,
    situacaoAbertura: 0,
    somenteAtualizar: true,
    numSocios: 1, // Valor padrão para número de sócios
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
  });

  const loading = useBoolean();
  const [loadingCep, setLoadingCep] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [numSocios, setNumSocios] = useState(1);

  useEffect(() => {
    if (currentAbertura) {
      setFormData((prevData) => ({
        ...prevData,
        ...currentAbertura,
        socios: Array.isArray(currentAbertura.socios) ? currentAbertura.socios : prevData.socios,
        enderecoComercial: {
          ...prevData.enderecoComercial,
          ...currentAbertura.enderecoComercial,
        },
        situacaoAbertura: currentAbertura.situacaoAbertura || prevData.situacaoAbertura,
        numSocios: currentAbertura.socios?.length || prevData.numSocios, // Garantir que sócios e numSocios sejam atualizados
      }));
      setNumSocios(currentAbertura.socios?.length || 1); // Atualizar o número de sócios
    }
  }, [currentAbertura]);

  useEffect(() => {
    if (formData.situacaoAbertura !== (currentAbertura?.situacaoAbertura || 0)) {
      setFormData((prevData) => ({
        ...prevData,
        somenteAtualizar: false,  // Atualizar para `false` quando `situacaoAbertura` for alterado
      }));
    }
  }, [formData.situacaoAbertura, currentAbertura]);

  // Função para atualizar os dados do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [mainField, subField] = name.split('.');

    if (subField) {
      setFormData((prevData) => ({
        ...prevData,
        [mainField]: {
          ...prevData[mainField],
          [subField]: value,
        },
      }));
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  // Função para alterar o número de sócios dinamicamente
  const handleNumSociosChange = (event) => {
    const value = parseInt(event.target.value, 10);
    const newSocios = [...formData.socios];

    if (value > numSocios) {
      // Adiciona novos sócios se o número aumentar
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
        });
      }
    } else {
      // Remove sócios se o número diminuir
      newSocios.splice(value);
    }

    setNumSocios(value);
    setFormData({ ...formData, socios: newSocios });
  };

  const handleCapitalSocialChange = (event) => {
    const { value } = event.target;
    const numericValue = unformatCurrency(value);

    setFormData({
      ...formData,
      capitalSocial: numericValue, // Armazenado como número
    });
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const StyledGrid = styled(Grid)(({ theme }) => ({
    marginTop: theme.spacing(4.8),
    [theme.breakpoints.down('md')]: {
      order: -1,
      width: '100%',
    },
  }));

  const renderDocument = (url, name, id) => {
    if (!url) {
      return (
        <DialogDocumentsAbertura name={name} id={id} fetchAbertura={fetchAbertura} />
      );
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
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => downloadArquivo(id, name, filename)}
            >
              Baixar {name}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => deletarArquivo(id, name)}
            >
              Deletar
            </Button>
          </Box>
        </Box>
      </StyledGrid>
    );
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
                  label="Email  Financeiro"
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
                  type="password"
                  label="Senha GOV"
                  name="senhaGOV"
                  fullWidth
                  value={formData.senhaGOV || ''}
                  onChange={handleChange}
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
                  onChange={(e) => handleChange(e)} // Garante que o handleChange seja chamado corretamente
                  onBlur={handleCepBlur} // A função que busca o CEP
                >
                  {(inputProps) => (
                    <TextField
                      {...inputProps} // Passa as propriedades do InputMask para o TextField
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
                  name="enderecoComercial.numero" // Nome correto para alterar dentro do objeto enderecoComercial
                  fullWidth
                  value={formData.enderecoComercial.numero || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Complemento"
                  name="enderecoComercial.complemento" // Nome correto para alterar dentro do objeto enderecoComercial
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={`Nome Sócio ${i + 1}`}
                      name={`socios.${i}.nome`} // Nome ajustado para incluir o índice do sócio
                      fullWidth
                      value={formData.socios[i]?.nome || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={`CPF Sócio ${i + 1}`}
                      name={`socios.${i}.cpf`} // Nome ajustado para incluir o índice do sócio
                      fullWidth
                      value={formData.socios[i]?.cpf || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={`RG Sócio ${i + 1}`}
                      name={`socios.${i}.rg`} // Nome ajustado para incluir o índice do sócio
                      fullWidth
                      value={formData.socios[i]?.rg || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label={`Estado Civil Sócio ${i + 1}`}
                      name={`socios.${i}.estadoCivil`} // Nome ajustado para incluir o índice do sócio
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
                        name={`socios.${i}.regimeBens`} // Nome ajustado para incluir o índice do sócio
                        fullWidth
                        value={formData.socios[i]?.regimeBens || ''}
                        onChange={handleChange}
                      >
                        <MenuItem value="Comunhão Parcial de Bens">
                          Comunhão Parcial de Bens
                        </MenuItem>
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
                      name={`socios.${i}.porcentagem`} // Nome ajustado para incluir o índice do sócio
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
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Capital Social"
                  name="capitalSocial"
                  fullWidth
                  value={formatCurrency(formData.capitalSocial.toString())} // Formatação BRL para exibição
                  onChange={handleCapitalSocialChange}
                />
              </Grid>

              {/* Responsável na Receita Federal */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Responsável na Receita Federal"
                  name="responsavelReceitaFederal"
                  fullWidth
                  value={formData.responsavelReceitaFederal || ''}
                  onChange={handleChange}
                >
                {Array.isArray(formData.socios) && formData.socios.map((socio, index) => (
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
              {formData.statusAbertura === "em_constituicao" && (
                  <Grid item xs={12} sm={12} md={12}>
                    <TextField
                      select
                      label="Situação da Abertura"
                      name="situacaoAbertura"
                      value={formData.situacaoAbertura}
                      onChange={handleChange}
                      fullWidth
                    >
                      <MenuItem value={0}>Solicitando Viabilidade</MenuItem>
                      <MenuItem value={1}>Aprovação da Viabilidade</MenuItem>
                      <MenuItem value={2}>Pagamento taxas de registro</MenuItem>
                      <MenuItem value={3}>Assinatura do processo</MenuItem>
                      <MenuItem value={4}>Protocolo do processo</MenuItem>
                      <MenuItem value={5}>Aguardando deferimento</MenuItem>
                      <MenuItem value={6}>Processo deferido</MenuItem>
                      <MenuItem value={7}>
                        Emissão de certificado Digital
                      </MenuItem>
                      <MenuItem value={8}>
                        Inicio de licenças e alvaras
                      </MenuItem>
                      <MenuItem value={9}>
                        Autorização de NF e Regime de tributação
                      </MenuItem>
                      <MenuItem value={10}>Abertura concluida</MenuItem>
                    </TextField>
                  </Grid>
                )}

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

              {/* Marca Registrada */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notificarWhats || false}
                      onChange={handleChange}
                      name="notificarWhats"
                    />
                  }
                  label="Notificar Whatsapp?"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.marcaRegistrada || false}
                      onChange={handleChange}
                      name="marcaRegistrada"
                    />
                  }
                  label="Tem marca registrada?"
                />
              </Grid>

              {/* Interesse em registrar marca */}
              {!formData.marcaRegistrada && (
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.interesseRegistroMarca || false}
                        onChange={handleChange}
                        name="interesseRegistroMarca"
                      />
                    }
                    label="Interesse em registrar marca?"
                  />
                </Grid>
              )}

              {/* Possui RT */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.possuiRT || false}
                      onChange={handleChange}
                      name="possuiRT"
                    />
                  }
                  label="Possui RT?"
                />
              </Grid>

              {/* Upload de Documentos */}
              <Grid item xs={12}>
                <Typography variant="h6">Documentos</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                {renderDocument(formData.rgAnexo, 'RG', currentAbertura._id)}
              </Grid>
              <Grid item xs={12} sm={4}>
                {renderDocument(formData.iptuAnexo, 'IPTU', currentAbertura._id)}
              </Grid>
              {formData.possuiRT && (
                <Grid item xs={12} sm={4} md={3}>
                  {renderDocument(formData.rtAnexo, 'RT', currentAbertura._id)}
                </Grid>
              )}
            </Grid>
      )}

      {activeTab === 1 && (
      <Grid container spacing={2} mt={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Kickoff</Typography>
      </Grid>
      <Grid item xs={12} sm={12}>     
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                multiline
                rows={4}
                label="História do Negócio"
                name="historiaNegocio"
                fullWidth
                value={formData.historiaNegocio || ""}
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
                  value={formData.atividadeServico || ""}
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
                  value={formData.atividadeComercio || ""}
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
                label="Possui Maquinas no local?"
              />
            </Grid>
            {formData.possuiMaquinas && (
              <Grid item xs={12}>
                <TextField
                  multiline
                  rows={4}
                  label="Quais Maquinas?"
                  name="maquinas"
                  fullWidth
                  value={formData.maquinas || ""}
                  onChange={handleChange}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
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
                  value={formData.sistemaUtilizado || ""}
                  onChange={handleChange}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="URL da Meet Kickoff"
                name="urlMeetKickoff"
                fullWidth
                value={formData.urlMeetKickoff || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
         
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