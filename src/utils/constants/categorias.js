// src/constants/categorias.js

// Categorias de Receitas
export const categoriasReceitas = [
  { _id: '1', nome: 'Receitas de Serviço Recorrente' },
  { _id: '2', nome: 'Receitas de Serviços Pontuais' },
  { _id: '3', nome: 'Receita de Serviços Consultivos' },
  { _id: '4', nome: 'Empréstimos Bancários' },
  { _id: '5', nome: 'Receita de Certificado Digital' },
];
// Categorias de Despesas
export const categoriasDespesas = [
  { _id: '6', nome: 'Despesa com Prestadores de Serviços' },
  { _id: '7', nome: 'Despesa de Aluguel' },
  { _id: '8', nome: 'Despesa com Assessorias e Associações' },
  { _id: '9', nome: 'Despesa com Anuidade CRC' },
  { _id: '10', nome: 'Despesa com Autônomos' },
  { _id: '11', nome: 'Bônus Funcionários' },
  { _id: '12', nome: 'Despesa com Cartão de Crédito' },
  { _id: '13', nome: 'Despesa com Confraternizações' },
  { _id: '14', nome: 'Despesa com Correios' },
  { _id: '15', nome: 'Despesa com Cursos e Treinamentos' },
  { _id: '16', nome: 'Despesa com Custas de Processos' },
  { _id: '17', nome: 'DAS - Simples Nacional' },
  { _id: '18', nome: 'Distribuição de Lucros' },
  { _id: '19', nome: 'Encargos - Rescisões Trabalhistas' },
  { _id: '20', nome: 'Encargos Funcionários - Horas Extras' },
  { _id: '21', nome: 'Despesa com Energia Elétrica' },
  { _id: '22', nome: 'Despesa com Exames Médicos' },
  { _id: '23', nome: 'Despesa com Frete' },
  { _id: '25', nome: 'Despesa com Internet' },
  { _id: '26', nome: 'Despesa com Licença ou Aluguel de Softwares' },
  { _id: '27', nome: 'Despesa com Limpeza e Conservação' },
  { _id: '28', nome: 'Despesa com Manutenção de Equipamentos' },
  { _id: '29', nome: 'Despesa com Material de Escritório' },
  { _id: '30', nome: 'Despesa com Multas e Impostos' },
  { _id: '31', nome: 'Despesa com Plano de Saúde' },
  { _id: '32', nome: 'Pró Labore' },
  { _id: '33', nome: 'Salários' },
  { _id: '34', nome: '13º Salário' },
  { _id: '35', nome: 'FGTS' },
  { _id: '36', nome: 'INSS' },
  { _id: '37', nome: 'Vale Transporte' },
  { _id: '38', nome: 'Despesa com Água e Esgoto' },
  { _id: '39', nome: 'Despesas Bancárias' },
  { _id: '41', nome: 'Outras Despesas Operacionais' },
  { _id: '42', nome: 'Investimentos em Imobilizado' },
  { _id: '43', nome: 'Participações no Resultado a Pagar' },
  { _id: '44', nome: 'Reembolso a Sócios' },
  { _id: '45', nome: 'Férias Funcionários' },
  { _id: '46', nome: 'Despesa com Marketing' },
  { _id: '47', nome: 'Despesa com Consultorias' },
  { _id: '49', nome: 'Despesa com Supermercado' },
  { _id: '50', nome: 'Despesa com Telefonia' },
  { _id: '52', nome: 'Despesas Comerciais' },
  { _id: '53', nome: 'Despesas Empréstimos Bancários' },
];

// Função para obter o nome da categoria com base no _id
export const getCategoriaNome = (categoriaId) => {
  // Procura na lista de receitas
  const categoriaReceita = categoriasReceitas.find((cat) => cat._id === categoriaId);
  if (categoriaReceita) return categoriaReceita.nome;

  // Procura na lista de despesas
  const categoriaDespesa = categoriasDespesas.find((cat) => cat._id === categoriaId);
  if (categoriaDespesa) return categoriaDespesa.nome;

  // Retorno padrão se não encontrado
  return 'Categoria Desconhecida';
};
