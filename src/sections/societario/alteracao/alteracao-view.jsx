'use client';

import { z } from "zod";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { formatCpfCnpj } from "src/utils/format-number";

import { buscarCep } from "src/actions/cep";
import { updateAlteracao, aprovarAlteracaoPorId } from "src/actions/societario";

import ComponenteEmConstituicao from "src/components/alteracao/ComponenteEmAlteracao";
import ComponenteAlteracaoFinalizada from "src/components/alteracao/ComponenteAlteracaoFinalizada";
import ComponenteAguardandoValidacao from "src/components/alteracao/ComponenteAguardandoValidacao";

import { AlteracaoFormWizard } from "./alteracao-form-wizard";

const AlteracaoSchema = z.object({
  _id: z.string(),
  alteracoes: z.string().min(1, 'Campo obrigatório').max(300, 'Limite de 300 caracteres atingido'),
  razaoSocial: z.string().optional(),
  razaoSocialEnabled: z.boolean().optional(),
  nomeFantasia: z.string().optional(),
  nomeFantasiaEnabled: z.boolean().optional(),
  cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido').optional(),
  emailEnabled: z.boolean().optional(),
  whatsapp: z.string().min(10, 'Telefone Comercial Inválido').max(16, 'Telefone Comercial Inválido'),
  whatsappEnabled: z.boolean().optional(),
  capitalSocial: z.string().optional(),
  capitalSocialEnabled: z.boolean().optional(),
  regimeTributario: z.string().optional(),
  regimeTributarioEnabled: z.boolean().optional(),
  possuiRT: z.boolean().optional(),
  rgAnexo: z.any().optional(),
  iptuAnexo: z.any().optional(),
  documentoRT: z.any().optional(),
  marcaRegistrada: z.boolean().optional(),
  interesseRegistroMarca: z.boolean().optional(),
  cep: z.string().optional(),
  cepEnabled: z.boolean(),
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  numero: z.string().optional(),
  numeroEnabled: z.boolean(),
  complemento: z.string().optional(),
  novasAtividades: z.string().max(1500, 'Limite de 1500 caracteres atingido').optional(),
  novasAtividadesEnabled: z.boolean(),
  socios: z.array(
    z.object({
      nome: z.string().optional(),
      cpf: z.string().optional(),
      cnh: z.string().optional(),
      cnhAnexo: z.any().optional(),
      rg: z.string().optional(),
      estadoCivil: z.string().optional(),
      porcentagem: z.union([z.string(), z.number()]).transform((value) => {
        if (typeof value === 'string') {
          return parseFloat(value);
        }
        return value;
      }).optional(),
      administrador: z.boolean().optional(),
      regimeBens: z.string().optional(),
      etnia: z.string().optional(),
      grau_escolaridade: z.string().optional(),
      endereco: z.string().optional(),
      profissao: z.string().optional(),
      naturalidade: z.string().optional(),
      socioEnabled: z.boolean(),
    })
  ),
});

export default function AlteracaoEmpresaViewPage({ alteracaoData }) {
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const methods = useForm({
    defaultValues: {
      _id: alteracaoData?._id || '',
      alteracoes: alteracaoData?.alteracoes || '',
      statusAlteracao: alteracaoData?.statusAlteracao || 'iniciado',
      situacaoAlteracao: alteracaoData?.situacaoAlteracao || 0,
      razaoSocial: alteracaoData?.razaoSocial || alteracaoData?.cliente?.razaoSocial || '',
      razaoSocialEnabled: false,
      nomeFantasia: alteracaoData?.nomeFantasia || alteracaoData?.cliente?.nomeFantasia || '',
      nomeFantasiaEnabled: false,
      cnpj: alteracaoData?.cliente?.cnpj || '',
      email: alteracaoData?.email || alteracaoData?.cliente?.email || '',
      emailEnabled: false,
      whatsapp: alteracaoData?.whatsapp || alteracaoData?.cliente?.whatsapp || '',
      whatsappEnabled: false,
      capitalSocial: alteracaoData?.capitalSocial || '',
      capitalSocialEnabled: false,
      regimeTributario: alteracaoData?.regimeTributario || alteracaoData?.cliente?.regimeTributario || '',
      regimeTributarioEnabled: false,
      possuiRT: alteracaoData?.possuiRT || false,
      rgAnexo: alteracaoData?.rgAnexo || null,
      iptuAnexo: alteracaoData?.iptuAnexo || null,
      documentoRT: alteracaoData?.documentoRT || null,
      formaAtuacao: alteracaoData?.formaAtuacao ?? alteracaoData?.cliente?.formaAtuacao ?? '',
      formaAtuacaoEnabled: false,
      interesseRegistroMarca: alteracaoData?.interesseRegistroMarca || false,
      cep: alteracaoData?.enderecoComercial?.cep ?? alteracaoData?.cliente?.endereco?.[0]?.cep ?? '',
      cepEnabled: false,
      logradouro: alteracaoData?.enderecoComercial?.logradouro ?? alteracaoData?.cliente?.endereco?.[0]?.rua ?? '',
      bairro: alteracaoData?.enderecoComercial?.bairro ?? alteracaoData?.cliente?.endereco?.[0]?.bairro ?? '',
      cidade: alteracaoData?.enderecoComercial?.cidade ?? alteracaoData?.cliente?.endereco?.[0]?.cidade ?? '',
      numero: alteracaoData?.enderecoComercial?.numero ?? alteracaoData?.cliente?.endereco?.[0]?.numero ?? '',
      numeroEnabled: false,
      complemento: alteracaoData?.enderecoComercial?.complemento ?? alteracaoData?.cliente?.endereco?.[0]?.complemento ?? '',
      complementoEnabled: false,
      responsavelTecnico: alteracaoData?.responsavelTecnico ?? alteracaoData?.cliente?.responsavelReceitaFederal ?? '',
      novasAtividades: alteracaoData?.novasAtividades || '',
      novasAtividadesEnabled: false,
      socios: (alteracaoData?.socios?.length > 0
        ? alteracaoData.socios.map(socio => ({
          nome: socio?.nome || '',
          cpf: socio?.cpf || '',
          cnh: socio?.cnh || '',
          cnhAnexo: socio?.cnhAnexo || null,
          comprovanteEnderecoAnexo: socio?.comprovanteEnderecoAnexo || null,
          rg: socio?.rg || '',
          estadoCivil: socio?.estadoCivil || '',
          porcentagem: Number(socio?.porcentagem) || 0,
          administrador: socio?.administrador || false,
          regimeBens: socio?.regimeBens || '',
          etnia: socio?.etnia || '',
          grau_escolaridade: socio?.grau_escolaridade || '',
          endereco: socio?.endereco || '',
          profissao: socio?.profissao || '',
          naturalidade: socio?.naturalidade || '',
          socioEnabled: false,
        }))
        : alteracaoData?.cliente?.socios?.length > 0
          ? alteracaoData?.cliente?.socios.map(socio => ({
            nome: socio?.nome || '',
            cpf: socio?.cpf || '',
            cnh: socio?.cnh || '',
            cnhAnexo: socio?.cnhAnexo || '',
            comprovanteEnderecoAnexo: socio?.comprovanteEnderecoAnexo || null,
            rg: socio?.rg || '',
            estadoCivil: socio?.estadoCivil || '',
            porcentagem: Number(socio?.porcentagem) || 0,
            administrador: socio?.administrador || false,
            regimeBens: socio?.regimeBens || '',
            etnia: socio?.etnia || '',
            grau_escolaridade: socio?.grau_escolaridade || '',
            endereco: socio?.endereco || '',
            profissao: socio?.profissao || '',
            naturalidade: socio?.naturalidade || '',
            socioEnabled: false,
          }))
          : [{
            nome: '',
            cpf: '',
            cnh: '',
            cnhAnexo: '',
            comprovanteEnderecoAnexo: '',
            rg: '',
            estadoCivil: '',
            porcentagem: 0,
            administrador: false,
            regimeBens: '',
            etnia: '',
            grau_escolaridade: '',
            endereco: '',
            profissao: '',
            naturalidade: '',
            socioEnabled: false,
          }]
      ),
      anotacoes: alteracaoData?.anotacoes || '',
      urlMeetKickoff: alteracaoData?.urlMeetKickoff || '',
    },
    resolver: zodResolver(AlteracaoSchema),
  });


  useEffect(() => {
    const fetchBairro = async () => {
      const cep = alteracaoData?.enderecoComercial?.cep ?? alteracaoData?.cliente?.endereco?.[0]?.cep;
      if (cep) {
        const cepFormatado = cep.replace(/\D/g, '');
        const detalhes = await buscarCep(cepFormatado);
        methods.setValue('bairro', detalhes.bairro || '');
      }
    };
    fetchBairro();
  }, [alteracaoData, methods]);

  const { handleSubmit, getValues, formState: { errors }, } = methods;

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast.error('Preencha todos os campos obrigatórios corretamente');
    }
  }, [errors]);

  function prepararSocios(socios) {
    return socios.map((socio) => ({
      ...socio,
      cpf: formatCpfCnpj(socio.cpf),
      porcentagem: parseFloat(String(socio.porcentagem).replace('%', '').replace(',', '.')) || 0,
    }));
  }

  function prepareData(valores) {
    return {
      ...valores,
      capitalSocial: valores.capitalSocial,
      atividades_secundarias: valores.atividades_secundarias || '',
      socios: prepararSocios(valores.socios || []),
      regimeTributario: ['simples', 'presumido', 'real'].includes(valores.regimeTributario)
        ? valores.regimeTributario
        : 'simples',
      possuiRT: Boolean(valores.possuiRT),
      interesseRegistroMarca: Boolean(valores.interesseRegistroMarca),
      marcaRegistrada: Boolean(valores.marcaRegistrada),
      editarDocs: Boolean(valores.editarDocs),
      statusAlteracao: valores.statusAlteracao || 'iniciado',
      situcaoAlteracao: Number(valores.situcaoAlteracao) || 0,
      enderecoComercial: {
        cep: valores.cep,
        logradouro: valores.logradouro,
        bairro: valores.bairro,
        cidade: valores.cidade,
        numero: valores.numero,
        complemento: valores.complemento,
        estado: valores.estado,
      },
    };
  };


  const handleSave = async (data) => {
    try {
      const dadosFormatados = prepareData(data);
      const res = await updateAlteracao(alteracaoData._id, dadosFormatados);
      if (res.status === 200) {
        toast.success('Alteração salva com sucesso.');
      } else {
        toast.error('Erro ao salvar alteração');
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar alteração');
    }
  };


  const handleApproval = async (data) => {
    try {
      setIsValidating(true);
      const dadosFormatados = prepareData(data);
      const res = await aprovarAlteracaoPorId(alteracaoData._id, dadosFormatados);
      if (res.status === 200) {
        toast.success('Solicitação de aprovação enviada com sucesso.');
      } else {
        toast.error('Erro ao solicitar aprovação: resposta inesperada');
        setIsValidating(false);
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao solicitar aprovação');
      setIsValidating(false);
    }
  };


  if (alteracaoData.statusAlteracao === "iniciado") {
    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleApproval)}>
          <AlteracaoFormWizard
            formData={alteracaoData}
            // Salva os dados sem validar apenas para armazenar os dados 
            onSave={async () => {
              const rawData = getValues();
              const data = prepareData(rawData);
              await handleSave(data);
            }}
            // Envia os dados para aprovação depois de validar e finalizar o formulário
            onApproval={handleSubmit((rawData) => {
              const data = prepareData(rawData);
              handleApproval(data);
              setIsValidating(true);
              router.refresh();
            })}
          />
        </form>
      </FormProvider>

    );
  }

  if (isValidating || alteracaoData.statusAlteracao === "em_validacao") {
    return <ComponenteAguardandoValidacao formData={alteracaoData} />;
  }

  if (alteracaoData.statusAlteracao === "kickoff") {
    return <ComponenteAguardandoValidacao formData={alteracaoData} />;
  }

  if (alteracaoData.statusAlteracao === "em_alteracao") {
    return <ComponenteEmConstituicao formData={alteracaoData} />;
  }

  if (alteracaoData.statusAlteracao === "finalizado") {
    return <ComponenteAlteracaoFinalizada formData={alteracaoData} />;
  }
}