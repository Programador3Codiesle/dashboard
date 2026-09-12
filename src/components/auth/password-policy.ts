/** Misma regex que js/utils/updatePassword.js del legado. */
export const UPDATE_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

export function validarNuevaPassword(
  pass1: string,
  pass2: string,
  nit?: number,
): string | null {
  if (!pass1 || !pass2) {
    return 'No puedes dejar campos vacios';
  }
  if (pass1 !== pass2) {
    return 'Las contraseñas no coinciden';
  }
  if (pass1.length < 8) {
    return 'Las contraseña debe tener minimo 8 caracteres';
  }
  if (nit != null && pass1 === String(nit)) {
    return 'La contraseña no debe coincidir con tu número de identidad';
  }
  if (!UPDATE_PASSWORD_REGEX.test(pass1)) {
    return 'La contraseña debe tener al menos una letra mayuscula, una minuscula, un numero y un caracter especial';
  }
  return null;
}
