'use client';

import { DashboardContent } from 'src/layouts/dashboard';

import { ContactForm } from 'src/sections/contacts/contact-form';

// ----------------------------------------------------------------------

export default function NewContactPage() {
  return (
    <DashboardContent
      maxWidth="md"
      sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
    >
      <ContactForm />
    </DashboardContent>
  );
}
