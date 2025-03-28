import { Box, Card, Button, Container, Typography, CardContent } from '@mui/material';

import { BackToTop } from 'src/components/animate';

import AlteracaoEnderecoForm from 'src/sections/societario/alteracao/alteracao-endereco-form';

import AlteracaoCnaeForm from './alteracao-cnae-form';
import AlteracaoDocumentos from './alteracao-documentos';
import AlteracaoInfoGeralForm from './alteracao-info-geral-form';
import AlteracaoQuadroSocioetarioForm from './alteracao-quadro-societario-form';

export function AlteracaoFormWizard({ alteracaoData }) {

  return (

    <Container sx={{ mb: 10 }}>
      <Box sx={{ textAlign: 'center', my: { xs: 2, md: 5 } }}>
        <Box
          component="img"
          alt="Logo da Empresa"
          src="/logo/hub-tt.png"
          sx={{
            width: 64,
            height: 64,
            mb: 2,
          }}
        />
        <Typography variant="h4" >
          Abaixo, você pode visualizar os dados atuais. Para editá-los, ative o campo correspondente e
          insira as novas informações.
        </Typography>
      </Box>
      <Card>
        <CardContent >
          <AlteracaoInfoGeralForm infoGeralAlteracao={alteracaoData} />
          <AlteracaoEnderecoForm enderecoAlteracao={alteracaoData?.enderecoComercial || {}} />
          <AlteracaoQuadroSocioetarioForm socioAlteracao={alteracaoData?.socios || []} />
          <AlteracaoCnaeForm atividadeAlteracao={alteracaoData || {}} />
          <AlteracaoDocumentos aberturaId={alteracaoData?.codigo} />

          <Box display="flex" justifyContent="space-between" mt={3}>
                      <Button 
                      variant="contained" 
                      // onClick={handleSave}
                      color="secondary" 
                      >
                        Salvar Alterações
                      </Button>
                      <Button
                        type='submit'
                        variant="contained"
                        color="primary"
                        // onClick={handleApproval}
                        // disabled={loadingApproval}
                      >
                       Enviar para Aprovação {/* {loadingApproval ? 'Enviando...' : 'Enviar para Aprovação'} */}
                      </Button>
                    </Box>
          <BackToTop />
        </CardContent>
      </Card>
    </Container>
  );
}