import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

import { SvgColor } from '../svg-color';

// ----------------------------------------------------------------------

export function ComponentCardAbertura({ item, selected, onClick }) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        overflow: 'hidden',
        position: 'relative',
        textDecoration: 'none',
        borderColor: selected ? 'primary.main' : 'divider',
        boxShadow: selected ? 4 : 1,
        borderWidth: selected ? 2 : 1,
        cursor: 'pointer',
      }}
    >
      <CardActionArea
        component={m.div}
        whileHover={{ scale: 1.05 }}
        sx={{
          borderRadius: 0,
          color: 'text.secondary',
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <Box display="flex" justifyContent="center" mb={1}>
          <SvgColor
            component="img"
            src={item.icon}
            alt={item.name}
            sx={{ width: 80, height: 80 }}
          />
        </Box>
        <Typography variant="subtitle1" textAlign="center">
          {item.name}
        </Typography>
      </CardActionArea>
    </Paper>
  );
}
