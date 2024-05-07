import { zodResolver } from '@hookform/resolvers/zod';
import { teams, users } from '@metronome/db';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Brand, Button, Card, Container, Form, Input } from '#app/components';
import { handle } from '#app/handlers/handle';

export const CreateUserSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function action({ request }: ActionFunctionArgs) {
  if (await users.atLeastOneExists()) {
    throw redirect('/authentication/grant');
  }

  const { form } = await handle(request);

  const { name, email, password } = form.validate(CreateUserSchema);

  const user = await users.insert({
    name,
    email,
    password,
    strategy: 'form',
  });

  const team = await teams.insert({ createdBy: user.id });

  await users.addToTeam({ userId: user.id, teamId: team.id });

  return null;
}

export async function loader() {
  if (await users.atLeastOneExists()) {
    throw redirect('/authentication/grant');
  }

  return null;
}

export default function Component() {
  const form = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
  });

  const submit = useSubmit();

  const handleSubmit = useCallback(
    (data: z.infer<typeof CreateUserSchema>) => {
      submit(data, { method: 'post', action: '/authentication/create' });
    },
    [submit],
  );

  return (
    <Container className="flex items-center justify-center gap-8">
      <Brand className="h-9" />
      <Card className="w-full max-w-md">
        <Form.Provider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-8">
            <Card.Header className="space-y-1">
              <Card.Title className="text-lg">Welcome to Metronome</Card.Title>
              <Card.Description>Create your instance user to get started.</Card.Description>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4 w-full">
              <Form.Field
                name="name"
                render={({ field }) => (
                  <Form.Item className="grid gap-1">
                    <Form.Label>Name</Form.Label>
                    <Input {...field} />
                    <Form.Message />
                  </Form.Item>
                )}
              />
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
              <Form.Field
                name="confirmPassword"
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
                Create User
              </Button>
            </Card.Footer>
          </form>
        </Form.Provider>
      </Card>
    </Container>
  );
}
