import { zodResolver } from '@hookform/resolvers/zod';
import { users } from '@metronome/db';
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, Brand, Button, Card, Container, Form, Icon, Input } from '#app/components';
import { handle } from '#app/handlers/handle';

export const AuthenticationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function action({ request }: ActionFunctionArgs) {
  const { auth } = await handle(request);

  await auth.attempt('form', {
    success: '/authentication/success',
    failure: '/authentication/grant',
  });

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { auth } = await handle(request);

  if (!(await users.atLeastOneExists())) {
    throw redirect('/authentication/create');
  }

  const user = await auth.user({ required: false });

  if (user) {
    const { usersToTeams } = user;
    const teamSlug = usersToTeams[0].team.slug;

    if (!teamSlug) throw new Error('Team slug not found');

    throw redirect(`/${teamSlug}`);
  }

  const error = await auth.error();

  return json({ error });
}

export default function Component() {
  const { error } = useLoaderData<typeof loader>();

  const form = useForm<z.infer<typeof AuthenticationSchema>>({
    resolver: zodResolver(AuthenticationSchema),
    defaultValues: {},
  });

  const fetcher = useFetcher<{ error: boolean }>();

  const handleSubmit = useCallback(
    (data: z.infer<typeof AuthenticationSchema>) => {
      fetcher.submit(data, { method: 'post', action: '/authentication/grant' });
    },
    [fetcher],
  );

  return (
    <Container className="flex flex-col items-center justify-center gap-8">
      <Form.Provider {...form}>
        <form
          className="w-full flex flex-col items-center gap-8"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <Brand className="h-9" />
          <Card className="w-full max-w-90">
            <Card.Header className="space-y-1">
              <Card.Title className="text-lg">Authenticate</Card.Title>
              <Card.Description>Log in to your instance.</Card.Description>
            </Card.Header>
            <Card.Content className="grid gap-4">
              <Form.Field
                name="email"
                render={({ field }) => (
                  <Form.Item className="grid gap-1">
                    <Form.Label>Email</Form.Label>
                    <Input {...field} />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="password"
                render={({ field }) => (
                  <Form.Item className="grid gap-1">
                    <Form.Label>Password</Form.Label>
                    <Input type="password" {...field} />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Card.Content>
            <Card.Footer>
              <Button className="w-full" type="submit">
                Log in
              </Button>
            </Card.Footer>
          </Card>
          {error ? (
            <Alert className="max-w-90 text-red-500">
              <Icon.AlertSquareRoundedOutline className="stroke-red-500" />
              <Alert.Title>Invalid email or password</Alert.Title>
              <Alert.Description>Please try again.</Alert.Description>
            </Alert>
          ) : null}
        </form>
      </Form.Provider>
    </Container>
  );
}
