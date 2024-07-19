import type { ZodError } from 'zod';

const getIssueKey = (path: (string | number)[]) => {
  if (path.length === 0) {
    return '';
  }

  let key = path[0]!.toString();

  if (path.length > 1) {
    key += '[' + path.slice(1).join('][') + ']';
  }

  return key;
};

export const formatZodError = (error: ZodError) => {
  const formattedIssues: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = getIssueKey(issue.path);

    if (!formattedIssues[key]) {
      formattedIssues[key] = [issue.message];
    } else {
      formattedIssues[key].push(issue.message);
    }
  }

  return formattedIssues;
};
