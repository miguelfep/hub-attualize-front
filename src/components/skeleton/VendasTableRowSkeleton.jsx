import { Stack, Skeleton, TableRow, TableCell } from '@mui/material';

export function VendaTableRowSkeleton() {
  return (
    <TableRow>
      <TableCell sx={{ width: 160 }}>
        <Skeleton variant="text" width={80} sx={{ fontSize: '1rem' }} />
      </TableCell>

      <TableCell>
        <Skeleton variant="text" width="80%" />
      </TableCell>

      <TableCell sx={{ width: 140 }}>
        <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 1.5 }} />
      </TableCell>

      <TableCell sx={{ width: 140 }}>
        <Skeleton variant="text" width={100} />
      </TableCell>

      <TableCell align="right" sx={{ width: 120 }}>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
      </TableCell>
    </TableRow>
  );
}