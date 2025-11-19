import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function SearchNotFound({ query, sx, ...other }) {
  if (!query) {
    return (
      <Typography variant="body2" sx={sx}>
        Digite algo para pesquisar
      </Typography>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', borderRadius: 1.5, ...sx }} {...other}>
      <Box sx={{ mb: 1, typography: 'h6' }}>Nenhuma pesquisa encontrada</Box>

      <Typography variant="body2">
        Sem resultados para &nbsp;
        <strong>{`"${query}"`}</strong>
        .
        <br /> Tente buscar por outras palavras.
      </Typography>
    </Box>
  );
}
