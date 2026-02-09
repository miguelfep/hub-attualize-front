'use client';

import * as XLSX from 'xlsx'; // Import the XLSX library
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import { getInvoices } from 'src/actions/invoices';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ChartPie } from 'src/sections/_examples/extra/chart-view/chart-pie';
import { EcommerceCurrentBalance } from 'src/sections/overview/e-commerce/ecommerce-current-balance';

const ReactApexChart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default || mod),
  {
    ssr: false,
  }
);

const columns = [
  { field: 'invoiceNumber', headerName: 'Venda', width: 100 },
  { field: 'cliente', headerName: 'Cliente', width: 200 },
  {
    field: 'total',
    headerName: 'Total (R$)',
    width: 150,
    valueGetter: (params) => {
      const total = params || 0;
      return fCurrency(total);
    },
  },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'proprietario', headerName: 'Vendedor', width: 150 },
  {
    field: 'formattedDate',
    headerName: 'Data',
    width: 200,
  },
  {
    field: 'details',
    headerName: 'Detalhes',
    width: 150,
    renderCell: (params) => (
      <Button
        variant="text"
        onClick={() => {
          window.location.href = `/dashboard/invoice/${params.row.id}`;
        }}
        startIcon={<Iconify icon="oi:eye" />}
      />
    ),
  },
];

export function RelatorioComercialView() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allSalesData, setAllSalesData] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [salesByDayData, setSalesByDayData] = useState([]);
  const [salesBySellerData, setSalesBySellerData] = useState({
    categories: [],
    series: [],
  });

  const totalFilteredSales = filteredSales
    .filter((sale) => ['pago', 'aprovada'].includes(sale.status.toLowerCase()))
    .reduce((sum, sale) => sum + sale.total, 0);

  useEffect(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(lastDayOfMonth.toISOString().split('T')[0]);
  }, []);

  const fetchAllSalesData = useCallback(async () => {
    try {
      const response = await getInvoices();
      const formattedData = response.map((invoice) => {
        const total = Number(invoice.total) || 0;
        const createdAt = new Date(invoice.createdAt);
        return {
          id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          cliente: invoice?.cliente?.nome || invoice?.lead?.nome || 'Não informado',
          total,
          status: invoice.status || 'Não informado',
          proprietario: formatProprietario(invoice.proprietarioVenda),
          data: createdAt.toISOString(),
          formattedDate: new Intl.DateTimeFormat('pt-BR').format(createdAt),
          rawDate: createdAt,
        };
      });
      setAllSalesData(formattedData);
      setFilteredSales(formattedData);
    } catch (error) {
      console.error('Erro ao buscar dados de vendas:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllSalesData();
  }, [fetchAllSalesData]);

  const filterSalesData = useCallback(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = allSalesData.filter((sale) => {
      const saleDate = sale.rawDate;
      const isInRange = saleDate >= start && saleDate <= end;
      const isApprovedOrPaid = ['pago', 'aprovada'].includes(sale.status.toLowerCase());
      return isInRange && isApprovedOrPaid;
    });

    setFilteredSales(filtered);
    updateSalesByDay(filtered);
    updateSalesBySeller(filtered);
  }, [startDate, endDate, allSalesData]);

  useEffect(() => {
    if (startDate && endDate) {
      filterSalesData();
    }
  }, [startDate, endDate, filterSalesData]);

  const clearFilters = () => {
    setFilteredSales(allSalesData);
    const now = new Date();
    setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
    setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
  };

  const updateSalesByDay = (data) => {
    const salesByDay = data.reduce((acc, sale) => {
      const day = sale.rawDate.toISOString().split('T')[0];
      acc[day] = acc[day] ? acc[day] + sale.total : sale.total;
      return acc;
    }, {});

    setSalesByDayData(Object.entries(salesByDay).map(([day, total]) => ({ x: day, y: total })));
  };

  const handleSellerClick = (seller) => {
    const filtered = filteredSales.filter((sale) => sale.proprietario === seller);
    setFilteredSales(filtered);
  };

  const updateSalesBySeller = (data) => {
    const salesBySeller = data.reduce((acc, sale) => {
      const seller = sale.proprietario;
      acc[seller] = acc[seller] ? acc[seller] + sale.total : sale.total;
      return acc;
    }, {});

    const totalSales = Object.values(salesBySeller).reduce((sum, value) => sum + value, 0);

    setSalesBySellerData({
      categories: Object.keys(salesBySeller),
      series: Object.values(salesBySeller).map((value) =>
        Number(((value / totalSales) * 100).toFixed(2))
      ),
    });
  };

  const exportToExcel = () => {
    const worksheetData = [
      ['Venda', 'Cliente', 'Total (R$)', 'Status', 'Vendedor', 'Data'], // Headers
      ...filteredSales.map((sale) => [
        sale.invoiceNumber,
        sale.cliente,
        sale.total,
        sale.status,
        sale.proprietario,
        sale.formattedDate,
      ]),
    ];

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let row = 1; row <= range.e.r; row += 1) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 2 }); // Coluna C (índice 2)
      const cell = worksheet[cellAddress];
      if (cell && typeof cell.v === 'number') {
        cell.z = '"R$"#,##0.00'; // Define o formato de moeda
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Vendas');

    // Write the workbook to a file and trigger a download
    XLSX.writeFile(workbook, 'relatorio_vendas.xlsx');
  };

  const formatProprietario = (proprietario) => {
    if (!proprietario) return 'Não informado';
    return proprietario
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  const salesByMonthChartConfig = {
    series: [
      {
        name: 'Total de Vendas',
        data: salesByDayData,
      },
    ],
    options: {
      chart: { type: 'bar', height: 350 },
      xaxis: {
        type: 'category',
        labels: {
          formatter: (value) => {
            const date = new Date(value);
            return new Intl.DateTimeFormat('pt-BR').format(date);
          },
        },
        title: { text: 'Data' },
      },
      yaxis: {
        labels: { formatter: (value) => fCurrency(value) },
        title: { text: 'Total (R$)' },
      },
      tooltip: {
        y: { formatter: (value) => fCurrency(value) },
      },
      title: { text: 'Vendas por Dia', align: 'left' },
    },
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Relatório Comercial"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Relatório Comercial' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          label="Data Inicial"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          label="Data Final"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button variant="outlined" onClick={clearFilters}>
          Limpar Filtros
        </Button>
        <Button variant="contained" onClick={exportToExcel}>
          Exportar
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardHeader title="Vendas por Dia" />
        <Box sx={{ px: 3, py: 2 }}>
          {salesByDayData.length > 0 ? (
            <ReactApexChart
              options={salesByMonthChartConfig.options}
              series={salesByMonthChartConfig.series}
              type="bar"
              height={350}
            />
          ) : (
            <p>Nenhum dado disponível.</p>
          )}
        </Box>
      </Card>
      {/* Valor Total das Vendas */}
      <Box sx={{ mb: 2 }}>
        <EcommerceCurrentBalance
          title="Valor total"
          currentBalance={totalFilteredSales}
          texto="Vendas no periodo"
        />
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardHeader title="Vendas por Vendedor" />
        <Box sx={{ px: 3, py: 2 }}>
          {salesBySellerData.categories.length > 0 ? (
            <ChartPie
              chart={{
                categories: salesBySellerData.categories,
                series: salesBySellerData.series,
                colors: ['#FF5733', '#33FF57', '#3357FF', '#F7FF33', '#FF33FF'],
              }}
              onClick={handleSellerClick}
            />
          ) : (
            <p>Nenhum dado disponível.</p>
          )}
        </Box>
      </Card>

      <Card>
        <CardHeader title="Detalhamento de Vendas" />
        <Box sx={{ flexGrow: 1, px: 3, py: 2, height: 'auto' }}>
          <DataGrid
            rows={filteredSales}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
            disableExtendRowFullWidth
          />
        </Box>
      </Card>
    </DashboardContent>
  );
}
