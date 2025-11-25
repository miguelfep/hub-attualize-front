import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Mock: Em produção viria do banco de dados
// Retorna lançamentos agrupados por banco
export async function GET(request, { params }) {
  try {
    const { clienteId, mesAno } = params;

    if (!clienteId || !mesAno) {
      return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    // Mock: Gerar lançamentos agrupados por banco
    const bancos = [
      {
        bancoId: 'banco-1',
        nomeBanco: 'Banco do Brasil',
        codigoBanco: '001',
        lancamentos: [
          {
            id: '1',
            date: `${mesAno}-01`,
            description: 'Transferência recebida - Cliente ABC',
            amount: 5000.0,
            tipo: 'entrada',
            categoria: 'Receita recorrente',
            conciliado: true,
            sourceFile: { name: 'extrato-bb-janeiro.ofx' },
          },
          {
            id: '2',
            date: `${mesAno}-05`,
            description: 'Pagamento de fornecedor',
            amount: -1200.0,
            tipo: 'saida',
            categoria: 'Operacional',
            conciliado: true,
            sourceFile: { name: 'extrato-bb-janeiro.ofx' },
          },
          {
            id: '3',
            date: `${mesAno}-10`,
            description: 'Honorários recebidos',
            amount: 3000.0,
            tipo: 'entrada',
            categoria: 'Honorários',
            conciliado: false,
            sourceFile: { name: 'extrato-bb-janeiro.csv' },
          },
          {
            id: '4',
            date: `${mesAno}-15`,
            description: 'Impostos e taxas',
            amount: -450.0,
            tipo: 'saida',
            categoria: 'Impostos e taxas',
            conciliado: true,
            sourceFile: { name: 'extrato-bb-janeiro.pdf' },
          },
        ],
      },
      {
        bancoId: 'banco-2',
        nomeBanco: 'Itaú',
        codigoBanco: '341',
        lancamentos: [
          {
            id: '5',
            date: `${mesAno}-03`,
            description: 'Depósito em conta',
            amount: 2500.0,
            tipo: 'entrada',
            categoria: 'Receita recorrente',
            conciliado: true,
            sourceFile: { name: 'extrato-itau-janeiro.ofx' },
          },
          {
            id: '6',
            date: `${mesAno}-12`,
            description: 'Pagamento de salário',
            amount: -8000.0,
            tipo: 'saida',
            categoria: 'Operacional',
            conciliado: true,
            sourceFile: { name: 'extrato-itau-janeiro.ofx' },
          },
          {
            id: '7',
            date: `${mesAno}-20`,
            description: 'Transferência bancária',
            amount: -500.0,
            tipo: 'saida',
            categoria: 'Transferências',
            conciliado: false,
            sourceFile: { name: 'extrato-itau-janeiro.csv' },
          },
        ],
      },
      {
        bancoId: 'banco-3',
        nomeBanco: 'Bradesco',
        codigoBanco: '237',
        lancamentos: [
          {
            id: '8',
            date: `${mesAno}-08`,
            description: 'Recebimento de cliente',
            amount: 1500.0,
            tipo: 'entrada',
            categoria: 'Receita recorrente',
            conciliado: true,
            sourceFile: { name: 'extrato-bradesco-janeiro.pdf' },
          },
        ],
      },
    ];

    // Calcular resumo por banco
    const bancosComSummary = bancos.map((banco) => {
      const totalEntradas = banco.lancamentos
        .filter((l) => l.tipo === 'entrada')
        .reduce((sum, l) => sum + l.amount, 0);
      const totalSaidas = banco.lancamentos.filter((l) => l.tipo === 'saida').reduce((sum, l) => sum + l.amount, 0);
      const saldo = totalEntradas + totalSaidas;
      const conciliados = banco.lancamentos.filter((l) => l.conciliado).length;
      const pendentes = banco.lancamentos.filter((l) => !l.conciliado).length;

      return {
        ...banco,
        summary: {
          totalEntradas,
          totalSaidas,
          saldo,
          conciliados,
          pendentes,
          total: banco.lancamentos.length,
        },
      };
    });

    // Resumo geral
    const summaryGeral = bancosComSummary.reduce(
      (acc, banco) => ({
        totalEntradas: acc.totalEntradas + banco.summary.totalEntradas,
        totalSaidas: acc.totalSaidas + banco.summary.totalSaidas,
        saldo: acc.saldo + banco.summary.saldo,
        conciliados: acc.conciliados + banco.summary.conciliados,
        pendentes: acc.pendentes + banco.summary.pendentes,
        total: acc.total + banco.summary.total,
      }),
      { totalEntradas: 0, totalSaidas: 0, saldo: 0, conciliados: 0, pendentes: 0, total: 0 }
    );

    return NextResponse.json(
      {
        clienteId,
        mesAno,
        bancos: bancosComSummary,
        summaryGeral,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar lançamentos por banco:', error);
    return NextResponse.json(
      {
        message: 'Não foi possível buscar os lançamentos.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

