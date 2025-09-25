import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  List,
  Table,
  Paper,
  Stack,
  Divider,
  ListItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  ListItemIcon,
  ListItemText,
  TableContainer,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

const tableData = [
  {
    regime: 'Simples Nacional',
    calculo: 'Alíquota efetiva por Anexo III/V e RBT12; Fator R pode migrar do V → III',
    tributos: 'DAS unificado; referência prática: Anexo III ~6-19% e Anexo V ~13-30% (estimativo); ISS geralmente dentro do DAS',
    vantagens: ['Burocracia reduzida', 'Guia única'],
    desvantagens: ['Pode onerar em faixas altas', 'Atenção ao Fator R'],
    indicado: ['Clínicas pequenas/médias'],
  },
  {
    regime: 'Lucro Presumido',
    calculo: 'Base presumida (serviços: 32% da receita para IRPJ/CSLL); PIS/COFINS cumulativos; ISS sobre serviços',
    tributos: 'IRPJ 15% (+10% adicional > R$ 20 mil/mês) e CSLL 9% sobre a base presumida; PIS 0,65% + COFINS 3% sobre a receita; ISS ~2-5%',
    vantagens: ['Previsível', 'Bom com margens altas e folha enxuta'],
    desvantagens: ['Pode ser ruim se a margem real for baixa', 'Tributos separados'],
    indicado: ['Clínicas estruturadas', 'Lucro consistente'],
  },
  {
    regime: 'Lucro Real',
    calculo: 'Lucro contábil ajustado; PIS/COFINS não cumulativos; ISS sobre serviços',
    tributos: 'IRPJ 15% (+10% adicional), CSLL 9%; PIS 1,65% + COFINS 7,6%; ISS ~2-5%',
    vantagens: ['Melhor em margens baixas', 'Créditos de PIS/COFINS'],
    desvantagens: ['Maior complexidade e compliance'],
    indicado: ['Clínicas grandes/redes'],
  },
];

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  borderBottom: `2px solid ${theme.palette.divider}`,
}));

const RegimeTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  minWidth: 170,
}));


export function TabelaRegimesTributarios() {
  const theme = useTheme();

  return (
    <Box>
      <Divider sx={{ my: 4, borderStyle: 'dotted' }}>
        <Chip label="ANÁLISE COMPARATIVA" />
      </Divider>
      <Typography variant="h4" sx={{ color: 'text.primary', mb: 3, textAlign: 'center' }}>
        Tabela Comparativa de Regimes
      </Typography>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <Table sx={{ minWidth: 1200 }} aria-label="tabela comparativa de regimes tributários">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Regime</StyledTableHeadCell>
              <StyledTableHeadCell>Como Calcula</StyledTableHeadCell>
              <StyledTableHeadCell>Tributos e Alíquotas (geral)</StyledTableHeadCell>
              <StyledTableHeadCell>Vantagens</StyledTableHeadCell>
              <StyledTableHeadCell>Desvantagens</StyledTableHeadCell>
              <StyledTableHeadCell>Indicado para</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow
                key={row.regime}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: theme.palette.action.hover } }}
              >
                <RegimeTableCell component="th" scope="row">
                  {row.regime}
                </RegimeTableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{row.calculo}</TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{row.tributos}</TableCell>
                <TableCell sx={{ verticalAlign: 'top', minWidth: 220 }}>
                  <List dense disablePadding>
                    {row.vantagens.map((vantagem) => (
                      <ListItem key={vantagem} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Iconify icon="eva:checkmark-circle-2-fill" color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={vantagem} />
                      </ListItem>
                    ))}
                  </List>
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top', minWidth: 220 }}>
                  <List dense disablePadding>
                    {row.desvantagens.map((desvantagem) => (
                      <ListItem key={desvantagem} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Iconify icon="eva:close-circle-fill" color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={desvantagem} />
                      </ListItem>
                    ))}
                  </List>
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Stack direction="column" spacing={1}>
                    {row.indicado.map((indicacao) => (
                      <Chip key={indicacao} label={indicacao} variant="outlined" color="primary" size="small" />
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
