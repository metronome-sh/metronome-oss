import { zodResolver } from '@hookform/resolvers/zod';
import { useFetcher, useParams } from '@remix-run/react';
import { type FunctionComponent, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Form, Input } from '#app/components';

import { useTeamProjectLoaderData } from '../../../../hooks';
import {
  createProjectSchema,
  type CreateProjectSchemaType,
} from '../../../../../../schemas/_createProjectSchema';

export const GeneralSettingsForm: FunctionComponent = () => {
  const { project } = useTeamProjectLoaderData();

  const { teamSlug, projectSlug } = useParams();

  const form = useForm<CreateProjectSchemaType>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: project.name,
      url: project.url ?? '',
    },
    mode: 'onSubmit',
  });

  // We use this when the data gets revalidated by remix
  // Probably we need to find a better way to do this in a Remixy way
  useEffect(() => {
    form.reset({ name: project.name, url: project.url ?? '' });
  }, [project, form]);

  const fetcher = useFetcher();

  const onSubmit = useCallback(
    (data: CreateProjectSchemaType) => {
      fetcher.submit(data, {
        method: 'POST',
        action: `/${teamSlug}/${projectSlug}/settings?index&intent=general`,
      });
    },
    [fetcher, projectSlug, teamSlug],
  );

  const isDirty = Object.values(form.formState.dirtyFields).length > 0;

  return (
    <div className="mt-4">
      <Form.Provider {...form}>
        <Form.Section title="General" description="Basic project information." />

        <div className="mb-6">
          <Form.Label>Project Id</Form.Label>
          <Input className="mt-2" autoComplete="off" disabled defaultValue={project.id} />
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Project Name</Form.Label>
                <Form.Control>
                  <Input {...field} autoComplete="off" placeholder="Awesome Project" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="url"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Project URL</Form.Label>
                <Form.Control>
                  <Input {...field} autoComplete="off" placeholder="https://metronome.sh" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <div className="text-right">
            <Button className="w-20" type="submit" disabled={!isDirty}>
              Update
            </Button>
          </div>
        </form>
      </Form.Provider>
    </div>
  );
};
