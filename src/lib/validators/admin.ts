// src/lib/validators/admin.ts
export const validateSAPhone = (phone: string): boolean => {
  // Saudi phone numbers: 9665XXXXXXXX (12 digits total)
  const saudiPhoneRegex = /^9665\d{8}$/;
  return saudiPhoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !email || emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  if (!password) return true; // Password is optional
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const getPhoneErrorMessage = (phone: string): string | null => {
  if (!phone) return "Phone number is required";
  if (!phone.startsWith("966")) return "Phone number must start with 966";
  if (phone.length !== 12) return "Phone number must be 12 digits (966 + 9 digits)";
  if (!validateSAPhone(phone)) return "Invalid Saudi phone number format";
  return null;
};

export const getEmailErrorMessage = (email: string): string | null => {
  if (email && !validateEmail(email)) return "Invalid email format";
  return null;
};

export const getPasswordErrorMessage = (password: string): string | null => {
  if (password && !validatePassword(password)) {
    return "Password must be at least 8 characters with uppercase, lowercase and number";
  }
  return null;
};