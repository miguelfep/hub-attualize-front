'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

/**
 * Componente modal para exportar conciliação para formato TXT do Domínio Contábil
 * 
 * @param {string} clienteId - ID do cliente
 * @param {string} bancoId - ID do banco
 * @param {string} bancoNome - Nome do banco para exibição (opcional)
 * @param {boolean} isOpen - Se o modal está aberto
 * @param {function} onClose - Callback para fechar o modal
 */
export default function ExportarDominio({ clienteId, bancoId, bancoNome, isOpen, onClose }) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);

  // Definir período padrão (mês atual)
  useEffect(() => {
    if (isOpen) {
      const hoje = new Date();
      const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      setDataInicio(primeiroDia.toISOString().split('T')[0]);
      setDataFim(ultimoDia.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  // ✅ Validação de período
  const validarPeriodo = () => {
    if (!dataInicio || !dataFim) {
      return { valido: false, erro: 'Preencha as datas de início e fim' };
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
      return { valido: false, erro: 'Datas inválidas' };
    }

    if (fim < inicio) {
      return { valido: false, erro: 'A data final deve ser posterior ou igual à data inicial' };
    }

    // Verificar se o período não é muito grande
    const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    if (dias > 365) {
      return { valido: false, erro: 'O período não pode ser maior que 1 ano' };
    }

    return { valido: true };
  };

  // ✅ Tratamento de erros específicos
  const tratarErroExportacao = (error) => {
    const mensagem = error?.message || error?.error || 'Erro desconhecido';

    // Mapear erros conhecidos
    if (mensagem.includes('não encontrada') || mensagem.includes('não encontrado')) {
      return 'Banco ou cliente não encontrado. Verifique os dados.';
    }

    if (mensagem.includes('conciliação finalizada') || mensagem.includes('conciliações finalizadas')) {
      return 'Não há conciliações finalizadas para este banco. Finalize as conciliações antes de exportar.';
    }

    if (mensagem.includes('Conta bancária não encontrada')) {
      return 'Configure uma conta contábil para o banco antes de exportar.';
    }

    if (mensagem.includes('transação conciliada') || mensagem.includes('transações conciliadas')) {
      return 'Não há transações conciliadas no período selecionado. Verifique se há conciliações finalizadas com transações neste período.';
    }

    if (mensagem.includes('dataInicio') || mensagem.includes('dataFim')) {
      return 'Preencha corretamente as datas do período.';
    }

    return mensagem;
  };

  const handleExportar = async () => {
    // Validações
    const validacao = validarPeriodo();
    if (!validacao.valido) {
      toast.error(validacao.erro);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        dataInicio,
        dataFim,
      });

      // ✅ A rota retorna o arquivo TXT diretamente (não JSON)
      // Usar fetch diretamente para obter o blob, mas com as credenciais do axios
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}conciliacao/exportar-dominio/${clienteId}/${bancoId}?${params.toString()}`;
      
      // Obter token do axios configurado
      const token = localStorage.getItem('accessToken') || '';
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Verificar se é um erro (JSON)
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao exportar');
      }

      // Verificar se é um arquivo (text/plain)
      if (response.ok && contentType && contentType.includes('text/plain')) {
        // Obter nome do arquivo do header Content-Disposition
        const contentDisposition = response.headers.get('content-disposition');
        let fileName = `dominio_${dataInicio}_${dataFim}.txt`;
        
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        }

        // Baixar arquivo
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Arquivo exportado com sucesso!');
        onClose();
      } else {
        throw new Error('Resposta inesperada do servidor');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      
      // Tratar erros específicos
      const mensagemErro = tratarErroExportacao(error);
      
      toast.error(mensagemErro, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify icon="eva:download-fill" width={32} color="primary.main" />
          <Typography variant="h5">Exportar para Domínio Contábil</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* ✅ Exibir nome do banco se fornecido */}
          {bancoNome && (
            <Alert severity="info" icon={<Iconify icon="eva:info-outline" />}>
              <Typography variant="body2" fontWeight="bold">
                Banco: {bancoNome}
              </Typography>
            </Alert>
          )}

          {/* ✅ Aviso sobre conciliações finalizadas */}
          <Alert severity="warning" icon={<Iconify icon="eva:alert-triangle-fill" />}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              ⚠️ Atenção!
            </Typography>
            <Typography variant="body2">
              A exportação só inclui transações de <strong>conciliações finalizadas</strong>.
              Certifique-se de que todas as conciliações do período foram finalizadas antes de exportar.
            </Typography>
          </Alert>

          <TextField
            fullWidth
            type="date"
            label="Data Início"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
            InputLabelProps={{
              shrink: true,
            }}
            disabled={loading}
          />

          <TextField
            fullWidth
            type="date"
            label="Data Fim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            required
            InputLabelProps={{
              shrink: true,
            }}
            disabled={loading}
          />

          <Typography variant="caption" color="text.secondary">
            O arquivo TXT será gerado no formato Fixed Width compatível com o Domínio Contábil.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleExportar}
          disabled={loading || !dataInicio || !dataFim}
          startIcon={loading ? <CircularProgress size={16} /> : <Iconify icon="eva:download-fill" />}
        >
          {loading ? 'Exportando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
