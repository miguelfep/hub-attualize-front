import { useRef, useEffect } from 'react';
import { m, animate, useInView, useTransform, useMotionValue } from 'framer-motion';

import Typography from '@mui/material/Typography';

export const formatToCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  export const formatToInteger = (value) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));


// ----------------------------------------------------------------------

export function AnimateCountUp({
  to,
  sx,
  from = 0,
  unit = '',
  toFixed = 0,
  duration = 2,
  once = true,
  amount = 0.5,
  component = 'p',
  formatter,
  ...other
}) {
  const ref = useRef(null);

  const inView = useInView(ref, { once: true, amount: 0.5 });

  const count = useMotionValue(from);

  const formatted = useTransform(count, (latest) =>
    formatter ? formatter(latest) : Math.round(latest)
  );

  useEffect(() => {
    if (inView) {
      animate(count, to, { duration: 2});
    }
  }, [count, inView, to]);

  return (
    <Typography
      component={component}
      sx={{
        display: 'inline-flex',
        p: 0,
        m: 0,
        ...sx,
      }}
      {...other}
    >
      <m.span ref={ref}>{formatted}</m.span>
      {unit}
    </Typography>
  );
}
