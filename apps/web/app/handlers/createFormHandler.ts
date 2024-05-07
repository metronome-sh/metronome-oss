import { type Schema, z } from 'zod';

import { formatZodError } from './helpers';

export async function createFormHandler({ request }: { request: Request }) {
  let formData: FormData = new FormData();
  let formDataObject: Record<string, string> = {};

  const contentType = request.headers.get('content-type');
  const formHeaders = ['multipart/form-data', 'application/x-www-form-urlencoded'];

  if (
    ['post', 'put'].includes(request.method.toLowerCase()) &&
    formHeaders.some((header) => contentType?.includes(header))
  ) {
    try {
      formData = await request.clone().formData();
      formDataObject = Object.fromEntries(formData.entries()) as Record<string, string>;
    } catch (error) {
      formData = new FormData();
      formDataObject = {};
    }
  }

  function get(key: string): string | undefined {
    return formData.get(key) as string | undefined;
  }

  function getAll(key: string): string[] {
    return formData.getAll(key) as string[];
  }

  function validate<T, S extends Schema<T>>(schema: S): z.infer<S> {
    const result = schema.safeParse(formDataObject);

    if (!result.success) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new Response(`Invalid form data: ${JSON.stringify(formatZodError(result.error))}`, {
        status: 400,
      });
    }

    return result.data;
  }

  return { get, getAll, validate };
}
