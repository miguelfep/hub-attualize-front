'use client';

import Link from '@mui/material/Link';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { deleteBlogPost, publishBlogPost, archiveBlogPost } from 'src/actions/blog';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export const STATUS_LABEL = {
  publicado: { text: 'Publicado', color: 'success' },
  rascunho: { text: 'Rascunho', color: 'warning' },
  arquivado: { text: 'Arquivado', color: 'default' },
};

export function PostStatusLabel({ status }) {
  const info = STATUS_LABEL[status] || { text: status, color: 'default' };
  return (
    <Label variant="soft" color={info.color}>
      {info.text}
    </Label>
  );
}

// ----------------------------------------------------------------------

/**
 * Indicador de comentários com aviso de "novos" (pendentes).
 * Linka para o detalhe do post (onde fica a moderação).
 */
export function PostCommentsIndicator({ slug, total = 0, pending = 0 }) {
  return (
    <Link
      component={RouterLink}
      href={paths.dashboard.post.details(slug)}
      color={pending > 0 ? 'warning.main' : 'text.disabled'}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, typography: 'caption' }}
    >
      <Iconify icon="eva:message-circle-fill" width={16} />
      {total}
      {pending > 0 && (
        <Label color="warning" sx={{ ml: 0.5, height: 18, px: 0.5 }}>
          {pending} novo{pending > 1 ? 's' : ''}
        </Label>
      )}
    </Link>
  );
}

// ----------------------------------------------------------------------

/**
 * Menu de ações de um post (ver / editar / publicar / arquivar / excluir).
 */
export function PostActionsMenu({ post, onChanged }) {
  const popover = usePopover();
  const router = useRouter();

  const { id, slug, status } = post;

  const runAction = async (action, successMsg) => {
    popover.onClose();
    try {
      await action();
      toast.success(successMsg);
      onChanged?.();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Não foi possível concluir a ação.');
    }
  };

  return (
    <>
      <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-horizontal-fill" />
      </IconButton>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'bottom-center' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              router.push(paths.dashboard.post.details(slug));
            }}
          >
            <Iconify icon="solar:eye-bold" />
            Ver
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              router.push(paths.dashboard.post.edit(slug));
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>

          {status !== 'publicado' && (
            <MenuItem
              onClick={() => runAction(() => publishBlogPost(id), 'Post publicado!')}
              sx={{ color: 'success.main' }}
            >
              <Iconify icon="solar:upload-bold" />
              Publicar
            </MenuItem>
          )}

          {status === 'publicado' && (
            <MenuItem
              onClick={() => runAction(() => archiveBlogPost(id), 'Post arquivado.')}
              sx={{ color: 'warning.main' }}
            >
              <Iconify icon="solar:archive-bold" />
              Arquivar
            </MenuItem>
          )}

          <MenuItem
            onClick={() => runAction(() => deleteBlogPost(id), 'Post excluído.')}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Excluir
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
