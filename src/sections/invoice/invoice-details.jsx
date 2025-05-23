import { toast } from 'sonner';
import { useState, useCallback } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import { TextField, CardContent } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { updateInvoice } from 'src/actions/invoices';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { InvoiceToolbar } from './invoice-toolbar';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  [`& .${tableCellClasses.root}`]: {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

export const INVOICE_STATUS_OPTIONS = [
  { value: 'pago', label: 'Pago' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'perdida', label: 'Perdida' },
  { value: 'orcamento', label: 'Orçamento' },
];

const cobrancaStatusColors = {
  EMABERTO: 'warning',
  VENCIDO: 'error',
  CANCELADO: 'info',
  RECEBIDO: 'success',
};

const cobrancaStatusTexts = {
  EMABERTO: 'Aguardando pagamento',
  VENCIDO: 'Vencida',
  CANCELADO: 'Cancelado',
  RECEBIDO: 'Pago',
};

export function InvoiceDetails({ invoice }) {
  const [currentStatus, setCurrentStatus] = useState(invoice?.status);
  const [motivoPerda, setMotivoPerda] = useState(invoice?.motivoPerda || ''); // Estado para o motivo da perda
  const [isEditingMotivo, setIsEditingMotivo] = useState(false); // Controle para exibir o input de edição

  // Função para alterar o status da fatura
  const handleChangeStatus = useCallback(
    async (event) => {
      const dataUpdate = {
        status: event.target.value,
        motivoPerda, // Enviar o motivo da perda se o status for 'perdida'
      };

      const res = await updateInvoice(invoice._id, dataUpdate);
      toast.success('Venda atualizada');
      setCurrentStatus(res.status);

      if (res.status === 'perdida') {
        setMotivoPerda(res.motivoPerda || ''); // Atualizar o motivo da perda se o status for 'perdida'
      }
    },
    [invoice._id, motivoPerda]
  );

  // Função para salvar o motivo da perda
  const handleSaveMotivo = async () => {
    try {
      const dataUpdate = {
        status: 'perdida',
        motivoPerda,
      };

      await updateInvoice(invoice._id, dataUpdate);
      toast.success('Motivo da perda atualizado');
      setIsEditingMotivo(false); // Fechar o campo de edição após salvar
    } catch (error) {
      toast.error('Erro ao atualizar o motivo da perda');
    }
  };

  const renderTotal = (
    <>
      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>
          <Box sx={{ mt: 2 }} />
          Subtotal
        </TableCell>
        <TableCell width={120} sx={{ typography: 'subtitle2' }}>
          <Box sx={{ mt: 2 }} />
          {fCurrency(invoice?.subTotal)}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Desconto</TableCell>
        <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
          - {fCurrency(invoice?.desconto)}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1' }}>
          {fCurrency(invoice?.total)}
        </TableCell>
      </StyledTableRow>
    </>
  );

  const renderFooter = (
    <Box gap={2} display="flex" alignItems="center" flexWrap="wrap" sx={{ py: 3 }}>
      <div>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Informações
        </Typography>
        <Typography variant="body2">Forma de pagamento: Boleto ou PIX</Typography>
        {invoice.cobrancas && invoice.cobrancas.length > 0 && invoice.cobrancas[0].boleto && (
          <Box sx={{ mt: 2 }}>
            {(() => {
              const boleto = JSON.parse(invoice.cobrancas[0].boleto);
              return (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Label
                      variant="soft"
                      color={cobrancaStatusColors[invoice.cobrancas[0].status] || 'default'}
                      sx={{ mb: 3 }}
                    >
                      {cobrancaStatusTexts[invoice.cobrancas[0].status] ||
                        invoice.cobrancas[0].status}
                    </Label>
                    <Stack spacing={2.5} sx={{ mb: 3 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Valor
                        </Typography>
                        <Typography variant="h4" color="warning">
                          {fCurrency(invoice?.total)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Vencimento
                        </Typography>
                        <Typography variant="subtitle1">
                          {fDate(invoice?.dataVencimento)}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      <CopyToClipboard text={boleto.linhaDigitavel}>
                        <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                          Copiar Linha Digitável
                        </Button>
                      </CopyToClipboard>
                      <CopyToClipboard text={boleto.pixCopiaECola}>
                        <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                          Copiar PIX Copia e Cola
                        </Button>
                      </CopyToClipboard>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })()}
          </Box>
        )}
        {invoice.urlPagamento && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Link de Pagamento:
            </Typography>
            <Typography variant="body2">
              <a href={invoice.urlPagamento} target="_blank" rel="noopener noreferrer">
                {invoice.urlPagamento}
              </a>
            </Typography>
          </Box>
        )}
      </div>
    </Box>
  );

  const renderList = (
    <Scrollbar sx={{ mt: 5 }}>
      <Table sx={{ minWidth: 960 }}>
        <TableHead>
          <TableRow>
            <TableCell width={40}>#</TableCell>
            <TableCell sx={{ typography: 'subtitle2' }}>Titulo</TableCell>
            <TableCell sx={{ typography: 'subtitle2' }}>Descrição</TableCell>
            <TableCell>Qtd</TableCell>
            <TableCell align="right">Preço Unitário</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoice?.items.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Box sx={{ maxWidth: 560 }}>
                  <Typography variant="body" sx={{ color: 'text.primary' }} noWrap>
                    {row.titulo}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ maxWidth: 560 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    {row.descricao}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{row.quantidade}</TableCell>
              <TableCell align="right">{fCurrency(row.preco)}</TableCell>
              <TableCell align="right">{fCurrency(row.preco * row.quantidade)}</TableCell>
            </TableRow>
          ))}
          {renderTotal}
        </TableBody>
      </Table>
    </Scrollbar>
  );

  return (
    <>
      <InvoiceToolbar
        invoice={invoice}
        currentStatus={currentStatus || ''}
        onChangeStatus={handleChangeStatus}
        statusOptions={INVOICE_STATUS_OPTIONS}
      />

      <Card sx={{ pt: 5, px: 5 }}>
        <Box
          rowGap={5}
          display="grid"
          alignItems="center"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
        >
          <Box component="img" alt="logo" src="/logo/hub-tt.png" sx={{ width: 48, height: 48 }} />
          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Label
              variant="soft"
              color={
                (currentStatus === 'pago' && 'success') ||
                (currentStatus === 'pendente' && 'warning') ||
                (currentStatus === 'atrasado' && 'error') ||
                'default'
              }
            >
              {currentStatus}
            </Label>
            <Typography variant="h6">{invoice?.invoiceNumber}</Typography>
          </Stack>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contratada:
            </Typography>
            Attualize Contabil LTDA
            <br />
            Avenida Senador Salgado Filho 1847 - Guabirotuba
            <br />
            Curitiba - PR
            <br />
            Telefone: (41) 9 9698-2267
            <br />
            Vendedor: {invoice?.proprietarioVenda}
          </Stack>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contratante
            </Typography>
            {invoice?.cliente.nome}
            <br />
            {invoice?.cliente.email}
            <br />
            Telefone: {invoice?.cliente.whatsapp}
          </Stack>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Data Criação
            </Typography>
            {fDate(invoice?.createdAt)}
          </Stack>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Vencimento
            </Typography>
            {fDate(invoice?.dataVencimento)}
          </Stack>
          {invoice?.approvalDate && ( // Apenas exibir se approvalDate existir
            <Stack sx={{ typography: 'body2' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Data de Aprovação
              </Typography>
              {fDate(invoice?.approvalDate)}
            </Stack>
          )}
        </Box>
        {renderList}
        <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />
        {renderFooter}

        {/* Mostrar o campo de edição do motivo se o status for 'perdida' */}
        {currentStatus === 'perdida' && (
          <Box sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Motivo da perda
            </Typography>
            {isEditingMotivo ? (
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Motivo da perda"
                  variant="outlined"
                  fullWidth
                  value={motivoPerda}
                  onChange={(e) => setMotivoPerda(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveMotivo}
                  disabled={!motivoPerda}
                >
                  Salvar
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2">{motivoPerda || 'Sem motivo fornecido'}</Typography>
                <Button variant="outlined" onClick={() => setIsEditingMotivo(true)}>
                  Editar
                </Button>
              </Stack>
            )}
          </Box>
        )}
      </Card>
    </>
  );
}
