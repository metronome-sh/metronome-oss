import { ZodError } from 'zod';

export function prettyPrintZodError(error: ZodError): void {
  const errorMessages = error.errors
    .map((err, index) => `${index + 1}. Field: ${err.path.join('.')} - ${err.message}`)
    .join('\n');

  console.log('Validation errors:\n' + errorMessages);
}
