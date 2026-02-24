import { Stack, Skeleton, TableRow, TableCell } from '@mui/material';

export function AuditLogTableRowSkeleton() {
  return (
    <TableRow>
      <TableCell sx={{ width: 180 }}>
        <Skeleton variant="text" width={140} sx={{ fontSize: '0.875rem' }} />
      </TableCell>

      <TableCell sx={{ width: 100 }}>
        <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 1.5 }} />
      </TableCell>

      <TableCell sx={{ width: 120 }}>
        <Skeleton variant="text" width={80} />
      </TableCell>

      <TableCell sx={{ width: 200 }}>
        <Stack spacing={0.5}>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" sx={{ fontSize: '0.75rem' }} />
        </Stack>
      </TableCell>

      <TableCell sx={{ width: 180 }}>
        <Skeleton variant="text" width="70%" />
      </TableCell>

      <TableCell sx={{ width: 200 }}>
        <Skeleton variant="text" width="70%" />
      </TableCell>

      <TableCell align="right" sx={{ width: 100 }}>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
      </TableCell>
    </TableRow>
  );
}
