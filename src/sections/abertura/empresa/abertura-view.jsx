'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import { Box, Card, Button, Container, Typography, CardContent } from '@mui/material';

import { updateAbertura, solicitarAprovacaoPorId } from 'src/actions/societario';

import ComponenteEmConstituicao from 'src/components/abertura/ComponenteEmConstituicao';
import ComponenteAberturaFinalizada from 'src/components/abertura/ComponenteAberturaFinalizada';
import ComponenteAguardandoValidacao from 'src/components/abertura/ComponenteAguardandoValidacao';

import SociosForm from './SociosForm';
import OthersInfo from './OthersInfo';
import AddressForm from './AddressForm';
import GeneralInfoForm from './GeneralInfoForm';
import DocumentsManager from './DocumentsManager';

const AberturaEmpresaViewPage = ({ aberturaData }) => {
  const [formData, setFormData] = useState(getInitialFormData(aberturaData));
  const [loadingApproval, setLoadingApproval] = useState(false);

  useEffect(() => {
    if (aberturaData) {
      setFormData((prev) => ({ ...prev, ...aberturaData }));
    }
  }, [aberturaData]);

  const handleSave = async () => {
    try {
      await updateAbertura(aberturaData._id, formData);
      toast.success('Dados salvos com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar os dados.');
    }
  };

  const handleApproval = async () => {
    setLoadingApproval(true);
    try {
      const updatedFormData = { ...formData, statusAbertura: 'em_validacao' };
      await updateAbertura(aberturaData._id, updatedFormData);
      await solicitarAprovacaoPorId(aberturaData._id);
      setFormData(updatedFormData);
      toast.success('Solicitação de aprovação enviada com sucesso.');
    } catch (error) {
      toast.error('Erro ao solicitar aprovação.');
    } finally {
      setLoadingApproval(false);
    }
  };

  if (formData.statusAbertura === 'em_validacao') {
    return <ComponenteAguardandoValidacao />;
  }
  if (formData.statusAbertura === 'em_constituicao') {
    return <ComponenteEmConstituicao formData={formData} />;
  }
  if (formData.statusAbertura === 'finalizado') {
    return <ComponenteAberturaFinalizada formData={formData} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 10, py: { xs: 2, md: 4 } }}>
      <Box sx={{ textAlign: 'center', my: { xs: 3, md: 5 } }}>
        {/* Adição do logo */}
        <Box
          component="img"
          alt="Logo da Empresa"
          src="/logo/hub-tt.png"
          sx={{
            width: { xs: 48, md: 64 },
            height: { xs: 48, md: 64 },
            mb: 2,
          }}
        />
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Preencha os dados da abertura da sua empresa
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Preencha todos os campos abaixo para prosseguir com a abertura
        </Typography>
      </Box>
      
      <Card elevation={2}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <GeneralInfoForm formData={formData} setFormData={setFormData} />
          <AddressForm formData={formData} setFormData={setFormData} />
          <SociosForm formData={formData} setFormData={setFormData} />
          <OthersInfo formData={formData} setFormData={setFormData} />
          <DocumentsManager
            formData={formData}
            setFormData={setFormData}
            aberturaId={aberturaData._id}
          />
          
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            gap={2}
            mt={4}
            pt={3}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          >
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleSave}
              fullWidth={{ xs: true, sm: false }}
              sx={{ minWidth: { sm: 180 } }}
            >
              Salvar Alterações
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApproval}
              disabled={loadingApproval}
              fullWidth={{ xs: true, sm: false }}
              sx={{ minWidth: { sm: 200 } }}
            >
              {loadingApproval ? 'Enviando...' : 'Enviar para Aprovação'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AberturaEmpresaViewPage;

function getInitialFormData(data) {
  return {
    statusAbertura: data.statusAbertura || '',
    situacaoAbertura: data.situacaoAbertura || '',
    nomeEmpresarial: data.nomeEmpresarial || '',
    nomeFantasia: data.nomeFantasia || '',
    nome: data.nome || '',
    cpf: data.cpf || '',
    email: data.email || '',
    emailFinanceiro: data.emailFinanceiro || '',
    telefone: data.telefone || '',
    telefoneComercial: data.telefoneComercial || '',
    horarioFuncionamento: data.horarioFuncionamento || '',
    metragemImovel: data.metragemImovel || '',
    metragemUtilizada: data.metragemUtilizada || '',
    senhaGOV: data.senhaGOV || '',
    capitalSocial: data.capitalSocial || 0,
    responsavelReceitaFederal: data.responsavelReceitaFederal || '',
    formaAtuacao: data.formaAtuacao || '',
    descricaoAtividades: data.descricaoAtividades || '',
    observacoes: data.observacoes || '',
    marcaRegistrada: data.marcaRegistrada || false,
    interesseRegistroMarca: data.interesseRegistroMarca || false,
    possuiRT: data.possuiRT || false,
    enderecoComercial: data.enderecoComercial || {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    socios:
      Array.isArray(data.socios) && data.socios.length > 0
        ? data.socios
        : [
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
    rgAnexo: data.rgAnexo || null,
    iptuAnexo: data.iptuAnexo || null,
    documentoRT: data.documentoRT || null,
    proLabore: data.proLabore || 0,
    previsaoFaturamento: data.previsaoFaturamento || 0,
    regimeTributario: data.regimeTributario || '',
  };
}
