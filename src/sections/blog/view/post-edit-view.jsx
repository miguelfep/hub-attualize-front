'use client';

import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { useGetBlogPost } from 'src/actions/blog';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostNewEditForm } from '../post-new-edit-form';

// ----------------------------------------------------------------------

export function PostEditView({ slug }) {
  const { post, postLoading } = useGetBlogPost(slug);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Blog', href: paths.dashboard.post.root },
          { name: post?.title || slug },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {postLoading && <LinearProgress sx={{ mb: 3 }} />}

      {!postLoading && !post ? (
        <EmptyContent
          filled
          title="Post não encontrado!"
          description="A postagem que você está procurando não existe ou foi removida."
        />
      ) : (
        !postLoading && <PostNewEditForm currentPost={post} />
      )}
    </DashboardContent>
  );
}
