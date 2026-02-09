import dayjs from 'dayjs';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  List,
  Stack,
  Drawer,
  Divider,
  Tooltip,
  ListItem,
  IconButton,
  Typography,
  ListItemText,
  ListItemIcon, 
} from '@mui/material';

import { toTitleCase } from 'src/utils/helper';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';


function InfoItem({ icon, label, value, isCopyable = false, isCurrency = false }) {
  const theme = useTheme();

  if (!value) return null;

  const formattedValue = isCurrency ? formatToCurrency(value) : value;

  return (
    <ListItem
      disableGutters
      sx={{
        py: 1,
        px: 2,
        borderRadius: 1,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
        <Iconify icon={icon} width={20} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="caption" color="text.secondary" fontWeight="medium">
            {label}
          </Typography>
        }
        secondary={
          <Typography variant="body2" color="text.primary" fontWeight="medium" sx={{ wordBreak: 'break-all' }}>
            {formattedValue}
          </Typography>
        }
        sx={{ m: 0 }}
      />
      {isCopyable && (
        <Tooltip title="Copiar">
          <IconButton
            onClick={() => navigator.clipboard.writeText(value)}
            size="small"
            sx={{
              color: 'primary.light',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            <Iconify icon="solar:copy-bold" width={16} />
          </IconButton>
        </Tooltip>
      )}
    </ListItem>
  );
}

function SectionHeader({ title, icon }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, mt: 3 }}>
      <Iconify icon={icon} width={20} color="primary.main" />
      <Typography variant="h6" color="text.primary" fontWeight="bold">
        {title}
      </Typography>
    </Stack>
  );
}

function DetalheVenda({ item }) {
  return (
    <>
      <SectionHeader title="Informações da Venda" icon="solar:cart-bold" />
      <InfoItem icon="solar:user-bold" label="Cliente" value={item.cliente?.nome || 'Não informado'} />
      <InfoItem icon="solar:user-circle-bold" label="Vendido por" value={item.proprietarioVenda} />
      <InfoItem
        icon="solar:calendar-date-bold"
        label="Data de Aprovação"
        value={item.approvalDate ? dayjs(item.approvalDate).format('DD/MM/YYYY') : 'N/A'}
      />

      {item.status === 'perdida' && (
        <InfoItem
          icon="solar:danger-triangle-bold"
          label="Motivo da Perda"
          value={item.motivoPerda}
        />
      )}

      <SectionHeader title="Itens da Venda" icon="solar:box-bold" />
      {item.items?.map(produto => (
        <Stack
          key={produto._id}
          direction="row"
          justifyContent="space-between"
          sx={{
            p: 2,
            mb: 1,
            borderRadius: 1,
            backgroundColor: 'grey.50'
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {produto.quantidade}x {produto.titulo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatToCurrency(produto.preco)} cada
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {formatToCurrency(produto.preco * produto.quantidade)}
          </Typography>
        </Stack>
      ))}
    </>
  );
}

const parseBoletoSeguro = (boletoString) => {
  if (!boletoString || typeof boletoString !== 'string') {
    return null;
  }
  try {
    return JSON.parse(boletoString);
  } catch (error) {
    console.error("Erro ao tentar parsear o JSON do boleto:", error);
    return null;
  }
};

function DetalheCobranca({ item }) {
  const boletoInfo = parseBoletoSeguro(item?.boleto);

  return (
    <>
      <SectionHeader title="Informações da Cobrança" icon="solar:card-bold" />
      <InfoItem icon="solar:document-text-bold" label="Contrato" value={item?.contrato?.titulo} />
      <InfoItem icon="solar:chat-round-line-bold" label="Observações" value={item?.observacoes} />

      <SectionHeader title="Dados de Pagamento" icon="solar:wallet-bold" />
      <InfoItem icon="solar:barcode-bold" label="Linha Digitável" value={boletoInfo?.linhaDigitavel} isCopyable />
      <InfoItem icon="mdi:pix" label="Pix Copia e Cola" value={boletoInfo?.pixCopiaECola} isCopyable />
    </>
  );
}

function DetalheDespesa({ item }) {
  return (
    <>
      <SectionHeader title="Informações da Despesa" icon="solar:bill-list-bold" />
      <InfoItem icon="solar:banknote-bold" label="Banco" value={item?.banco?.nome || 'Não informado'} />
      <InfoItem
        icon="solar:calendar-check-bold"
        label="Data do Pagamento"
        value={item?.dataPagamento ? dayjs(item?.dataPagamento).format('DD/MM/YYYY') : 'N/A'}
      />
      <InfoItem icon="solar:barcode-bold" label="Código de Barras" value={item?.codigoBarras} isCopyable />
    </>
  );
}

export default function DetalheLancamentoDrawer({ item, onClose, statusConfigs }) {
  const theme = useTheme();
  const { getReceitaStatusStyle, getDespesaStatusStyle } = statusConfigs;

  const isOpen = !!item;
  if (!isOpen) return null;

  const isReceita = item.tipoLancamento === 'invoice' || item.tipoLancamento === 'cobranca';
  const statusStyle = isReceita ? getReceitaStatusStyle(item.status) : getDespesaStatusStyle(item.status);

  const titulo = item.descricao || item.contrato?.titulo || `Venda #${item.invoiceNumber}` || 'Lançamento';
  const valor = item.valor || item.total;
  const corValor = isReceita ? statusStyle.color : (item.status === 'CANCELADO' ? 'success.main' : 'error.main');
  const sinal = isReceita ? '+' : '-';

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          background: theme.palette.background.default,
        },
      }}
      sx={{zIndex: theme.zIndex.modal + 1}}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Detalhes do Lançamento
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            <Iconify icon="solar:close-circle-bold" width={24} />
          </IconButton>
        </Stack>

        <Box sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: corValor, mb: 1 }}>
            {sinal} {formatToCurrency(valor)}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip
              label={toTitleCase(item.status)}
              color={statusStyle.chipColor}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="body2" color="text.secondary">
              Vencimento: {dayjs(item.dataVencimento).format('DD/MM/YYYY')}
            </Typography>
          </Stack>

          <Typography variant="subtitle1" fontWeight="medium">
            {titulo}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List sx={{ py: 0 }}>
          { item.tipoLancamento === 'invoice' && <DetalheVenda item={item} /> }
          { item.tipoLancamento === 'cobranca' && <DetalheCobranca item={item} /> }
          { item.tipoLancamento === 'conta_a_pagar' && <DetalheDespesa item={item} /> }
        </List>
      </Box>
    </Drawer>
  );
}
