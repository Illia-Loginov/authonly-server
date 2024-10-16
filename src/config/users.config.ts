export const userSchemaParams = {
  username: {
    min: 1,
    max: 32,
    regex: /^[a-zA-Z0-9._]*$/
  },
  password: {
    min: 1,
    max: 64,
    regex: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/
  }
};
