'use client';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import ComponenteEmConstituicao from "src/components/alteracao/ComponenteEmConstituicao";
import ComponenteAlteracaoFinalizada from "src/components/alteracao/ComponenteAlteracaoFinalizada";
import ComponenteAguardandoValidacao from "src/components/alteracao/ComponenteAguardandoValidacao";

import { AlteracaoFormWizard } from "./alteracao-form-wizard";

const AlteracaoSchema = z.object({
  _id: z.string(),
  nomeEmpresarial: z.string().min(1, 'Nome Empresarial deve ter pelo menos 1 caractere'),
  nomeEmpresarialEnabled: z.boolean(),
  nomeFantasia: z.string().min(1, 'Nome Fantasia deve ter pelo menos 1 caractere'),
  nomeFantasiaEnabled: z.boolean(),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18, 'CNPJ inválido'),
  email: z.string().email('E-mail inválido'),
  emailEnabled: z.boolean(),
  telefoneComercial: z.string().max(16, 'Telefone Comercial Inválido'),
  telefoneComercialEnabled: z.boolean(),
  capitalSocial: z.string().optional(),
  capitalSocialEnabled: z.boolean(),
  regimeTributario: z.string().optional(),
  regimeTributarioEnabled: z.boolean(),
  responsavelTecnico: z.string().optional(),
  responsavelTecnicoEnabled: z.boolean(),
  possuiRT: z.boolean().optional(),
  formaAtuacao: z.string().optional(),
  formaAtuacaoEnabled: z.boolean(),
  notificarWhats: z.boolean().optional(),
  marcaRegistrada: z.boolean().optional(),
  interesseRegistroMarca: z.boolean().optional(),
  cep: z.string().min(8, 'CEP inválido').max(11, 'CEP inválido'),
  cepEnabled: z.boolean(),
  logradouro: z.string().min(3, 'Endereço Inválido'),
  bairro: z.string().min(2, 'Bairro Inválido'),
  cidade: z.string().min(3, 'Cidade Inválida'),
  numero: z.string().min(1, 'Número Inválido'),
  numeroEnabled: z.boolean(),
  complemento: z.string().optional(),
  complementoEnabled: z.boolean(),
  descricao: z.string().min(10, 'Descrição Inválida').max(300, 'Limite de 300 caracteres atingido'),
  atividadePrimariaEnabled: z.boolean(),
  atividadeSecundaria: z.string().max(300, 'Limite de 300 caracteres atingido').optional(),
  atividadeSecundariaEnabled: z.boolean(),
  socios: z.array(
    z.object({
      nome: z.string().min(1, 'Nome Inválido'),
      cpf: z.string().min(11, 'CPF Inválido').max(14, 'CPF Inválido'),
      cnh: z.string().min(11, 'CNH Inválida').optional(),
      cnhAnexo: z.optional(),
      rg: z.string().min(7, 'RG Inválido').optional(),
      estadoCivil: z.string().min(1, 'Estado Civil Inválido'),
      porcentagem: z.number().min(1, 'Porcentagem Inválida').max(100, 'Porcentagem Inválida'),
      administrador: z.boolean().optional(),
      regimeBens: z.string().min(1, 'Regime de Bens Inválido').optional(),
      endereco: z.string().min(1, 'Endereço Inválido'),
      profissao: z.string().min(1, 'Profissão Inválida').max(50, 'Limite de 50 caracteres atingido'),
      naturalidade: z.string().optional(),
      socioEnabled: z.boolean(),
    })
  ),
});

export default function AlteracaoEmpresaViewPage({ alteracaoData }) {
  const methods = useForm({
    defaultValues: {
      id: alteracaoData?._id || '',
      statusAlteracao: alteracaoData?.statusAlteracao || '',
      nomeEmpresarial: alteracaoData?.nomeEmpresarial || '',
      nomeEmpresarialEnabled: false,
      nomeFantasia: alteracaoData?.nomeFantasia || '',
      nomeFantasiaEnabled: false,
      cnpj: alteracaoData?.cnpj || '',
      email: alteracaoData?.email || '',
      emailEnabled: false,
      telefoneComercial: alteracaoData?.telefoneComercial || '',
      telefoneComercialEnabled: false,
      capitalSocial: alteracaoData?.capitalSocial || '',
      capitalSocialEnabled: false,
      regimeTributario: alteracaoData?.regimeTributario || '',
      regimeTributarioEnabled: false,
      responsavelTecnico: alteracaoData?.responsavelTecnico || '',
      responsavelTecnicoEnabled: false,
      possuiRT: alteracaoData?.possuiRT || false,
      formaAtuacao: alteracaoData?.formaAtuacao || '',
      formaAtuacaoEnabled: false,
      notificarWhats: alteracaoData?.notificarWhatsapp || false,
      marcaRegistrada: alteracaoData?.marcaRegistrada || false,
      interesseRegistroMarca: alteracaoData?.interesseRegistroMarca || false,
      cep: alteracaoData?.enderecoComercial?.cep || '',
      cepEnabled: false,
      logradouro: alteracaoData?.enderecoComercial?.logradouro || '',
      bairro: alteracaoData?.enderecoComercial?.bairro || '',
      cidade: alteracaoData?.enderecoComercial?.cidade || '',
      numero: alteracaoData?.enderecoComercial?.numero || '',
      numeroEnabled: false,
      complemento: alteracaoData?.enderecoComercial?.complemento || '',
      complementoEnabled: false,
      descricao: '',
      atividadePrimaria: alteracaoData?.atividadePrimaria?.label || '',
      atividadePrimariaEnabled: false,
     bobatividadeSecundaria: alteracaoData?.atividadeSecundaria || '',
      atividadeSecundariaEnabled: false,
      socios: alteracaoData?.socios?.length > 0
        ? alteracaoData.socios.map(socio => ({
            nome: socio?.nome || '',
            cpf: socio?.cpf || '',
            cnh: socio?.cnh || '',
            cnhAnexo: socio?.cnhAnexo || '',
            rg: socio?.rg || '',
            estadoCivil: socio?.estadoCivil || '',
            porcentagem: Number(socio?.porcentagem) || 0,
            administrador: socio?.administrador || false,
            regimeBens: socio?.regimeBens || '',
            endereco: socio?.endereco || '',
            profissao: socio?.profissao || '',
            naturalidade: socio?.naturalidade || '',
            socioEnabled: false,
          }))
        : [{
            nome: '',
            cpf: '',
            cnh: '',
            rg: '',
            porcentagem: 0,
            administrador: false,
            socioEnabled: false,
            regimeBens: '',
            endereco: '',
            profissao: '',
            estadoCivil: '',
            naturalidade: '',
          }],
    },
    resolver: zodResolver(AlteracaoSchema),
  });

  const { handleSubmit, formState: { errors } } = methods;

  const onSubmit = (data) => {
    console.log("Dados enviados:", data);
  };

  // Log para depuração (opcional, pode remover depois)
  console.log("Erros de validação:", errors);

  if (alteracaoData.statusAlteracao === "iniciado") {
    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlteracaoFormWizard alteracaoData={alteracaoData} />
        </form>
      </FormProvider>
    );
  }

  if (alteracaoData.statusAlteracao === "em_validacao") {
    return <ComponenteAguardandoValidacao formData={alteracaoData} />;
  }

  if (alteracaoData.statusAlteracao === "em_constituicao") {
    return <ComponenteEmConstituicao formData={alteracaoData} />;
  }

  if (alteracaoData.statusAlteracao === "finalizada") {
    return <ComponenteAlteracaoFinalizada formData={alteracaoData} />;
  }
}