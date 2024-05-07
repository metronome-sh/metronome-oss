import { Project } from '@metronome/db';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { PopoverProps } from '@radix-ui/react-popover';
import { SerializeFrom } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';

import { Avatar, Button, Command, Dialog, Icon, Popover } from '#app/components';
import { cn } from '#app/components/utils';

import { useTeamLoaderData } from '../../hooks';
import { useTeamProjectLoaderData } from '../../routes/projects/hooks';
import { NewProjectDialog } from './components';

export const ProjectSelector: FunctionComponent<PopoverProps> = (props) => {
  const [open, setOpen] = useState(false);

  const { projects } = useTeamLoaderData();

  const { project } = useTeamProjectLoaderData();

  const { team } = useTeamLoaderData();

  const navigate = useNavigate();

  const handleSelectProject = useCallback(
    (projectSlug: string) => {
      navigate(`/${team.slug}/${projectSlug}/overview`);
      setOpen(false);
    },
    [navigate, team.slug],
  );

  const projectsMap = useMemo(() => {
    return projects.reduce(
      (acc, obj) => acc.set(obj.id.toLowerCase(), obj),
      new Map<string, SerializeFrom<Project>>(),
    );
  }, [projects]);

  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

  return (
    <NewProjectDialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
      <Popover open={open} onOpenChange={setOpen} {...props}>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-label="Select project..."
            aria-expanded={open}
            className="flex-1 justify-between max-w-64 sm:max-w-[200px] lg:max-w-[300px] px-2"
          >
            <span className="pr-2">
              <Avatar className="w-4 h-4 rounded-none">
                <Avatar.Image
                  src={`/resources/favicon?url=${project.url ?? 'https://remix.run'}`}
                  alt={project.name ?? 'Project avatar'}
                />
                <Avatar.Fallback className="uppercase text-[10px] font-semibold group-hover:bg-muted-foreground/40">
                  {project.name?.at(0)}
                </Avatar.Fallback>
              </Avatar>
            </span>
            <span className="truncate">{project.name}</span>
            <CaretSortIcon className="md:ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-[300px] p-0 ml-21">
          <Command
            filter={(value, search) => {
              const name = (projectsMap.get(value)?.name ?? '').toLowerCase();
              return name.includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <Command.Input />
            <Command.List>
              <Command.Empty>No projects found.</Command.Empty>
              <Command.Group heading="Projects">
                {projects.map((p) => (
                  <Command.Item
                    key={p.id}
                    value={p.id}
                    className="group hover:bg-muted-foreground/20"
                    onSelect={() => handleSelectProject(p.slug!)}
                  >
                    <span className="pr-2">
                      <Avatar className="w-4 h-4 rounded-none">
                        <Avatar.Image
                          src={`/resources/favicon?url=${p.url ?? 'https://remix.run'}`}
                          alt={p.name ?? 'Project avatar'}
                        />
                        <Avatar.Fallback className="uppercase text-[10px] font-semibold group-hover:bg-muted-foreground/40">
                          {p.name?.at(0)}
                        </Avatar.Fallback>
                      </Avatar>
                    </span>
                    <span>{p.name}</span>
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        project?.id === p.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Separator />
              <Command.Group>
                <Dialog.Trigger asChild>
                  <Command.Item
                    className="space-x-2"
                    onSelect={() => {
                      setOpen(false);
                      setShowNewProjectDialog(true);
                    }}
                  >
                    <Icon.SquareRoundedPlus className="w-5 h-5 stroke-teal-600" />
                    <span>Create Project</span>
                  </Command.Item>
                </Dialog.Trigger>
              </Command.Group>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover>
    </NewProjectDialog>
  );
};
