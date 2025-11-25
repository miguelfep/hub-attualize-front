import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Mock: Em produção viria do banco de dados
// Por enquanto retornamos dados mockados baseados no cliente e mês
export async function GET(request, { params }) {
  try {
    const { clienteId, mesAno } = params;

    if (!clienteId || !mesAno) {
      return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    // Mock: Gerar lançamentos de exemplo para o mês (com alguns já conciliados)
    const lancamentos = [
      {
        id: '1',
        date: `${mesAno}-01`,
        description: 'Transferência recebida',
        amount: 5000.0,
        tipo: 'entrada',
        categoria: 'Receita recorrente',
        conciliado: true,
        sourceFile: { name: 'extrato-janeiro.pdf', banco: 'Banco do Brasil' },
      },
      {
        id: '2',
        date: `${mesAno}-05`,
        description: 'Pagamento de fornecedor',
        amount: -1200.0,
        tipo: 'saida',
        categoria: 'Operacional',
        conciliado: true,
        sourceFile: { name: 'extrato-janeiro.csv', banco: 'Banco do Brasil' },
      },
      {
        id: '3',
        date: `${mesAno}-10`,
        description: 'Honorários recebidos',
        amount: 3000.0,
        tipo: 'entrada',
        categoria: 'Honorários',
        conciliado: true,
        sourceFile: { name: 'extrato-janeiro.pdf', banco: 'Itaú' },
      },
      {
        id: '4',
        date: `${mesAno}-15`,
        description: 'Impostos e taxas',
        amount: -450.0,
        tipo: 'saida',
        categoria: 'Impostos e taxas',
        conciliado: true,
        sourceFile: { name: 'extrato-janeiro.ofx', banco: 'Banco do Brasil' },
      },
      {
        id: '5',
        date: `${mesAno}-20`,
        description: 'Transferência bancária',
        amount: -800.0,
        tipo: 'saida',
        categoria: 'Transferências',
        conciliado: false,
        sourceFile: { name: 'extrato-janeiro.csv', banco: 'Itaú' },
      },
      {
        id: '6',
        date: `${mesAno}-25`,
        description: 'Depósito em conta',
        amount: 2500.0,
        tipo: 'entrada',
        categoria: 'Receita recorrente',
        conciliado: true,
        sourceFile: { name: 'extrato-janeiro.ofx', banco: 'Bradesco' },
      },
    ];

    // Calcular resumo
    const totalEntradas = lancamentos.filter((l) => l.tipo === 'entrada').reduce((sum, l) => sum + l.amount, 0);
    const totalSaidas = lancamentos.filter((l) => l.tipo === 'saida').reduce((sum, l) => sum + l.amount, 0);
    const saldo = totalEntradas + totalSaidas;

    return NextResponse.json(
      {
        clienteId,
        mesAno,
        lancamentos,
        summary: {
          totalEntradas,
          totalSaidas,
          saldo,
          total: lancamentos.length,
          conciliados: lancamentos.filter((l) => l.conciliado).length,
          pendentes: lancamentos.filter((l) => !l.conciliado).length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar lançamentos do cliente:', error);
    return NextResponse.json(
      {
        message: 'Não foi possível buscar os lançamentos.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

