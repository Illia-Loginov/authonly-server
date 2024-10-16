import { strict as assert } from 'node:assert';
import { ZodError, type ZodIssue } from 'zod';

export const assertZodError =
  (expectedIssues: ZodIssue[]) => (error: Error) => {
    assert.ok(error instanceof ZodError);
    const { issues } = error;

    for (let i = 0; i < expectedIssues.length; i++) {
      assert.deepEqual(issues?.[i], expectedIssues[i]);
    }

    return true;
  };
