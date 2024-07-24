import { z as zod } from 'zod';

export const NewClienteSchema = zod.object({
  avatarUrl: zod.string().optional(),
  nome: zod.string().min(1, { message: 'Nome é obrigatório!' }),
  razaoSocial: zod.string().optional(),
  cnpj: zod.string().min(1, { message: 'CNPJ é obrigatório!' }),
  codigo: zod.number().optional(),
  email: zod
    .string()
    .min(1, { message: 'Email é obrigatório!' })
    .email({ message: 'Email deve ser um endereço válido!' }),
  emailFinanceiro: zod.string().optional(),
  whatsapp: zod.string().min(1, { message: 'Telefone é obrigatório!' }),
  telefoneComercial: zod.string().optional(),
  observacao: zod.string().optional(),
  im: zod.string().optional(),
  ie: zod.string().optional(),
  atividade_principal: zod
    .array(
      zod.object({
        code: zod.string(),
        text: zod.string(),
      })
    )
    .optional(),
  atividades_secundarias: zod
    .array(
      zod.object({
        code: zod.string(),
        text: zod.string(),
      })
    )
    .optional(),
  dataEntrada: zod.union([zod.date(), zod.string().optional(), zod.null()]).optional(),
  dataSaida: zod.union([zod.date(), zod.string().optional(), zod.null()]).optional(),
  regimeTributario: zod.string().optional(),
  planoEmpresa: zod.string().optional(),
  tributacao: zod.array(zod.string()).optional(),
  dadosFiscal: zod.string().optional(),
  dadosContabil: zod.string().optional(),
  status: zod.boolean().optional(),
  tipoContato: zod.string().optional(),
  tipoNegocio: zod.array(zod.string()).optional(),
  contadorResponsavel: zod.string().optional(),
  endereco: zod
    .array(
      zod.object({
        rua: zod.string().optional(),
        numero: zod.string().optional(),
        complemento: zod.string().optional(),
        cidade: zod.string().optional(),
        estado: zod.string().optional(),
        cep: zod.string().optional(),
      })
    )
    .optional(),
  socios: zod
    .array(
      zod.object({
        nome: zod.string().optional(),
        cpf: zod.string().optional(),
        rg: zod.string().optional(),
        cnh: zod.string().optional(),
        administrador: zod.boolean().optional(),
      })
    )
    .optional(),
});
