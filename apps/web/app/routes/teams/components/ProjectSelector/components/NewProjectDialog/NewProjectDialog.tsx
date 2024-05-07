import { zodResolver } from '@hookform/resolvers/zod';
import { useFetcher, useNavigation, useParams } from '@remix-run/react';
import { type FunctionComponent, type PropsWithChildren } from 'react';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Dialog, Form, Input } from '#app/components';

import {
  createProjectSchema,
  CreateProjectSchemaType,
} from '../../../../schemas/_createProjectSchema';

export type NewProjectDialogProps = PropsWithChildren<{
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export const NewProjectDialog: FunctionComponent<NewProjectDialogProps> = ({
  onOpenChange,
  open,
  children,
}) => {
  const form = useForm<CreateProjectSchemaType>({
    resolver: zodResolver(createProjectSchema),
    resetOptions: {
      keepErrors: false,
      keepDefaultValues: true,
      keepDirtyValues: false,
    },
    defaultValues: {
      name: '',
      url: '',
    },
    mode: 'onSubmit',
  });

  const fetcher = useFetcher();

  // const state = useFetcherState(fetcher);

  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === 'loading') {
      onOpenChange?.(false);
    }
  }, [navigation, onOpenChange]);

  const { teamSlug } = useParams();

  const handleSubmit = useCallback(
    (data: CreateProjectSchemaType) => {
      fetcher.submit(data, { method: 'POST', action: `/${teamSlug}/create` });
    },
    [fetcher, teamSlug],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextState) => {
        // if (state === 'loading') return;

        onOpenChange?.(nextState);
        if (!nextState) form.reset();
      }}
    >
      {children}
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>New Project</Dialog.Title>
          <Dialog.Description>Add a new project to track its performance.</Dialog.Description>
        </Dialog.Header>
        <Form.Provider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="Awesome Project"
                      // disabled={state === 'loading'}
                    />
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
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="https://metronome.sh"
                      // disabled={state === 'loading'}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Dialog.Footer>
              {onOpenChange ? (
                <Button
                  variant="outline"
                  type="button"
                  // disabled={state === 'loading'}
                  onClick={() => {
                    // if (state === 'loading') return;
                    onOpenChange?.(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                className="w-20"
                type="submit"
                // disabled={state === 'loading'}
              >
                Create
                {/* <Loadable state={state}>Create</Loadable> */}
              </Button>
            </Dialog.Footer>
          </form>
        </Form.Provider>
      </Dialog.Content>
    </Dialog>
  );
};
