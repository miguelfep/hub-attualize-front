'use client';

// Definir o componente como Client Component

import { toast } from 'sonner';
import React, { useState } from 'react';
import InputMask from 'react-input-mask';

import Divider from '@mui/material/Divider';
import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  MenuItem,
  Container,
  TextField,
  Typography,
  CardContent,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { consultarCep } from 'src/utils/consultarCep';

import { deletarArquivo, updateAbertura, downloadArquivo, solicitarAprovacaoPorId } from 'src/actions/societario';

import ComponenteEmConstituicao from 'src/components/abertura/ComponenteEmConstituicao';
import ComponenteAguardandoValidacao from 'src/components/abertura/ComponenteAguardandoValidacao';
import ComponenteAberturaFinalizada from 'src/components/abertura/ComponenteAberturaFinalizada';

import DialogDocumentsAbertura from 'src/sections/societario/abertura-dialog-documento';


const unformatCurrency = (value) =>
  // Remove tudo que não seja dígito
  Number(value.replace(/[^\d]/g, '')) / 100;
const AberturaEmpresaViewPage = ({ aberturaData }) => {
 
  const [formData, setFormData] = useState({
    statusAbertura: aberturaData.statusAbertura || '', 
    situacaoAbertura: aberturaData.situacaoAbertura || '', // Adicionando statusAbertura
    nome: aberturaData.nome || '',
    cpf: aberturaData.cpf || '',
    nomeEmpresarial: aberturaData.nomeEmpresarial || '',
    nomeFantasia: aberturaData.nomeFantasia || '',
    email: aberturaData.email || '',
    telefone: aberturaData.telefone || '',
    emailFinanceiro: aberturaData.emailFinanceiro || '',
    telefoneComercial: aberturaData.telefoneComercial || '',
    horarioFuncionamento: aberturaData.horarioFuncionamento || '',
    metragemImovel: aberturaData.metragemImovel || '',
    metragemUtilizada: aberturaData.metragemUtilizada || '',
    senhaGOV: aberturaData.senhaGOV || '',
    capitalSocial: aberturaData.capitalSocial || 0,
    responsavelReceitaFederal: aberturaData.responsavelReceitaFederal || '',
    formaAtuacao: aberturaData.formaAtuacao || '',
    descricaoAtividades: aberturaData.descricaoAtividades || '',
    observacoes: aberturaData.observacoes || '',
    marcaRegistrada: aberturaData.marcaRegistrada || false,
    interesseRegistroMarca: aberturaData.interesseRegistroMarca || false,
    possuiRT: aberturaData.possuiRT || false,
    rgAnexo: aberturaData.rgAnexo || null,
    iptuAnexo: aberturaData.iptuAnexo || null,
    documentoRT: aberturaData.documentoRT || null,
    enderecoComercial: {
      cep: aberturaData.enderecoComercial?.cep || '',
      logradouro: aberturaData.enderecoComercial?.logradouro || '',
      numero: aberturaData.enderecoComercial?.numero || '',
      complemento: aberturaData.enderecoComercial?.complemento || '',
      bairro: aberturaData.enderecoComercial?.bairro || '',
      cidade: aberturaData.enderecoComercial?.cidade || '',
      estado: aberturaData.enderecoComercial?.estado || '',
    },
    socios: aberturaData.socios || [
      {
        nome: '',
        cpf: '',
        rg: '',
        cnh: '',
        endereco: '',
        administrador: false,
        regimeBens: '',
        porcentagem: 0,
        profissao: '',
        estadoCivil: '',
        naturalidade: '',
      },
    ],
  });

  const handleFileUploaded = ( updatedData) => {
    setFormData((prevState) => ({
      ...prevState,
      ...updatedData, 
    }));
  };

  const handleFileDownload = async (id, name, filename) => {
    try {
      const response = await downloadArquivo(id, name, filename);
  
      // Criar um URL temporário para o blob
      const blob = new Blob([response.data], { type: response.data.type });
      const url = window.URL.createObjectURL(blob);
  
      // Criar um link temporário para disparar o download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Nome do arquivo a ser baixado
  
      // Adicionar o link ao DOM
      document.body.appendChild(link);
  
      // Disparar o download
      link.click();
  
      // Remover o link temporário do DOM
      document.body.removeChild(link);
  
      // Revogar o URL temporário
      window.URL.revokeObjectURL(url);
  
      toast.success(`${name} baixado com sucesso.`);
    } catch (error) {
      toast.error(`Erro ao baixar ${name}`);
    }
  };

  const handleFileDelete = async (id, name) => {
    try {
      // Chamada da API para deletar o arquivo e obter o novo estado do objeto
      const response = await deletarArquivo(id, name);
  
      if (response && response.data) {
        // Atualizando o estado local com os dados retornados da API
        setFormData((prevState) => ({
          ...prevState,
          ...response.data, // Atualiza o estado com os novos valores retornados da API
        }));
  
        toast.success(`${name} deletado com sucesso.`);
      } else {
        toast.error(`Erro ao atualizar o estado após deletar ${name}`);
      }
    } catch (error) {
      toast.error(`Erro ao deletar ${name}`);
    }
  };
  

  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [numSocios, setNumSocios] = useState(formData.socios.length || 1);

  const handleApproval = async () => {
    try {
     
      const updatedFormData = { ...formData, statusAbertura: "em_validacao" };

      const response = await updateAbertura(aberturaData._id, updatedFormData);
      if (response.status === 200) {
        const res = await solicitarAprovacaoPorId(aberturaData._id);
        if (res.status === 200) {
          toast.success("Solicitação de aprovação enviada com sucesso");
          setFormData(updatedFormData); // Atualiza o statusAbertura para "em_validacao"

        }
      }
    } catch (error) {
      if (error) {
        toast.error("Erro ao solicitar aprovação");

      } else {
        console.error("Erro ao solicitar aprovação:", error);
        toast.error("Erro ao solicitar aprovação");
      }
    } finally {
      setLoadingApproval(false); // Desativar estado de carregamento
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const [field, subfield] = name.split('.'); // Lida com campos aninhados como enderecoComercial.cep

    if (field === 'socios') {
      // Atualiza os dados dos sócios
      const newSocios = [...formData.socios];
      newSocios[parseInt(subfield, 10)] = {
        ...newSocios[parseInt(subfield, 10)],
        [event.target.name.split('.').pop()]: type === 'checkbox' ? checked : value,
      };
      setFormData({ ...formData, socios: newSocios });
    } else if (field === 'enderecoComercial') {
      // Atualiza os dados de enderecoComercial
      setFormData({
        ...formData,
        enderecoComercial: {
          ...formData.enderecoComercial,
          [subfield]: value, // Atualiza o campo específico de enderecoComercial
        },
      });
    } else {
      // Atualiza os outros campos
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
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
          endereco: '',
          administrador: false,
          regimeBens: '',
          porcentagem: 0,
          estadoCivil: '',
          naturalidade: '',
        });
      }
    } else {
      newSocios.splice(value);
    }
    setNumSocios(value);
    setFormData({ ...formData, socios: newSocios });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // No submit, envie o valor como number
    const formDataToSend = {
      ...formData,
      capitalSocial: formData.capitalSocial, // Capital Social como número
    };

    try {
      const response = await updateAbertura(aberturaData._id, formDataToSend);
      if (response.status === 200) {
        toast.success('Dados atualizados com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar abertura');
    }
  };

  const handleCapitalSocialChange = (event) => {
    const { value } = event.target;

    // Armazenar o valor numérico real sem formatação
    const numericValue = unformatCurrency(value); 

    setFormData({
      ...formData,
      capitalSocial: numericValue, // Armazena o valor sem formatação
    });
  };

  const handleCepBlur = async () => {
    const cep = formData.enderecoComercial.cep.replace('-', '');
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const data = await consultarCep(cep);
        if (!data.erro) {
          setFormData({
            ...formData,
            enderecoComercial: {
              ...formData.enderecoComercial,
              logradouro: data.logradouro,
              complemento: data.complemento,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf,
            },
          });
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        toast.error('Erro ao buscar o CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const renderDocument = (url, name, id) => {
    if (!url) {
      return (
         <DialogDocumentsAbertura
          document={formData[name]}
          name={name}
          id={id}
          onFileUploaded={handleFileUploaded}
        />
      );
    }
    const filename = url.split('/').pop();
    return (
      <Grid item xs={12} md={12}>
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
              onClick={() => handleFileDownload(id, name, filename)}
            >
              Baixar {name}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => handleFileDelete(id, name)}
            >
              Deletar
            </Button>
          </Box>
        </Box>
      </Grid>
    );
  };

  // Se o status da abertura for "aguardando_validacao", exibir o componente correspondente
  if (formData.statusAbertura === "em_validacao") {
    return <ComponenteAguardandoValidacao />;
  }

    // Se o status da abertura for "aguardando_validacao", exibir o componente correspondente
    if (formData.statusAbertura === "em_constituicao") {
      return <ComponenteEmConstituicao  formData={formData} />;
    }

       // Se o status da abertura for "aguardando_validacao", exibir o componente correspondente
       if (formData.statusAbertura === "finalizado") {
        return <ComponenteAberturaFinalizada  formData={formData} />;
      }
  

  return (
    <Container sx={{ mb: 10 }}>
      <Box sx={{ textAlign: 'center', my: { xs: 2, md: 5 } }}>
        <Box
          component="img"
          alt="logo"
          src="/logo/hub-tt.png"
          sx={{
            width: 48,
            height: 48,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <Typography variant="h4">Preencha os dados da abertura da sua empresa</Typography>
      </Box>

      {/* Formulário de preenchimento */}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Informações principais */}
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
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label={`Nome Sócio ${i + 1}`}
                      name={`socios.${i}.nome`} // Nome ajustado para incluir o índice do sócio
                      fullWidth
                      value={formData.socios[i]?.nome || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label={`CPF Sócio ${i + 1}`}
                      name={`socios.${i}.cpf`} // Nome ajustado para incluir o índice do sócio
                      fullWidth
                      value={formData.socios[i]?.cpf || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label={`RG Sócio ${i + 1}`}
                      name={`socios.${i}.rg`} // Nome ajustado para incluir o índice do sócio
                      fullWidth
                      value={formData.socios[i]?.rg || ''}
                      onChange={handleChange}
                    />
                  </Grid>                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label={`CNH Sócio ${i + 1}`}
                      name={`socios.${i}.cnh`} // Nome ajustado para incluir o índice do sócio
                      fullWidth
                      value={formData.socios[i]?.cnh || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label={`Endereço Sócio ${i + 1}`}
                      name={`socios.${i}.endereco`} // Nome ajustado para incluir o índice do sócio
                      fullWidth
                      value={formData.socios[i]?.endereco || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label={`Profissão Sócio ${i + 1}`}
                      name={`socios.${i}.profissao`} // Nome ajustado para incluir o índice do sócio
                      fullWidth
                      value={formData.socios[i]?.profissao || ''}
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
                value={formData.capitalSocial.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })} // Exibição do valor formatado como BRL
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
                  {formData.socios.map((socio, index) => (
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
                {renderDocument(formData.rgAnexo, 'RG', aberturaData._id)}
              </Grid>
              <Grid item xs={12} sm={4}>
                {renderDocument(formData.iptuAnexo, 'IPTU', aberturaData._id)}
              </Grid>
              {formData.possuiRT && (
                <Grid item xs={12} sm={4} md={4}>
                  {renderDocument(formData.documentoRT, 'RT', aberturaData._id)}
                </Grid>
              )}
            </Grid>

            <Box
              display="flex"
              justifyContent="space-between"
              mt={3}
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 },
              }}
            >
              <Button variant="contained" color="secondary" type="submit">
                Salvar Alterações
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApproval}
              >
                Enviar para Aprovação
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AberturaEmpresaViewPage;
