'use client';

import dayjs from 'dayjs';
import { parse } from 'ofx-parser';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  Select,
  MenuItem,
  Typography,
  CardContent,
} from '@mui/material';

import bancosConstantes from 'src/utils/constants/bancos';

import Loading from 'src/app/loading';
import { salvarExtrato, finalizarExtrato, obterPlanoContasPorCliente } from 'src/actions/contabil';

// Função para obter o nome do banco
const getBancoNome = (codigo) => {
  const banco = bancosConstantes.find((b) => b.codigo === codigo);
  return banco ? banco.nome : `Banco Desconhecido (${codigo})`;
};

// Obter o mês anterior
const getMesAnterior = () => {
  const hoje = dayjs();
  const mesAnterior = hoje.subtract(1, 'month');
  return mesAnterior.format('MMMM [de] YYYY');
};

// Função para formatar valores como moeda brasileira
const formatarValor = (valor) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);

const formatarData = (data) => {
  if (data instanceof Date) {
    // Caso a data já seja do tipo Date (por exemplo, vindo do banco)
    return dayjs(data).format('DD/MM/YYYY');
  }

  if (typeof data === 'string') {
    // Formato completo com fuso horário (exemplo: 20231220000000[-3:GMT])
    const regexCompleto = /^\d{8}\d{6}\[[-+]?\d{1,2}:GMT\]$/;
    if (regexCompleto.test(data)) {
      return dayjs(data.substring(0, 14), 'YYYYMMDDHHmmss').format('DD/MM/YYYY');
    }

    // Formato simplificado (exemplo: 20240701)
    const regexSimplificado = /^\d{8}$/;
    if (regexSimplificado.test(data)) {
      return dayjs(data, 'YYYYMMDD').format('DD/MM/YYYY');
    }
  }

  // Retornar um aviso caso o formato não seja esperado
  return 'Data Inválida';
};
export default function ConciliacaoPageView({ cliente, extratos, currentDate }) {
  const [planoContas, setPlanoContas] = useState(null);
  const [bancos, setBancos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlano = async () => {
      try {
        const plano = await obterPlanoContasPorCliente(cliente._id);
        setPlanoContas(plano.categorias || []);
      } catch (e) {
        console.error('Erro ao buscar plano de contas:', e);
        setPlanoContas(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlano();

    // Carrega os extratos recebidos inicialmente
    if (extratos.length > 0) {
      const bancosData = {};
      extratos.forEach((extrato) => {
        const bancoId = extrato.banco;
        bancosData[bancoId] = {
          lancamentos: extrato.lancamentos.map((lancamento, index) => ({
            id: `${bancoId}-${index + 1}`,
            banco: getBancoNome(bancoId),
            conta: extrato.conta,
            descricao: lancamento.descricao,
            data: formatarData(lancamento.data),
            valor: formatarValor(lancamento.valor),
            tipo: lancamento.tipo,
            conciliacao: lancamento.conciliacao || '',
          })),
          periodoInicio: extrato.periodoInicio,
          periodoFim: extrato.periodoFim,
          status: extrato.status,
        };
      });
      setBancos(bancosData);
    }
  }, [cliente, extratos]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/ofx': ['.ofx'] },
    onDrop: async (acceptedFiles) => {
      await processFiles(acceptedFiles);
    },
  });

  const processFiles = async (files) => {
    try {
      const bancosData = { ...bancos }; // Clone do estado atual dos bancos

      for (const file of files) {
        const content = await file.text();
        const parsedData = await parse(content);

        const bankId =
          parsedData.OFX.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKACCTFROM?.BANKID || 'Desconhecido';
        const accountId =
          parsedData.OFX.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKACCTFROM?.ACCTID ||
          'Conta Desconhecida';

        const bankTransList = parsedData.OFX.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST;

        // Obter os períodos do OFX
        const periodoInicio = bankTransList?.DTSTART
          ? dayjs(bankTransList.DTSTART, 'YYYYMMDDHHmmss[Z]').toDate()
          : dayjs().startOf('month').toDate();
        const periodoFim = bankTransList?.DTEND
          ? dayjs(bankTransList.DTEND, 'YYYYMMDDHHmmss[Z]').toDate()
          : dayjs().endOf('month').toDate();

        const transactions = bankTransList?.STMTTRN || [];

        // Inicializar o banco caso ainda não esteja registrado
        if (!bancosData[bankId]) {
          bancosData[bankId] = {
            lancamentos: [],
            periodoInicio,
            periodoFim,
          };
        } else {
          // Atualiza os períodos se necessário (ou mantém os existentes)
          bancosData[bankId].periodoInicio = periodoInicio;
          bancosData[bankId].periodoFim = periodoFim;
        }

        // Formatar transações e adicioná-las ao banco correspondente
        const formattedTransactions = transactions.map((transaction, index) => ({
          id: `${bankId}-${accountId}-${index + bancosData[bankId].lancamentos.length + 1}`,
          banco: getBancoNome(bankId),
          bancoId: bankId,
          conta: accountId,
          descricao: transaction.MEMO || 'Sem descrição',
          data: formatarData(transaction.DTPOSTED), // Formata a data
          valor: formatarValor(parseFloat(transaction.TRNAMT)), // Formata o valor
          tipo: parseFloat(transaction.TRNAMT) > 0 ? 'Crédito' : 'Débito',
          conciliacao: '',
        }));

        bancosData[bankId].lancamentos = [
          ...bancosData[bankId].lancamentos,
          ...formattedTransactions,
        ];
      }

      setBancos(bancosData); // Atualiza o estado com os novos lançamentos e períodos
    } catch (e) {
      console.error('Erro ao processar arquivos OFX:', e);
      setError('Erro ao processar os arquivos OFX.');
    }
  };
  const handleConciliacaoChange = (id, bancoId, novaConciliacao) => {
    setBancos((prevBancos) => {
      const bancoData = prevBancos[bancoId];
      if (!bancoData || !Array.isArray(bancoData.lancamentos)) {
        console.error(`Erro ao acessar os lançamentos do bancoId: ${bancoId}`);
        return prevBancos;
      }

      const lancamentosAtualizados = bancoData.lancamentos.map((transacao) =>
        transacao.id === id ? { ...transacao, conciliacao: novaConciliacao } : transacao
      );

      return {
        ...prevBancos,
        [bancoId]: {
          ...bancoData,
          lancamentos: lancamentosAtualizados,
        },
      };
    });
  };

  const salvarExtratoConciliado = async (bancoId) => {
    const { periodoInicio, periodoFim, lancamentos } = bancos[bancoId];

    const extrato = {
      clienteId: cliente._id,
      banco: bancoId,
      conta: lancamentos[0]?.conta || 'Conta desconhecida',
      periodoInicio,
      periodoFim,
      lancamentos,
    };

    try {
      await salvarExtrato(extrato);
      alert('Extrato salvo com sucesso!');
    } catch (e) {
      console.error('Erro ao salvar extrato:', e);
      console.log(e);

      alert('Erro ao salvar extrato.');
    }
  };

  const finalizarConciliacao = async (bancoId) => {
    try {
      await finalizarExtrato(bancoId);
      alert('Conciliação finalizada com sucesso!');
    } catch (e) {
      console.error('Erro ao finalizar conciliação:', e);
      alert('Erro ao finalizar conciliação.');
    }
  };

  const columns = [
    { field: 'banco', headerName: 'Banco', flex: 1 },
    { field: 'conta', headerName: 'Conta', flex: 0.5 },
    { field: 'descricao', headerName: 'Descrição', flex: 1 },
    { field: 'data', headerName: 'Data', flex: 0.5 },
    { field: 'valor', headerName: 'Valor', flex: 0.5, type: 'number' },
    { field: 'tipo', headerName: 'Tipo', flex: 0.5 },
    {
      field: 'conciliacao',
      headerName: 'Conciliação',
      flex: 1,
      renderCell: (params) => (
        <Select
          value={params.row.conciliacao}
          onChange={(e) =>
            handleConciliacaoChange(params.row.id, params.row.bancoId, e.target.value)
          }
          fullWidth
        >
          {planoContas.map((categoria) => (
            <MenuItem key={categoria._id} value={categoria.nome}>
              {categoria.nome}
            </MenuItem>
          ))}
        </Select>
      ),
    },
  ];

  const renderExtratos = () =>
    Object.entries(bancos).map(([bankId, { lancamentos, periodoInicio, periodoFim }]) => (
      <Card key={bankId} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Banco: {getBancoNome(bankId)}</Typography>
          <Typography variant="subtitle2">
            Período: {formatarData(dayjs(periodoInicio).format('YYYYMMDD'))} -{' '}
            {formatarData(dayjs(periodoFim).format('YYYYMMDD'))}
          </Typography>
          <Typography variant="subtitle2">Status: {status}</Typography>
          <DataGrid rows={lancamentos} columns={columns} autoHeight />
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => salvarExtratoConciliado(bankId)}
            >
              Salvar Extrato
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => finalizarConciliacao(bankId)}
            >
              Finalizar Conciliação
            </Button>
          </Stack>
        </CardContent>
      </Card>
    ));

  if (loading) {
    return <Loading />;
  }

  if (planoContas === null) {
    return (
      <Box sx={{ m: 3, p: 2, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 2 }} color="error">
          {cliente.razaoSocial}
        </Typography>
        <Typography variant="h6" color="error">
          Seu Plano de contas ainda não foi configurado. Solicite ao seu contador responsável.
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ m: 3, p: 2 }}>
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography>
            Você está conciliando o mês de <strong>{getMesAnterior()}</strong>.
          </Typography>
        </Alert>
        <Typography variant="h5">Conciliação Bancária</Typography>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Cliente: {cliente.razaoSocial}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Data da Conciliação: {dayjs(currentDate).format('DD/MM/YYYY')}
        </Typography>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            mb: 3,
          }}
        >
          <input {...getInputProps()} />
          <Typography>Arraste e solte arquivos OFX aqui</Typography>
          <Typography variant="body2">ou clique para selecionar</Typography>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        {renderExtratos()}
      </CardContent>
    </Card>
  );
}
