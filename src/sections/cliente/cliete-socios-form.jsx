import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  IconButton,
  Modal,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Grid,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import FormControlLabel from '@mui/material/FormControlLabel';
import { toast } from 'sonner';

function SociosForm() {
  const { control, setValue } = useFormContext();
  const {
    fields: sociosFields,
    append: appendSocio,
    remove: removeSocio,
  } = useFieldArray({
    control,
    name: 'socios',
  });

  const [openModal, setOpenModal] = useState(false);

  const [nomeSocio, setNomeSocio] = useState('');
  const [cpfSocio, setCpfSocio] = useState('');
  const [rgSocio, setRgSocio] = useState('');
  const [cnhSocio, setCnhSocio] = useState('');
  const [administradorSocio, setAdministradorSocio] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleAddSocio = () => {
    appendSocio({
      nome: nomeSocio,
      cpf: cpfSocio,
      rg: rgSocio,
      cnh: cnhSocio,
      administrador: administradorSocio,
    });
    handleCloseModal();
    setNomeSocio('');
    setCpfSocio('');
    setRgSocio('');
    setCnhSocio('');
    setAdministradorSocio(false);
  };

  const handleCopyToClipboard = (value, name) => {
    navigator.clipboard.writeText(value);
    toast.success(`${name} copiado`);
  };

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
              <TableCell>Administrador</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sociosFields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>{field.nome}</TableCell>
                <TableCell>
                  <Tooltip title="Copiar CPF">
                    <span
                      onClick={() => handleCopyToClipboard(field.cpf, 'CPF')}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {field.cpf}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Copiar RG">
                    <span
                      onClick={() => handleCopyToClipboard(field.rg, 'RG')}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {field.rg}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Copiar CNH">
                    <span
                      onClick={() => handleCopyToClipboard(field.cnh, 'CNH')}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {field.cnh}
                    </span>
                  </Tooltip>
                </TableCell>{' '}
                <TableCell>
                  <Switch
                    checked={field.administrador}
                    onChange={(e) => setValue(`socios[${index}].administrador`, e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Deletar">
                    <IconButton onClick={() => removeSocio(index)}>
                      <Iconify icon="el:remove-sign" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button onClick={handleOpenModal} variant="outlined" sx={{ mt: 2 }}>
        Adicionar Sócio
      </Button>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            p: 4,
          }}
        >
          <Box
            sx={{ backgroundColor: 'white', borderRadius: 2, maxWidth: 600, width: '100%', p: 3 }}
          >
            <Typography variant="h6" gutterBottom>
              Adicionar Sócio
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="nome"
                  value={nomeSocio}
                  onChange={(e) => setNomeSocio(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CPF"
                  name="cpf"
                  value={cpfSocio}
                  onChange={(e) => setCpfSocio(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="RG"
                  name="rg"
                  value={rgSocio}
                  onChange={(e) => setRgSocio(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CNH"
                  name="cnh"
                  value={cnhSocio}
                  onChange={(e) => setCnhSocio(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={administradorSocio}
                      onChange={(e) => setAdministradorSocio(e.target.checked)}
                    />
                  }
                  label="Administrador"
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleAddSocio}>
                Adicionar
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </Card>
  );
}

export default SociosForm;
