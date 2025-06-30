import { project as projectSchema, projectProviderEnum } from '@workspace/db/schema';
import ProjectTicks from '@/components/project/project-ticks';
import { Star, GitFork, Clock } from 'lucide-react';
import Link from '@workspace/ui/components/link';
import { useQuery } from '@tanstack/react-query';
import NumberFlow from '@number-flow/react';
import { useTRPC } from '@/hooks/use-trpc';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import { ProjectReport } from '@/components/project/project-report';

type Project = typeof projectSchema.$inferSelect;

const isValidProvider = (
  provider: string | null,
): provider is (typeof projectProviderEnum.enumValues)[number] => {
  return provider === 'github' || provider === 'gitlab';
};

export default function ProjectCard({ project }: { project: Project }) {
  const trpc = useTRPC();
  const { data: repo, isError } = useQuery({
    ...trpc.repository.getRepo.queryOptions({
      url: project.gitRepoUrl,
      provider: project.gitHost as (typeof projectProviderEnum.enumValues)[number],
    }),
    enabled: !!project.gitRepoUrl && isValidProvider(project.gitHost),
    staleTime: 1000 * 60 * 60 * 24,
  });

  if (isError) return <div>Error</div>;

  return (
    <div className="group/project relative border border-neutral-800 bg-neutral-900/50 p-3 transition-all hover:border-neutral-700 md:p-4">
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover/project:opacity-100">
        <ProjectReport projectId={project.id} projectName={project.name} />
      </div>
      <Link
        href={`/projects/${project.id}`}
        event="project_card_link_clicked"
        eventObject={{ projectId: project.id }}
      >
        <span className="sr-only">View {project.name}</span>
        <div className="mb-3 flex items-start gap-3">
          {(repo && repo?.owner && repo?.owner?.avatar_url) ||
          (repo?.namespace && repo?.namespace?.avatar_url) ? (
            <Image
              src={repo?.owner?.avatar_url || `https://gitlab.com${repo?.namespace?.avatar_url}`}
              alt={project.name ?? 'Project Logo'}
              width={256}
              height={256}
              className="h-10 w-10 flex-shrink-0 rounded-full md:h-12 md:w-12"
            />
          ) : (
            <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-md bg-neutral-800 md:h-12 md:w-12" />
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-white md:text-base">
                {project.name}
              </h3>
              <ProjectTicks project={project} />
            </div>
            <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-neutral-400 md:text-sm">
              {project.description}
            </p>
            {(project.isLookingForContributors || project.hasBeenAcquired) && (
              <div className="flex flex-wrap gap-1 md:gap-1.5">
                {project.isLookingForContributors && (
                  <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-400 md:px-2">
                    Open to contributors
                  </span>
                )}
                {project.hasBeenAcquired && (
                  <span className="rounded-md bg-yellow-500/10 px-1.5 py-0.5 text-xs font-medium text-yellow-400 md:px-2">
                    Acquired
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs md:gap-4 md:text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-neutral-500 md:h-3.5 md:w-3.5" />
            <span className="text-neutral-300">
              <NumberFlow value={repo?.stargazers_count || repo?.star_count || 0} />
            </span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-3 w-3 text-neutral-500 md:h-3.5 md:w-3.5" />
            <span className="text-neutral-300">
              <NumberFlow value={repo?.forks_count || 0} />
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-neutral-500 md:h-3.5 md:w-3.5" />
            <span className="text-neutral-300">
              {repo?.created_at ? formatDate(new Date(repo.created_at)) : 'N/A'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
