export const getValueFromFormData = (
  formData1: FormData,
  name: string,
  allowEmpty: boolean = false
) => {
  const value = formData1.get(name)?.toString();
  if (!value) {
    if (value === null || !allowEmpty) {
      throw new Error(`${name} is required`);
    } else {
      return "";
    }
  } else {
    return value;
  }
};
