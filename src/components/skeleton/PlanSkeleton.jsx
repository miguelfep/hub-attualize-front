import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

export function PlanCardSkeleton({ isCurrentPlan }) {
  return (
    <Card 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        opacity: isCurrentPlan ? 0.6 : 1, 
      }}
    >
      <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
      
      <Skeleton variant="text" width="60%" sx={{ fontSize: '1.5rem', mb: 1 }} />
      <Skeleton variant="text" width="80%" sx={{ fontSize: '0.875rem', mb: 2 }} />

      <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
        {[...Array(5)].map((_, index) => (
          <Stack key={index} direction="row" alignItems="center" spacing={1.5}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width="90%" sx={{ fontSize: '0.875rem' }} />
          </Stack>
        ))}
      </Stack>
      
      <Skeleton variant="rectangular" sx={{ width: '100%', height: 40, borderRadius: 1, mt: 3 }} />
    </Card>
  );
}
