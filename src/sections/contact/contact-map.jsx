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
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.1638631881447!2d-49.24441352376378!3d-25.466203277538703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dce52717aed531%3A0x48d49c2e397f9a22!2sAv.%20Sen.%20Salgado%20Filho%2C%201847%20-%20Prado%20Velho%2C%20Curitiba%20-%20PR%2C%2081510-001!5e0!3m2!1spt-BR!2sbr!4v1741206482318!5m2!1spt-BR!2sbr"
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
