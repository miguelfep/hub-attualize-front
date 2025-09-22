import React, { useState } from 'react';

import {
  Box, Card, Alert, Button, TextField, Typography, CardContent
} from '@mui/material';

import { useAuth } from 'src/hooks/useAuth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirecionar para o dashboard
        window.location.href = '/dashboard/chat-dashboard';
      } else {
        setError(result.message || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      bgcolor: 'grey.100'
    }}>
      <Card sx={{ width: 400, p: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Login - Chat
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" align="center">
            Use suas credenciais para acessar o sistema de chat
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
