interface PasswordOptions {
    length?: number
    includeLower?: boolean | string;
    includeUpper?: boolean | string;
    includeNumber?: boolean | string;
    includeSymbols?: boolean | string;
  }
  
export function generatePasswordFromQuery(query: PasswordOptions): string {
    const length = Number(query.length) || 12;
    const includeLower = query.includeLower === "true" || query.includeLower === true;
    const includeUpper = query.includeUpper === "true" || query.includeUpper === true;
    const includeNumber = query.includeNumber === "true" || query.includeNumber === true;
    const includeSymbols = query.includeSymbols === "true" || query.includeSymbols === true;
  
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!#$%&/().-?@";
  
    let charset = "";
    if (includeLower) charset += lowercase;
    if (includeUpper) charset += uppercase;
    if (includeNumber) charset += numbers;
    if (includeSymbols) charset += symbols;
  
    if (!charset) {
      throw new Error("No valid character types selected for password generation.");
    }
  
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomChar = charset.charAt(Math.floor(Math.random() * charset.length));
      password += randomChar;
    }
  
    return password;
}
  