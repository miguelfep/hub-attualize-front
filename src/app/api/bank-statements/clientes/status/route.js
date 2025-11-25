import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Mock: Em produção viria do banco de dados
// Por enquanto retornamos dados mockados
// NOTA: Em produção, este endpoint deve buscar dados reais do banco de dados
export async function GET() {
  try {
    // Mock: Lista de clientes com status de envio
    // Em produção, isso viria de uma consulta ao banco de dados
    const hoje = new Date();
    const mesAno = hoje.toISOString().slice(0, 7);
    
    const clientesStatus = [
      {
        clienteId: 'cliente-1',
        nomeCliente: 'Empresa ABC Ltda',
        mesAno,
        enviado: true,
        enviadoEm: new Date(hoje.getFullYear(), hoje.getMonth(), 15).toISOString(),
        quantidadeArquivos: 2,
        arquivos: ['extrato-bb.ofx', 'extrato-itau.pdf'],
      },
      {
        clienteId: 'cliente-2',
        nomeCliente: 'Empresa XYZ EIRELI',
        mesAno,
        enviado: false,
        enviadoEm: null,
        quantidadeArquivos: 0,
        arquivos: [],
      },
      {
        clienteId: 'cliente-3',
        nomeCliente: 'Comércio Silva ME',
        mesAno,
        enviado: true,
        enviadoEm: new Date(hoje.getFullYear(), hoje.getMonth(), 10).toISOString(),
        quantidadeArquivos: 3,
        arquivos: ['extrato-bb.ofx', 'extrato-itau.csv', 'extrato-bradesco.pdf'],
      },
      {
        clienteId: 'cliente-4',
        nomeCliente: 'Serviços Tech LTDA',
        mesAno,
        enviado: true,
        enviadoEm: new Date(hoje.getFullYear(), hoje.getMonth(), 5).toISOString(),
        quantidadeArquivos: 1,
        arquivos: ['extrato-itau.ofx'],
      },
    ];

    return NextResponse.json(
      {
        mesAno,
        totalClientes: clientesStatus.length,
        clientesEnviaram: clientesStatus.filter((c) => c.enviado).length,
        clientesPendentes: clientesStatus.filter((c) => !c.enviado).length,
        clientes: clientesStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar status de extratos dos clientes:', error);
    return NextResponse.json(
      {
        message: 'Não foi possível buscar o status dos extratos.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

