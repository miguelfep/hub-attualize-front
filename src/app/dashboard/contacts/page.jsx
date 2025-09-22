'use client';

import { DashboardContent } from 'src/layouts/dashboard';

import { ContactList } from 'src/sections/contacts/contact-list';

// ----------------------------------------------------------------------

export default function ContactsPage() {
  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
    >
      <ContactList />
    </DashboardContent>
  );
}
