export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/; // Egyptian phone numbers
  return phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};