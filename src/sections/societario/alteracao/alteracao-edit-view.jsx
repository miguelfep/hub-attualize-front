'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AlteracaoEditForm from 'src/sections/societario/alteracao/alteracao-edit-form';

// ----------------------------------------------------------------------

export default function AlteracaoEditView({ alteracaoData }) {

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Alteração', href: paths.dashboard.alteracao.root },
          { name: alteracaoData?.razaoSocial || '' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AlteracaoEditForm alteracaoData={alteracaoData} />

    </DashboardContent>
  );
}
