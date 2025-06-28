'use client';

import { Form, FormField } from '@workspace/ui/components/form';
import { Separator } from '@workspace/ui/components/separator';
import LoadingSpinner from '@/components/loading-spinner';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@workspace/auth/client';
import Icons from '@workspace/ui/components/icons';
import Link from '@workspace/ui/components/link';
import { ComponentProps, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { ProviderId } from '@/lib/constants';
import { env } from '@workspace/env/server';
import { useForm } from 'react-hook-form';
import { loginForm } from '@/forms/index';
import { toast } from 'sonner';
import { z } from 'zod/v4';

export function LoginForm({
  className,
  redirectUrl = '/',
  ...props
}: ComponentProps<'div'> & { redirectUrl?: string }) {
  const [isLoading, setIsLoading] = useState({
    loading: false,
    provider: null as ProviderId | null,
  });
  const form = useForm<z.infer<typeof loginForm>>({
    resolver: zodResolver(loginForm),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signInWithProvider = async (providerId: ProviderId) => {
    if (env.NODE_ENV === 'production') {
      toast.error('This feature is not available in production');
      return;
    }

    await authClient.signIn.social(
      {
        provider: providerId,
        callbackURL: redirectUrl,
      },
      {
        onRequest: () => {
          setIsLoading({
            loading: true,
            provider: providerId,
          });
        },
        onError: (error) => {
          console.error(error);
          setIsLoading({
            loading: false,
            provider: null,
          });
        },
      },
    );
  };

  return (
    <div
      className={cn('z-10 flex w-full max-w-sm flex-col items-center gap-6', className)}
      {...props}
    >
      <Form {...form}>
        <form
          className="flex min-w-sm flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            return null;
          }}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <Input
                type="email"
                disabled
                placeholder="Email"
                className="border-border rounded-none border !bg-[#1D1D1D]/100 text-base placeholder:text-[#9f9f9f]"
                {...field}
              />
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <Input
                type="password"
                disabled
                placeholder="Password"
                className="border-border rounded-none border !bg-[#1D1D1D]/100 text-base placeholder:text-[#9f9f9f]"
                {...field}
              />
            )}
          />
          <Button type="submit" className="rounded-none text-base" disabled>
            Login
          </Button>

          <p className="text-sm text-[#9f9f9f]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="pointer-events-none py-2 font-medium text-white">
              Register
            </Link>
          </p>
        </form>
      </Form>

      <div className="flex w-full max-w-sm flex-row items-center gap-2">
        <Separator
          className="h-[2px] !w-[calc(50%-14px)] bg-[#2e2e2e]/100"
          orientation="horizontal"
        />
        <span className="text-sm text-[#9f9f9f]">or</span>
        <Separator
          className="h-[2px] !w-[calc(50%-14px)] bg-[#2e2e2e]/100"
          orientation="horizontal"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <Button
          type="button"
          className="border-border rounded-none border py-2 text-base transition-all"
          variant="outline"
          onClick={() => signInWithProvider('github')}
          disabled={isLoading.loading}
        >
          {isLoading.loading && isLoading.provider === 'github' ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <Icons.github className="h-4 w-4 fill-white" />
          )}
          Login with Github
        </Button>

        <Button
          type="button"
          className="border-border rounded-none border py-2 text-base transition-all"
          variant="outline"
          onClick={() => signInWithProvider('gitlab')}
          disabled={isLoading.loading}
        >
          {isLoading.loading && isLoading.provider === 'gitlab' ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <Icons.gitlab className="h-4 w-4 fill-white" />
          )}
          Login with Gitlab
        </Button>
      </div>
    </div>
  );
}
