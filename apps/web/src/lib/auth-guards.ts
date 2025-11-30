import { redirect } from '@tanstack/react-router';

export async function requireAuth({ context }: any) {
  const session = context.session;
  // Wait for session to finish loading
  if (session.status === 'loading') {
    // Return early and let the component handle loading state
    return;
  }

  if (!session?.data?.user) {
    throw redirect({
      to: '/auth/register',
    });
  }

  return { user: session.data.user };
}
