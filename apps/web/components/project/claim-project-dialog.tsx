'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Loader2, Shield, AlertCircle, CheckCircle, Github } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DebugGitHubPermissions } from './debug-permissions';
import { Button } from '@workspace/ui/components/button';
import Link from '@workspace/ui/components/link';
import { useTRPC } from '@/hooks/use-trpc';
import { useState } from 'react';
import { toast } from 'sonner';

export function ClaimProjectDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: claimStatus } = useQuery(trpc.projects.canClaimProject.queryOptions({ projectId }));

  const {
    mutate: claimProject,
    isPending,
    error,
  } = useMutation(
    trpc.projects.claimProject.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`Project claimed successfully as ${data.ownershipType}!`);
        setOpen(false);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...trpc.projects.getProject.queryKey({ id: projectId })],
          }),
          queryClient.invalidateQueries({
            queryKey: [...trpc.projects.canClaimProject.queryKey({ projectId })],
          }),
        ]);
        // refetchRepoData();
      },
      onError: (err) => {
        console.error('Claim error:', err);
      },
    }),
  );

  const handleClaim = () => {
    claimProject({ projectId });
  };

  if (!claimStatus?.canClaim) {
    if (claimStatus?.needsGitHubAuth) {
      return (
        <Button variant="default" size="sm" className="gap-2" asChild>
          <Link href="/login" event="claim_project_dialog_connect_github_button_clicked">
            <Github className="h-4 w-4" />
            Connect GitHub to Claim
          </Link>
        </Button>
      );
    }
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-none">
          <Shield className="h-4 w-4" />
          Claim Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle>Claim Project Ownership</DialogTitle>
          <DialogDescription>
            Verify that you own {claimStatus.projectName} to manage this project listing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="rounded-none">
            <Github className="h-4 w-4" />
            <AlertTitle>Repository</AlertTitle>
            <AlertDescription>
              <code className="bg-muted rounded-none px-1 py-0.5 font-mono text-sm">
                {claimStatus.gitRepoUrl}
              </code>
            </AlertDescription>
          </Alert>

          <Alert className="rounded-none">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ownership Requirements</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>To claim this project, you must be:</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>The repository owner (for personal repos)</li>
                <li>An organization owner (for org repos)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {error && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
              {claimStatus.gitRepoUrl && (
                <DebugGitHubPermissions repoUrl={claimStatus.gitRepoUrl} />
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-none"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button className="rounded-none" onClick={handleClaim} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying Ownership...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify & Claim
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
