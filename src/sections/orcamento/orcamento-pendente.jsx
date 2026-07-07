import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const itensDoOrcamento = (invoice) =>
  Array.isArray(invoice?.items) ? invoice.items : Array.isArray(invoice?.itens) ? invoice.itens : [];

const primeiroNome = (nomeCompleto) => (nomeCompleto || '').trim().split(/\s+/)[0] || '';

export function OrcamentoPendente({ invoice }) {
  const itens = itensDoOrcamento(invoice);
  const nomeCliente = invoice?.cliente?.nome || invoice?.lead?.nome || '';
  const temDesconto = Number(invoice?.desconto) > 0;

  return (
    <Stack spacing={3}>
      {/* Saudação + total em destaque */}
      <Paper
        variant="outlined"
        sx={(theme) => ({
          p: { xs: 2.5, sm: 4 },
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)}, transparent 60%)`,
        })}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              {nomeCliente ? `Olá, ${primeiroNome(nomeCliente)}!` : 'Olá!'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Preparamos esta proposta especialmente para você. Revise os detalhes abaixo e aprove quando
              estiver tudo certo.
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: { xs: 'left', sm: 'right' },
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Valor total
            </Typography>
            <Typography variant="h3" sx={{ color: 'primary.main', lineHeight: 1.1 }}>
              {fCurrency(invoice?.total)}
            </Typography>
            {invoice?.dataVencimento && (
              <Chip
                size="small"
                variant="soft"
                color="default"
                icon={<Iconify width={14} icon="solar:calendar-bold" />}
                label={`Válida até ${fDate(invoice.dataVencimento)}`}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Itens da proposta */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 2, bgcolor: 'background.neutral' }}>
          <Typography variant="subtitle1">O que está incluído</Typography>
        </Box>

        <Stack divider={<Divider />}>
          {itens.map((row, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={2}
              alignItems="flex-start"
              sx={{ px: { xs: 2.5, sm: 3 }, py: 2 }}
            >
              <Iconify
                icon="solar:check-circle-bold"
                width={22}
                sx={{ color: 'success.main', mt: 0.25, flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2">{row.titulo}</Typography>
                {row.descricao && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                    {row.descricao}
                  </Typography>
                )}
                {Number(row.quantidade) > 1 && (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {row.quantidade}x {fCurrency(row.preco)}
                  </Typography>
                )}
              </Box>
              <Typography variant="subtitle2" sx={{ flexShrink: 0 }}>
                {fCurrency((row.preco || 0) * (row.quantidade || 0))}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider />

        {/* Totais */}
        <Stack spacing={1} sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5, bgcolor: 'background.neutral' }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Subtotal
            </Typography>
            <Typography variant="body2">{fCurrency(invoice?.subTotal)}</Typography>
          </Stack>
          {temDesconto && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Desconto
              </Typography>
              <Typography variant="body2" sx={{ color: 'error.main' }}>
                - {fCurrency(invoice?.desconto)}
              </Typography>
            </Stack>
          )}
          <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Total</Typography>
            <Typography variant="h5" sx={{ color: 'primary.main' }}>
              {fCurrency(invoice?.total)}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Contratada / Contratante */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        }}
      >
        <PartyCard
          titulo="Contratada"
          icone="solar:buildings-2-bold-duotone"
          linhas={[
            { texto: 'Attualize Contábil LTDA', destaque: true },
            { texto: 'Av. Senador Salgado Filho, 1847 · Guabirotuba' },
            { texto: 'Curitiba - PR' },
            { texto: '(41) 9 9698-2267' },
          ]}
        />
        <PartyCard
          titulo="Contratante"
          icone="solar:user-rounded-bold-duotone"
          linhas={[
            { texto: nomeCliente || '—', destaque: true },
            { texto: invoice?.cliente?.email || invoice?.lead?.email || '—' },
            { texto: invoice?.cliente?.whatsapp || invoice?.lead?.telefone || '—' },
          ]}
        />
      </Box>

      {/* Confiança */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, sm: 3 }}
        justifyContent="center"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ px: 1 }}
      >
        <TrustItem icon="solar:shield-check-bold" texto="Pagamento 100% seguro" />
        <TrustItem icon="solar:qr-code-bold" texto="PIX, boleto ou cartão em até 4x" />
        <TrustItem icon="mdi:whatsapp" texto="Suporte via WhatsApp" />
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function PartyCard({ titulo, icone, linhas }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Iconify icon={icone} width={22} sx={{ color: 'primary.main' }} />
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          {titulo}
        </Typography>
      </Stack>
      <Stack spacing={0.5}>
        {linhas.map((linha, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{ color: linha.destaque ? 'text.primary' : 'text.secondary', fontWeight: linha.destaque ? 600 : 400 }}
          >
            {linha.texto}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}

function TrustItem({ icon, texto }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon={icon} width={18} sx={{ color: 'success.main' }} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {texto}
      </Typography>
    </Stack>
  );
}
