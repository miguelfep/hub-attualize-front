import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useState } from 'react';
import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Stack,
  Table,
  Button,
  Switch,
  Dialog,
  Tooltip,
  MenuList,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatRg, formatCpf, formatCnh, removeFormatting } from 'src/utils/format-input';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

/** Meia-noite UTC do dia civil — alinhado ao parseISO da SerPro no backend. */
function toUtcDateOnly(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Exibe no DatePicker o dia civil UTC sem deslocar por fuso local. */
function utcDateToPickerValue(value) {
  const d = toUtcDateOnly(value);
  if (!d) return null;
  return dayjs(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Converte seleção do DatePicker de volta para meia-noite UTC. */
function pickerValueToUtcDate(value) {
  if (!value?.isValid?.()) return null;
  return new Date(Date.UTC(value.year(), value.month(), value.date()));
}

function formatDataInclusao(value) {
  const d = toUtcDateOnly(value);
  if (!d) return '—';
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function resetSocioForm(setters) {
  const {
    setNomeSocio,
    setCpfSocio,
    setRgSocio,
    setCnhSocio,
    setAdministradorSocio,
    setDataInclusaoSocio,
    setEditingIndex,
  } = setters;
  setNomeSocio('');
  setCpfSocio('');
  setRgSocio('');
  setCnhSocio('');
  setAdministradorSocio(false);
  setDataInclusaoSocio(null);
  setEditingIndex(null);
}

function SociosForm() {
  const { control, setValue } = useFormContext();
  const sociosValues = useWatch({ control, name: 'socios' });
  const {
    fields: sociosFields,
    append: appendSocio,
    update: updateSocio,
    remove: removeSocio,
  } = useFieldArray({
    control,
    name: 'socios',
  });

  const popover = usePopover();
  const confirmDelete = useBoolean();

  const [openModal, setOpenModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [actionIndex, setActionIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [nomeSocio, setNomeSocio] = useState('');
  const [cpfSocio, setCpfSocio] = useState('');
  const [rgSocio, setRgSocio] = useState('');
  const [cnhSocio, setCnhSocio] = useState('');
  const [administradorSocio, setAdministradorSocio] = useState(false);
  const [dataInclusaoSocio, setDataInclusaoSocio] = useState(null);

  const formSetters = {
    setNomeSocio,
    setCpfSocio,
    setRgSocio,
    setCnhSocio,
    setAdministradorSocio,
    setDataInclusaoSocio,
    setEditingIndex,
  };

  const buildSocioPayload = () => {
    const payload = {
      nome: nomeSocio,
      cpf: removeFormatting(cpfSocio),
      rg: removeFormatting(rgSocio),
      cnh: removeFormatting(cnhSocio),
      administrador: administradorSocio,
    };
    const dataInclusao = toUtcDateOnly(dataInclusaoSocio);
    if (dataInclusao) {
      payload.dataInclusao = dataInclusao;
    }
    return payload;
  };

  const handleOpenAddModal = () => {
    resetSocioForm(formSetters);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetSocioForm(formSetters);
  };

  const handleSaveSocio = () => {
    const payload = buildSocioPayload();
    if (editingIndex !== null) {
      updateSocio(editingIndex, payload);
    } else {
      appendSocio(payload);
    }
    handleCloseModal();
  };

  const handleOpenActions = (event, index) => {
    setActionIndex(index);
    popover.onOpen(event);
  };

  const handleEditSocio = () => {
    if (actionIndex == null) return;
    const socio = sociosValues?.[actionIndex];
    setNomeSocio(socio?.nome ?? '');
    setCpfSocio(formatCpf(socio?.cpf ?? ''));
    setRgSocio(formatRg(socio?.rg ?? ''));
    setCnhSocio(formatCnh(socio?.cnh ?? ''));
    setAdministradorSocio(socio?.administrador === true);
    setDataInclusaoSocio(toUtcDateOnly(socio?.dataInclusao));
    setEditingIndex(actionIndex);
    setOpenModal(true);
    popover.onClose();
  };

  const handleDeleteClick = () => {
    setDeleteIndex(actionIndex);
    confirmDelete.onTrue();
    popover.onClose();
  };

  const handleConfirmDelete = () => {
    if (deleteIndex != null) {
      removeSocio(deleteIndex);
    }
    setDeleteIndex(null);
    confirmDelete.onFalse();
  };

  const handleCopyToClipboard = (value, name) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success(`${name} copiado`);
  };

  const isEditing = editingIndex !== null;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Sócios
      </Typography>
      <TableContainer component={Box}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>RG</TableCell>
              <TableCell>CNH</TableCell>
              <TableCell>Data de inclusão</TableCell>
              <TableCell>Administrador</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sociosFields.map((field, index) => {
              const socio = sociosValues?.[index] ?? {};
              const cpfDisplay = formatCpf(socio.cpf || '');
              const rgDisplay = formatRg(socio.rg || '');
              const cnhDisplay = formatCnh(socio.cnh || '');
              return (
                <TableRow key={field.id}>
                  <TableCell>{socio.nome || '—'}</TableCell>
                  <TableCell>
                    <Tooltip title="Copiar CPF">
                      <span
                        onClick={() => handleCopyToClipboard(cpfDisplay, 'CPF')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleCopyToClipboard(cpfDisplay, 'CPF');
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: cpfDisplay ? 'pointer' : 'default', textDecoration: cpfDisplay ? 'underline' : 'none' }}
                      >
                        {cpfDisplay || '—'}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Copiar RG">
                      <span
                        onClick={() => handleCopyToClipboard(rgDisplay, 'RG')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleCopyToClipboard(rgDisplay, 'RG');
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: rgDisplay ? 'pointer' : 'default', textDecoration: rgDisplay ? 'underline' : 'none' }}
                      >
                        {rgDisplay || '—'}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Copiar CNH">
                      <span
                        onClick={() => handleCopyToClipboard(cnhDisplay, 'CNH')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleCopyToClipboard(cnhDisplay, 'CNH');
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: cnhDisplay ? 'pointer' : 'default', textDecoration: cnhDisplay ? 'underline' : 'none' }}
                      >
                        {cnhDisplay || '—'}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDataInclusao(socio.dataInclusao)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={socio.administrador === true}
                      onChange={(e) => setValue(`socios[${index}].administrador`, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color={popover.open && actionIndex === index ? 'inherit' : 'default'}
                      onClick={(e) => handleOpenActions(e, index)}
                    >
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Button onClick={handleOpenAddModal} variant="outlined" sx={{ mt: 2 }}>
        Adicionar Sócio
      </Button>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem onClick={handleEditSocio}>
            <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
            Deletar
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={() => {
          setDeleteIndex(null);
          confirmDelete.onFalse();
        }}
        title="Excluir sócio"
        content={`Tem certeza que deseja excluir o sócio "${sociosValues?.[deleteIndex]?.nome || 'sem nome'}"?`}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Excluir
          </Button>
        }
      />

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 1.5,
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                }}
              >
                <Iconify icon={isEditing ? 'solar:pen-bold' : 'solar:user-plus-bold'} width={22} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" component="span" sx={{ display: 'block', lineHeight: 1.3 }}>
                  {isEditing ? 'Editar sócio' : 'Adicionar sócio'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {isEditing
                    ? 'Atualize os dados do sócio selecionado.'
                    : 'Preencha os dados para incluir um novo sócio.'}
                </Typography>
              </Box>
            </Stack>
            <IconButton
              aria-label="Fechar"
              onClick={handleCloseModal}
              edge="end"
              sx={{ mt: -0.5, mr: -0.5, color: 'text.secondary' }}
            >
              <Iconify icon="mingcute:close-line" width={20} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Nome"
              name="nome"
              value={nomeSocio}
              onChange={(e) => setNomeSocio(e.target.value)}
            />
            <TextField
              fullWidth
              label="CPF"
              name="cpf"
              value={cpfSocio}
              onChange={(e) => setCpfSocio(formatCpf(e.target.value))}
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              fullWidth
              label="RG"
              name="rg"
              value={rgSocio}
              onChange={(e) => setRgSocio(formatRg(e.target.value))}
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              fullWidth
              label="CNH"
              name="cnh"
              value={cnhSocio}
              onChange={(e) => setCnhSocio(formatCnh(e.target.value))}
              inputProps={{ inputMode: 'numeric' }}
            />
            <DatePicker
              label="Data de inclusão"
              value={utcDateToPickerValue(dataInclusaoSocio)}
              onChange={(newValue) => {
                setDataInclusaoSocio(pickerValueToUtcDate(newValue));
              }}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={administradorSocio}
                  onChange={(e) => setAdministradorSocio(e.target.checked)}
                />
              }
              label="Administrador"
              sx={{ ml: 0 }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" color="inherit" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveSocio}>
            {isEditing ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default SociosForm;
