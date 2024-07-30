import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

const ContactMap = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        zIndex: 0,
        borderRadius: 1.5,
        overflow: 'hidden',
        position: 'relative',
        height: { xs: 320, md: 560 },
      }}
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14413.462125543881!2d-49.2499281!3d-25.4260402!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dce58ba3894c9d%3A0x59629d10d0294e7f!2sAttualize%20Contábil!5e0!3m2!1spt-BR!2sbr!4v1722284346024!5m2!1spt-BR!2sbr"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Attualize Contábil Location"
      />
    </Box>
  );
};

export default ContactMap;
