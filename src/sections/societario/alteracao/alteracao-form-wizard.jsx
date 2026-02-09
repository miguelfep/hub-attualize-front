import { toast } from 'sonner';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Box, Card, Button, Container, Typography, CardContent } from '@mui/material';

import { BackToTop } from 'src/components/animate';

import AlteracaoEnderecoForm from 'src/sections/societario/alteracao/alteracao-endereco-form';

import AlteracaoCnaeForm from './alteracao-cnae-form';
import AlteracaoDocumentos from './alteracao-documentos';
import AlteracaoInfoGeralForm from './alteracao-info-geral-form';
import AlteracaoQuadroSocioetarioForm from './alteracao-quadro-societario-form';

export function AlteracaoFormWizard({ formData, onSave, onApproval }) {
  const [loadingApproval, setLoadingApproval] = useState(false);
  const { formState: { isSubmitting } } = useFormContext();

  return (
    <Container sx={{ mb: 10 }}>
      <Box sx={{ textAlign: 'center', my: { xs: 2, md: 5 } }}>
        <Box
          component="img"
          alt="Logo da Empresa"
          src="/logo/hub-tt.png"
          sx={{ width: 64, height: 64, mb: 2 }}
        />
        <Typography variant="h4">
          Abaixo, você pode visualizar alguns dados de sua empresa. Para editá-los, ative o campo correspondente e
          insira as novas informações. Se possível, preencha todos os campos, caso contrário, deixe em branco.
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <AlteracaoInfoGeralForm infoGeralAlteracao={formData} />
          <AlteracaoEnderecoForm enderecoAlteracao={formData} />
          <AlteracaoQuadroSocioetarioForm alteracaoId={formData?._id} />
          <AlteracaoCnaeForm atividadeAlteracao={formData || {}} />
          <AlteracaoDocumentos alteracaoId={formData?._id} />

          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              onClick={(e) => {
                e.preventDefault();
                onSave();
              }}
              disabled={isSubmitting}
            >
              Salvar Alterações
            </Button>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={async (e) => {
                e.preventDefault();
                setLoadingApproval(true);
                try {
                  await onApproval();
                } catch (error) {
                  toast.error('Erro ao solicitar aprovação.');
                } finally {
                  setLoadingApproval(false);
                }
              }}
              disabled={loadingApproval || isSubmitting}
            >
              {loadingApproval ? 'Enviando...' : 'Enviar para Aprovação'}
            </Button>
          </Box>
          <BackToTop />
        </CardContent>
      </Card>
    </Container >
  );
}