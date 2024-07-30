'use client';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FormWizard } from './form-wizard';
import { ComponentHero } from 'src/sections/_examples/component-hero';
import { ComponentContainer } from 'src/sections/_examples/component-block';

// ----------------------------------------------------------------------

export function FormWizardViewAbertura() {
  return (
    <>
      <ComponentHero>
        <CustomBreadcrumbs
          heading="Abertura de empresa"
          links={[{ name: 'Abertura de Empresa' }]}
   
        />
      </ComponentHero>

      <ComponentContainer>
        <FormWizard />
      </ComponentContainer>
    </>
  );
}
