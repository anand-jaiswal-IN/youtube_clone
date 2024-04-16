function validateEmail(email) {
  email = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validatePassword(password) {
  password = password.trim();
  // Check for minimum length
  if (password.length < 8) {
    return false;
  }

  // Check for uppercase, lowercase, number, and special character
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;
  const specialCharacterRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  if (
    !uppercaseRegex.test(password) ||
    !lowercaseRegex.test(password) ||
    !numberRegex.test(password) ||
    !specialCharacterRegex.test(password)
  ) {
    return false;
  }

  // Password meets all criteria
  return true;
}
function isValidName(name) {
  const nameRegex = /^[a-zA-Z]{3,20}$/;
  return nameRegex.test(name);
}
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export { validateEmail, validatePassword, isValidName, isValidUsername };
