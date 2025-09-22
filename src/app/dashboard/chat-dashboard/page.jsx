'use client';

import React from 'react';
import Head from 'next/head';

import { Container } from '@mui/material';

import ChatDashboard from 'src/components/ChatDashboard';

export default function ChatDashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard de Chat - Sistema</title>
      </Head>
      
      <Container maxWidth="lg">
        <ChatDashboard />
      </Container>
    </>
  );
}
