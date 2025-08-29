import { Paper } from "@mui/material"

export const SimplePaper = ({ children, sx, ...other }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 2,
      boxShadow: 'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
      ...sx
    }}
    {...other}
  >
    {children}
  </Paper>
);
