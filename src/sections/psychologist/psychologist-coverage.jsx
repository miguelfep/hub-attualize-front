'use client';

import { useState } from 'react';
import { Marker, Geography, Geographies, ComposableMap } from 'react-simple-maps';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// GeoJSON do Brasil (TopoJSON otimizado)
const BRAZIL_TOPO_JSON = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

// Estados onde atendemos - coordenadas das capitais
const ESTADOS_ATENDIDOS = [
  // Região Sul
  { sigla: 'PR', nome: 'Paraná', coordinates: [-49.2733, -25.4284], destaque: true },
  { sigla: 'SC', nome: 'Santa Catarina', coordinates: [-48.5480, -27.5954] },
  { sigla: 'RS', nome: 'Rio Grande do Sul', coordinates: [-51.2177, -30.0346] },
  
  // Região Sudeste
  { sigla: 'SP', nome: 'São Paulo', coordinates: [-46.6333, -23.5505] },
  { sigla: 'RJ', nome: 'Rio de Janeiro', coordinates: [-43.1729, -22.9068] },
  { sigla: 'MG', nome: 'Minas Gerais', coordinates: [-43.9345, -19.9167] },
  { sigla: 'ES', nome: 'Espírito Santo', coordinates: [-40.3128, -20.3155] },
  
  // Região Centro-Oeste
  { sigla: 'DF', nome: 'Distrito Federal', coordinates: [-47.9218, -15.8267] },
  { sigla: 'GO', nome: 'Goiás', coordinates: [-49.2648, -16.6869] },
  { sigla: 'MT', nome: 'Mato Grosso', coordinates: [-56.0979, -15.6014] },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', coordinates: [-54.6201, -20.4697] },
  
  // Região Nordeste
  { sigla: 'BA', nome: 'Bahia', coordinates: [-38.5014, -12.9714] },
  { sigla: 'PE', nome: 'Pernambuco', coordinates: [-34.8770, -8.0476] },
  { sigla: 'CE', nome: 'Ceará', coordinates: [-38.5267, -3.7319] },
  { sigla: 'RN', nome: 'Rio Grande do Norte', coordinates: [-35.2110, -5.7945] },
  { sigla: 'PB', nome: 'Paraíba', coordinates: [-34.8450, -7.1195] },
  { sigla: 'AL', nome: 'Alagoas', coordinates: [-35.7350, -9.6658] },
  { sigla: 'SE', nome: 'Sergipe', coordinates: [-37.0731, -10.9472] },
  { sigla: 'MA', nome: 'Maranhão', coordinates: [-44.2825, -2.5387] },
  { sigla: 'PI', nome: 'Piauí', coordinates: [-42.8016, -5.0892] },
  
  // Região Norte
  { sigla: 'AM', nome: 'Amazonas', coordinates: [-60.0217, -3.1190] },
  { sigla: 'PA', nome: 'Pará', coordinates: [-48.4902, -1.4558] },
  { sigla: 'RO', nome: 'Rondônia', coordinates: [-63.9004, -8.7612] },
  { sigla: 'AC', nome: 'Acre', coordinates: [-67.8243, -9.9754] },
];

// ----------------------------------------------------------------------

export function PsychologistCoverage() {
  const theme = useTheme();
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main} 25%, transparent 25%, transparent 75%, ${theme.palette.primary.main} 75%)`,
          backgroundSize: '60px 60px',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        {/* Header */}
        <Stack spacing={3} sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center' }}>
          <Stack direction="row" justifyContent="center" spacing={1}>
            <Iconify 
              icon="solar:map-bold-duotone" 
              width={40} 
              sx={{ color: 'primary.main' }} 
            />
          </Stack>

          <Typography variant="h2" sx={{ fontWeight: 800 }}>
            Atendemos psicólogos em todo o Brasil
          </Typography>

          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            Presença em <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{ESTADOS_ATENDIDOS.length} estados</Box> com mais de <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>789+ psicólogos atendidos</Box>
          </Typography>
        </Stack>

        {/* Card com Estatística Principal */}
        <Card
          sx={{
            p: 4,
            mb: 5,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
            boxShadow: theme.customShadows.z24,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h2" sx={{ fontWeight: 900 }}>
              789+
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.95, fontWeight: 600 }}>
              Psicólogos atendidos em todo o Brasil
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              Presentes em {ESTADOS_ATENDIDOS.length} estados com atendimento especializado
            </Typography>
          </Stack>
        </Card>

        {/* Mapa do Brasil */}
        <Card 
          sx={{ 
            p: { xs: 2, md: 4 },
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: theme.customShadows.z20,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            position: 'relative',
          }}
        >
          {/* Tooltip Customizado */}
          {tooltipContent && (
            <Box
              sx={{
                position: 'fixed',
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y + 10,
                bgcolor: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 1,
                fontSize: '0.875rem',
                fontWeight: 600,
                pointerEvents: 'none',
                zIndex: 9999,
                boxShadow: theme.customShadows.z20,
                whiteSpace: 'nowrap',
              }}
            >
              {tooltipContent}
            </Box>
          )}

          <Box
            sx={{
              width: '100%',
              maxWidth: 1000,
              mx: 'auto',
            }}
          >
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 800,
                center: [-52, -15],
              }}
              style={{
                width: '100%',
                height: 'auto',
              }}
            >
              <Geographies geography={BRAZIL_TOPO_JSON}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const estadoAtendido = ESTADOS_ATENDIDOS.find(
                      (e) => geo.properties.sigla === e.sigla || geo.properties.name === e.nome
                    );
                    
                    const estadoNome = geo.properties.name || geo.properties.nome || '';

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={
                          estadoAtendido
                            ? alpha(theme.palette.primary.main, 0.15)
                            : alpha(theme.palette.grey[500], 0.08)
                        }
                        stroke={theme.palette.divider}
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: {
                            fill: estadoAtendido
                              ? alpha(theme.palette.primary.main, 0.3)
                              : alpha(theme.palette.grey[500], 0.15),
                            outline: 'none',
                            cursor: 'pointer',
                          },
                          pressed: { outline: 'none' },
                        }}
                        onMouseEnter={(evt) => {
                          if (estadoAtendido) {
                            setHoveredState(estadoAtendido.sigla);
                            setTooltipContent(`${estadoNome} - Atendemos`);
                          } else {
                            setTooltipContent(`${estadoNome} - Em breve`);
                          }
                          setTooltipPosition({ x: evt.clientX, y: evt.clientY });
                        }}
                        onMouseMove={(evt) => {
                          setTooltipPosition({ x: evt.clientX, y: evt.clientY });
                        }}
                        onMouseLeave={() => {
                          setHoveredState(null);
                          setTooltipContent('');
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Markers dos Estados Atendidos */}
              {ESTADOS_ATENDIDOS.map((estado) => (
                <Marker key={estado.sigla} coordinates={estado.coordinates}>
                  <g
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(evt) => {
                      setHoveredState(estado.sigla);
                      setTooltipContent(`${estado.nome} - ${estado.destaque ? 'Nossa Sede 🏢' : 'Atendemos ✅'}`);
                      setTooltipPosition({ x: evt.clientX, y: evt.clientY });
                    }}
                    onMouseMove={(evt) => {
                      setTooltipPosition({ x: evt.clientX, y: evt.clientY });
                    }}
                    onMouseLeave={() => {
                      setHoveredState(null);
                      setTooltipContent('');
                    }}
                  >
                    {/* Pin redondo com logo */}
                    <g transform={`scale(${estado.destaque ? 1.5 : 1.1})`}>
                      {/* Círculo externo colorido (borda) */}
                      <circle
                        r={10}
                        fill={estado.destaque ? theme.palette.warning.main : theme.palette.primary.main}
                        style={{
                          filter: hoveredState === estado.sigla 
                            ? 'brightness(1.2) drop-shadow(0px 4px 8px rgba(0,0,0,0.5))' 
                            : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))',
                          transition: 'all 0.2s',
                        }}
                      />
                      
                      {/* Círculo interno branco (fundo da logo) */}
                      <circle
                        r={8}
                        fill="white"
                      />
                      
                      {/* Logo hub-tt.png da Attualize */}
                      <image
                        xlinkHref="/logo/hub-tt.png"
                        x={-7}
                        y={-7}
                        width={14}
                        height={14}
                        style={{ pointerEvents: 'none' }}
                      />
                    </g>

                    {/* Label com sigla */}
                    {(estado.destaque || hoveredState === estado.sigla) && (
                      <g transform={`translate(0, ${estado.destaque ? 12 : 10})`}>
                        {/* Background da label */}
                        <rect
                          x={-20}
                          y={0}
                          width={40}
                          height={20}
                          fill="white"
                          rx={4}
                          stroke={estado.destaque ? theme.palette.warning.main : theme.palette.primary.main}
                          strokeWidth={2}
                          style={{
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                          }}
                        />
                        {/* Texto da label */}
                        <text
                          textAnchor="middle"
                          y={14}
                          style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: 12,
                            fontWeight: 900,
                            fill: estado.destaque ? theme.palette.warning.dark : theme.palette.primary.dark,
                            pointerEvents: 'none',
                          }}
                        >
                          {estado.sigla}
                        </text>
                      </g>
                    )}

                    {/* Badge HQ para PR */}
                    {estado.destaque && (
                      <g transform="translate(12, -24)">
                        <circle r={7} fill={theme.palette.error.main} stroke="white" strokeWidth={2} />
                        <text
                          textAnchor="middle"
                          y={2.5}
                          style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: 7,
                            fontWeight: 900,
                            fill: 'white',
                            pointerEvents: 'none',
                          }}
                        >
                          HQ
                        </text>
                      </g>
                    )}
                  </g>
                </Marker>
              ))}
            </ComposableMap>

            {/* Legenda */}
            <Stack 
              direction="row" 
              spacing={3} 
              justifyContent="center" 
              sx={{ mt: 3, flexWrap: 'wrap', gap: 2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    border: '2px solid white',
                    boxShadow: 1,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Estados atendidos ({ESTADOS_ATENDIDOS.length})
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                    border: '2px solid white',
                    boxShadow: 1,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Nossa sede (Paraná)
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.grey[500], 0.2),
                    border: `2px solid ${theme.palette.divider}`,
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Estados não atendidos
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Card>

        {/* CTA Final */}
        <Card
          sx={{
            mt: 6,
            p: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.08)})`,
            border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Iconify 
              icon="solar:verified-check-bold" 
              width={64} 
              sx={{ color: 'success.main' }} 
            />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Atendimento Nacional com Excelência
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
              Não importa onde você esteja, oferecemos o mesmo padrão de <strong>qualidade e atendimento especializado</strong> para psicólogos em todo o Brasil.
            </Typography>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
