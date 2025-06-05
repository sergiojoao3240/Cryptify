/* @desc    Generates random Token String */
export function randomString (length: number, urlValid: boolean = false) {
    /* Check if value provided is a number. If not, return an empty string */
    if( isNaN(length) ) {
        return '';
    }

    /* Validates if random strings values must be URL-acceptable or not.
     * URL acceptable do not contain: #£$§%&=?+-.:_^~
     */
    const randomChars = urlValid ? 'uoi65AkLYHKn7Sd3m2sqWFct1TJfvaGrPbCQBUpewgDyZ0hjINlOERxXz89VM4' : 'uoi65~AkL?Y-HKn7Sd3§m2s^qW_Fct1TJfva+G£rPbCQ#:.BUpewgDyZ0hj&I%NlOERxXz89$=VM4'; 

    /* Generate the string with the desired length */
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}