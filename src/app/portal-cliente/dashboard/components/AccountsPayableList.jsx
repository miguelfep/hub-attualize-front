'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';

import { formatToCurrency } from 'src/components/animate';

import { CARD, CARD_HEADER } from './dash-tokens';

const SCROLLBAR_SX = {
  '&::-webkit-scrollbar': { width: 6 },
  '&::-webkit-scrollbar-track': { bgcolor: 'grey.100', borderRadius: 3 },
  '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 3 },
  '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'grey.400' },
};

/**
 * Formata data para exibição
 */
function formatarData(dataString) {
  if (!dataString) return '';
  try {
    return dayjs(dataString).locale('pt-br').format('DD/MM/YYYY');
  } catch {
    return dataString;
  }
}

/**
 * Obtém inicial do banco para avatar
 */
function getInicialBanco(bancoNome) {
  if (!bancoNome) return '?';
  return bancoNome.charAt(0).toUpperCase();
}

export default function AccountsPayableList({
  filterCategory, // ID da conta contábil selecionada
  transacoes = [], // Array de transações da API
  loading = false,
  contaContabilNome = null, // Nome da conta contábil para exibição
}) {
  // 🎯 Se não há categoria selecionada, não mostrar nada ou mostrar mensagem
  if (!filterCategory) {
    return (
      <Card
        sx={{
          ...CARD,
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <CardHeader
          title="Transações em Detalhes"
          subheader="Selecione uma conta contábil para ver as transações"
          sx={{
            ...CARD_HEADER,
            py: 1.5,
            '& .MuiCardHeader-title': { ...CARD_HEADER.title, fontSize: '0.875rem' },
            '& .MuiCardHeader-subheader': CARD_HEADER.subheader,
          }}
        />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Selecione uma conta contábil no gráfico para visualizar as transações detalhadas
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        ...CARD,
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <CardHeader
        title="Transações em Detalhes"
        subheader={contaContabilNome ? `Filtrado: ${contaContabilNome}` : 'Transações da conta contábil'}
        sx={{
          ...CARD_HEADER,
          py: 1.5,
          '& .MuiCardHeader-title': { ...CARD_HEADER.title, fontSize: '0.875rem' },
          '& .MuiCardHeader-subheader': CARD_HEADER.subheader,
        }}
      />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 2,
          pb: 2,
          ...SCROLLBAR_SX,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : transacoes.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Nenhuma transação encontrada para esta conta contábil
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {transacoes.map((transacao, index) => {
              // 🎯 Valores da transação
              const valor = Math.abs(transacao.valor || transacao.total || 0);
              const isDebito = (transacao.tipo === 'DEBITO' || transacao.tipo === 'D' || valor < 0);

              // 🎯 Dados do banco
              const bancoNome = transacao.banco?.nome ||
                transacao.banco?.instituicaoBancaria?.nome ||
                transacao.instituicaoBancaria?.nome ||
                'Banco';

              // 🎯 Descrição da transação
              const descricao = transacao.descricao ||
                transacao.memo ||
                transacao.historico ||
                'Transação sem descrição';

              // 🎯 Data da transação
              const dataTransacao = transacao.dataTransacao ||
                transacao.data ||
                transacao.dataLancamento ||
                null;

              return (
                <Stack
                  key={transacao._id || transacao.id || index}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    transition: 'background-color 0.2s ease',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: 'grey.200',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {getInicialBanco(bancoNome)}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.8125rem', fontWeight: 700 }} noWrap>
                      {descricao}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }} noWrap>
                      {bancoNome} • {formatarData(dataTransacao)}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right', minWidth: 'fit-content' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: isDebito ? 'error.main' : 'success.main',
                        fontWeight: 700,
                        fontSize: '0.8125rem'
                      }}
                    >
                      {isDebito ? '-' : '+'}{formatToCurrency(valor)}
                    </Typography>
                    {contaContabilNome && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.disabled',
                          textTransform: 'uppercase',
                          fontSize: '0.65rem',
                          fontWeight: 600
                        }}
                      >
                        {contaContabilNome.length > 20
                          ? `${contaContabilNome.substring(0, 20)}...`
                          : contaContabilNome}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>
    </Card>
  );
}
