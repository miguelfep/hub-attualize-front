'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import { getClientes } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard';
import { getLicencas, createLicenca, deleteLicenca } from 'src/actions/societario';
import {
  BookingIllustration,
  MotivationIllustration,
  ServerErrorIllustration,
} from 'src/assets/illustrations';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Iconify } from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { BookingWidgetSummary } from '../booking-widget-summary';
import LicenseModal from '../LicenseModal';

const licencasBrasil = [
  { id: 1, nome: 'Licença Ambiental' },
  { id: 2, nome: 'Licença Sanitária' },
  { id: 3, nome: 'Alvará de Funcionamento' },
  { id: 4, nome: 'Bombeiros' },
  { id: 5, nome: 'CLI' },
  { id: 6, nome: 'DEAM' },
  { id: 7, nome: 'DFRV' },
];

export function OverviewBookingView() {
  const [licencas, setLicencas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState(null);
  const [newLicense, setNewLicense] = useState({
    nome: '',
    clienteId: '',
    estado: '',
    cidade: '',
    dataInicio: '',
    dataVencimento: '',
    status: 'em_processo',
    urlDeAcesso: '',
    observacao: '',
  });
  const [errors, setErrors] = useState({});

  const fetchLicencas = async () => {
    try {
      const response = await getLicencas();
      setLicencas(response.data);
    } catch (error) {
      console.error('Erro ao buscar licenças:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await getClientes();
      setClientes(response || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  useEffect(() => {
    fetchLicencas();
  }, []);

  useEffect(() => {
    if (open) fetchClientes();
  }, [open]);

  const handleCreateLicense = async () => {
    const newErrors = {};
    if (!newLicense.nome) newErrors.nome = 'O tipo de licença é obrigatório.';
    if (!newLicense.clienteId) newErrors.clienteId = 'O cliente é obrigatório.';
    if (!newLicense.dataInicio) newErrors.dataInicio = 'A data de início é obrigatória.';
    if (!newLicense.dataVencimento)
      newErrors.dataVencimento = 'A data de vencimento é obrigatória.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createLicenca(newLicense);
      setOpen(false);
      fetchLicencas();
    } catch (error) {
      console.error('Erro ao criar licença:', error);
    }
  };

  const handleClientChange = (event, newValue) => {
    const estado = newValue?.endereco?.[0]?.estado || '';
    const cidade = newValue?.endereco?.[0]?.cidade || '';
    setNewLicense({
      ...newLicense,
      clienteId: newValue ? newValue._id : '',
      estado, // Preenche automaticamente se houver estado no endereço
      cidade, // Preenche automaticamente se houver cidade no endereço
    });
  };

  const filteredLicencas = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return licencas.filter((licenca) =>
      (licenca.cliente?.razaoSocial || '').toLowerCase().includes(q)
    );
  }, [licencas, searchQuery]);

  const groupedByCliente = useMemo(() => {
    const map = new Map();
    filteredLicencas.forEach((l) => {
      const key = l.cliente?._id || 'sem-cliente';
      if (!map.has(key)) map.set(key, { cliente: l.cliente, itens: [] });
      map.get(key).itens.push(l);
    });
    // ordena por razaoSocial
    return Array.from(map.values()).sort((a, b) =>
      (a.cliente?.razaoSocial || '').localeCompare(b.cliente?.razaoSocial || '')
    );
  }, [filteredLicencas]);

  const statusMap = {
    em_processo: { label: 'Em Processo', color: 'secondary' },
    valida: { label: 'Válida', color: 'success' },
    vencida: { label: 'Vencida', color: 'error' },
    dispensada: { label: 'Dispensada', color: 'info' },
    a_expirar: { label: 'A Expirar', color: 'warning' },
  };

  const handleOpenDeleteDialog = (row) => {
    const id = row._id || row.id;
    if (!id) return;
    setLicenseToDelete({ id, nome: row.nome });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!licenseToDelete?.id) return;
    try {
      await deleteLicenca(licenseToDelete.id);
      setDeleteDialogOpen(false);
      setLicenseToDelete(null);
      await fetchLicencas();
      toast.success('Licença deletada');
    } catch (error) {
      toast.error('Erro ao deletar licença');
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3} disableEqualOverflow>
        {/* Resumo das Licenças */}
        <Grid xs={12} md={4}>
          <BookingWidgetSummary
            title="Total Licenças"
            percent={2.6}
            total={licencas.length}
            icon={<BookingIllustration />}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <BookingWidgetSummary
            title="Válidas"
            percent={0.2}
            total={licencas.filter((licenca) => licenca.status === 'valida').length}
            icon={<MotivationIllustration />}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <BookingWidgetSummary
            title="A vencer"
            percent={-0.1}
            total={licencas.filter((licenca) => licenca.status === 'a_vencer').length}
            icon={<ServerErrorIllustration />}
          />
        </Grid>

        <Grid xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Lista de Licenças</Typography>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
              Criar Licença
            </Button>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nome do cliente ou tipo de licença..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ my: 2 }}
          />

          {groupedByCliente.map(({ cliente, itens }) => (
            <Accordion key={cliente?._id} defaultExpanded sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-outline" />}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="subtitle1">{cliente?.razaoSocial}</Typography>
                  <Typography variant="body2" color="text.secondary">{itens.length} licença(s)</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {itens.map((row) => (
                  <Box key={row.id} sx={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr 0.9fr auto', gap: 2, py: 1, borderBottom: '1px dashed', borderColor: 'divider', alignItems: 'center' }}>
                    <Typography>{row.nome}</Typography>
                    <Typography>{fDate(row.dataInicio)}</Typography>
                    <Typography>{fDate(row.dataVencimento)}</Typography>
                    <Label variant="soft" color={statusMap[row.status]?.color || 'default'}>
                      {statusMap[row.status]?.label || 'Desconhecido'}
                    </Label>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifySelf: 'end' }}>
                      <Button size="small" variant="outlined" onClick={() => setSelectedLicense(row)}>Ver</Button>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Deletar licença"
                        onClick={() => handleOpenDeleteDialog(row)}
                      >
                        <Iconify icon="solar:trash-bin-2-bold" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
      </Grid>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          p={3}
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            overflowY: 'auto',
            maxHeight: '90vh',
            width: 800,
          }}
        >
          <Typography variant="h6" mb={2}>
            Criar Nova Licença
          </Typography>

          <Autocomplete
            options={licencasBrasil}
            getOptionLabel={(option) => option.nome}
            onChange={(event, newValue) =>
              setNewLicense({ ...newLicense, nome: newValue ? newValue.nome : '' })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tipo de Licença"
                fullWidth
                margin="normal"
                required
                error={!!errors.nome}
                helperText={errors.nome}
              />
            )}
          />

          <Autocomplete
            options={clientes}
            getOptionLabel={(option) => option.razaoSocial || ''}
            onChange={handleClientChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                fullWidth
                margin="normal"
                required
                error={!!errors.clienteId}
                helperText={errors.clienteId}
              />
            )}
          />

          <TextField
            label="Estado do Cliente"
            fullWidth
            margin="normal"
            value={newLicense.estado}
            onChange={(e) => setNewLicense({ ...newLicense, estado: e.target.value })}
            InputProps={{ readOnly: !newLicense.estado && newLicense.clienteId }} // Permite edição apenas se não houver um estado já preenchido
          />

          <TextField
            label="Cidade"
            fullWidth
            margin="normal"
            value={newLicense.cidade}
            onChange={(e) => setNewLicense({ ...newLicense, cidade: e.target.value })}
            InputProps={{ readOnly: !newLicense.cidade && newLicense.clienteId }} // Permite edição apenas se não houver uma cidade já preenchida
          />

          <TextField
            label="URL de Acesso"
            fullWidth
            margin="normal"
            value={newLicense.urlDeAcesso}
            onChange={(e) => setNewLicense({ ...newLicense, urlDeAcesso: e.target.value })}
          />

          <TextField
            label="Observação"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={newLicense.observacao}
            onChange={(e) => setNewLicense({ ...newLicense, observacao: e.target.value })}
          />

          <TextField
            label="Data de Início"
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newLicense.dataInicio}
            onChange={(e) => setNewLicense({ ...newLicense, dataInicio: e.target.value })}
            required
            error={!!errors.dataInicio}
            helperText={errors.dataInicio}
          />

          <TextField
            label="Data de Vencimento"
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newLicense.dataVencimento}
            onChange={(e) => setNewLicense({ ...newLicense, dataVencimento: e.target.value })}
            required
            error={!!errors.dataVencimento}
            helperText={errors.dataVencimento}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Status</InputLabel>
            <Select
              value={newLicense.status}
              onChange={(e) => setNewLicense({ ...newLicense, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="em_processo">Em processo</MenuItem>
              <MenuItem value="valida">Válida</MenuItem>
              <MenuItem value="vencida">Vencida</MenuItem>
              <MenuItem value="dispensada">Dispensada</MenuItem>
              <MenuItem value="a_expirar">A Expirar</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handleCreateLicense} fullWidth>
            Criar
          </Button>
        </Box>
      </Modal>

      {selectedLicense && (
        <LicenseModal
          licenca={selectedLicense}
          fetchLicencas={fetchLicencas}
          onClose={() => setSelectedLicense(null)}
        />
      )}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja deletar a licença {licenseToDelete?.nome}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={!licenseToDelete}>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
