'use client';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ComponentHero } from 'src/sections/_examples/component-hero';
import { ComponentContainer } from 'src/sections/_examples/component-block';

import { FormWizard } from './form-wizard';

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
