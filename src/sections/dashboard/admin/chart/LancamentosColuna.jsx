import { alpha, useTheme } from "@mui/material/styles";
import { Box, Chip, List, Stack, Avatar, ListItem, Typography } from "@mui/material";

import { Iconify } from "src/components/iconify";

export default function LancamentosColuna({ title, items, color, icon, renderItem }) {
  const theme = useTheme();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        p: 3, pb: 2,
        backgroundColor: alpha(theme.palette[color].main, 0.03),
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ bgcolor: alpha(theme.palette[color].main, 0.1), width: 32, height: 32 }}>
            <Iconify icon={icon} width={18} color={theme.palette[color].main} />
          </Avatar>
          <Typography variant="h6" color={`${color}.main`} sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Chip label={items.length} size="small" color={color} variant="outlined" sx={{ ml: 1, height: 24 }} />
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List dense sx={{ py: 0 }}>
          {items.length > 0 ? items.map(renderItem) : (
            <ListItem disableGutters sx={{ py: 2, justifyContent: 'center' }}>
              <Stack alignItems="center" spacing={1}>
                <Iconify icon="solar:file-text-outline" width={40} color="text.disabled" />
                <Typography variant="body2" color="text.secondary">
                  Nenhum lançamento neste dia.
                </Typography>
              </Stack>
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );
}
