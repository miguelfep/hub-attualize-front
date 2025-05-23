import { toast } from "sonner";
import { useState } from "react";
import nProgress from "nprogress";
import { useRouter } from "next/navigation";

import { Box, Button, Typography } from "@mui/material";

import { sendMessageLink } from "src/actions/societario"; 

import { Iconify } from "src/components/iconify";

export default function AlteracaoIniciadoForm({ currentAlteracao }) {
  const router = useRouter();

  const [sending, setSending] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const viewForm = () => {
    setNavigating(true);
    nProgress.start();
    router.push(`/empresa/alteracao/${currentAlteracao._id}`);
  };

  const sendLink = async () => {
    try {
      setSending(true);
      nProgress.start();
      await sendMessageLink(currentAlteracao._id);
      toast.success("Mensagem enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao reenviar link");
    } finally {
      setSending(false);
      nProgress.done();
    }
  };

  return (
    <Box sx={{ my: 5, textAlign: "center" }}>
      <Typography>
        Formulário de alteração inicial foi enviado ao cliente. Aguarde a devolução
      </Typography>

      <Button
        sx={{ m: 4 }}
        variant="contained"
        color="success"
        startIcon={<Iconify icon="ic:baseline-whatsapp" />}
        onClick={sendLink}
        disabled={sending}
        >
        {sending ? "Enviando..." : "Reenviar Link"}
      </Button>

      <Button
        sx={{ m: 4 }}
        variant="contained"
        startIcon={<Iconify icon="mdi:form" />}
        onClick={viewForm}
        disabled={navigating}
      >
        {navigating ? "Carregando..." : "Ver Formulário"}
      </Button>
    </Box>
  );
}
