import { NextResponse } from 'next/server';

import { clienteExtratosStatus } from 'src/lib/mock-cliente-extratos';

export const runtime = 'nodejs';

// Função para gerar histórico mockado completo
function gerarHistoricoMockado(clienteId) {
  const hoje = new Date();
  const historico = [];
  
  // Gerar últimos 12 meses
  for (let i = 0; i < 12; i += 1) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mesAnoMock = data.toISOString().slice(0, 7);
    
    // Mock: últimos 4 meses (exceto o atual) como enviados para ter mais exemplos
    const mesesEnviados = i > 0 && i <= 4;
    
    // Variar os tipos de arquivos enviados
    let arquivos = [];
    if (mesesEnviados) {
      if (i === 1) {
        arquivos = [`extrato-${mesAnoMock}.ofx`, `extrato-${mesAnoMock}.pdf`];
      } else if (i === 2) {
        arquivos = [`extrato-${mesAnoMock}.ofx`];
      } else if (i === 3) {
        arquivos = [`extrato-${mesAnoMock}.ofx`, `extrato-${mesAnoMock}.csv`, `extrato-${mesAnoMock}.pdf`];
      } else if (i === 4) {
        arquivos = [`extrato-${mesAnoMock}.ofx`, `extrato-${mesAnoMock}.pdf`];
      }
    }
    
    historico.push({
      mesAno: mesAnoMock,
      enviado: mesesEnviados,
      enviadoEm: mesesEnviados 
        ? new Date(data.getFullYear(), data.getMonth(), 15).toISOString()
        : null,
      batchId: mesesEnviados ? `batch-${clienteId}-${mesAnoMock}` : null,
      arquivos,
      quantidadeArquivos: arquivos.length,
    });
  }
  
  // Ordenar por mês (mais recente primeiro)
  historico.sort((a, b) => b.mesAno.localeCompare(a.mesAno));
  
  return historico;
}

export async function GET(request, { params }) {
  try {
    const { clienteId } = params || {};
    const hoje = new Date();
    const mesAno = hoje.toISOString().slice(0, 7);

    // Sempre retornar dados mockados (mesmo se clienteId não existir)
    const historico = gerarHistoricoMockado(clienteId || 'mock-cliente');
    
    // Buscar status real do cliente (se existir)
    const status = clienteId ? clienteExtratosStatus.get(clienteId) || {} : {};
    const statusMesAtual = status[mesAno] || { enviado: false };

    // Atualizar histórico com dados reais se existirem
    const historicoCompleto = historico.map((mes) => {
      const statusReal = status[mes.mesAno];
      if (statusReal) {
        return {
          ...mes,
          ...statusReal,
        };
      }
      return mes;
    });

    return NextResponse.json(
      {
        clienteId: clienteId || null,
        mesAno,
        enviado: statusMesAtual.enviado,
        enviadoEm: statusMesAtual.enviadoEm,
        batchId: statusMesAtual.batchId,
        arquivos: statusMesAtual.arquivos || [],
        quantidadeArquivos: statusMesAtual.quantidadeArquivos || 0,
        historico: historicoCompleto,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar status de extratos:', error);
    
    // Em caso de erro, sempre retornar dados mockados
    const clienteId = params?.clienteId || null;
    const hoje = new Date();
    const mesAno = hoje.toISOString().slice(0, 7);
    const historico = gerarHistoricoMockado(clienteId || 'mock-cliente');

    return NextResponse.json(
      {
        clienteId,
        mesAno,
        enviado: false,
        enviadoEm: null,
        batchId: null,
        arquivos: [],
        quantidadeArquivos: 0,
        historico,
      },
      { status: 200 }
    );
  }
}

