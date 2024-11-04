export const toCapitalized = <InputString extends string>(
  input: InputString
): Capitalize<InputString> =>
  (input.charAt(0).toUpperCase() + input.slice(1)) as Capitalize<InputString>;
