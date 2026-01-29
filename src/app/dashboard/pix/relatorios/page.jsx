'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { gerarRelatorioPixRecebidos } from 'src/actions/pix';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function PixRelatoriosPage() {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [agruparPor, setAgruparPor] = useState('dia');

  const gerarRelatorio = useCallback(async () => {
    if (!inicio || !fim) {
      toast.error('Por favor, selecione as datas inicial e final');
      return;
    }

    setLoading(true);
    try {
      const response = await gerarRelatorioPixRecebidos(inicio, fim, agruparPor);
      setRelatorio(response);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório PIX');
    } finally {
      setLoading(false);
    }
  }, [inicio, fim, agruparPor]);

  // Definir datas padrão (último mês)
  useEffect(() => {
    const hoje = new Date();
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    setFim(hoje.toISOString().split('T')[0]);
    setInicio(umMesAtras.toISOString().split('T')[0]);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Relatórios PIX"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'PIX', href: paths.dashboard.pix.root },
          { name: 'Relatórios' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Filtros */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Filtros do Relatório</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Data Inicial"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />

            <TextField
              label="Data Final"
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Agrupar Por</InputLabel>
              <Select value={agruparPor} onChange={(e) => setAgruparPor(e.target.value)} label="Agrupar Por">
                <MenuItem value="dia">Dia</MenuItem>
                <MenuItem value="mes">Mês</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={gerarRelatorio}
              disabled={loading || !inicio || !fim}
              startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="solar:chart-bold" />}
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Resumo */}
      {relatorio && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Resumo do Período
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Total de PIX Recebidos
              </Typography>
              <Typography variant="h4">{relatorio.resumo?.totalPixRecebidos || 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Total de Cobranças Pagas
              </Typography>
              <Typography variant="h4">{relatorio.resumo?.totalCobrancasPagas || 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Total Valor Recebido
              </Typography>
              <Typography variant="h4" color="success.main">
                {relatorio.resumo?.totalValorRecebido ? fCurrency(relatorio.resumo.totalValorRecebido) : 'R$ 0,00'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Valor Médio
              </Typography>
              <Typography variant="h4">
                {relatorio.resumo?.valorMedio ? fCurrency(relatorio.resumo.valorMedio) : 'R$ 0,00'}
              </Typography>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Agrupamento */}
      {relatorio && relatorio.agrupamento && relatorio.agrupamento.length > 0 && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Agrupamento por {agruparPor === 'dia' ? 'Dia' : 'Mês'}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Quantidade</TableCell>
                  <TableCell align="right">Valor Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatorio.agrupamento.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.data ? fDate(item.data, 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell align="right">{item.quantidade || 0}</TableCell>
                    <TableCell align="right">{item.valor ? fCurrency(item.valor) : 'R$ 0,00'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Detalhes */}
      {relatorio && relatorio.detalhes && relatorio.detalhes.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Detalhes dos PIX Recebidos
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data Recebimento</TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>PIX E2EID</TableCell>
                  <TableCell>PIX TXID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatorio.detalhes.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {item.dataRecebimento ? fDate(item.dataRecebimento, 'dd/MM/yyyy HH:mm:ss') : '-'}
                    </TableCell>
                    <TableCell>
                      {item.invoice?.invoiceNumber || '-'}
                    </TableCell>
                    <TableCell align="right">{item.valor ? fCurrency(item.valor) : 'R$ 0,00'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} noWrap>
                        {item.pixE2eid || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} noWrap>
                        {item.pixTxid || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {relatorio && (!relatorio.agrupamento || relatorio.agrupamento.length === 0) && (!relatorio.detalhes || relatorio.detalhes.length === 0) && (
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Nenhum dado encontrado para o período selecionado
          </Typography>
        </Card>
      )}
    </DashboardContent>
  );
}
