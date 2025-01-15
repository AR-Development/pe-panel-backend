import generator from "generate-password";

export const generateRandomPassword = (length: 12) => {
  return generator.generate({
    length: length,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  });
};
