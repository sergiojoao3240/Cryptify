export function isUpdateValid (input: any, allowedUpdates: string[]) {
    let valuesToUpt = Object.keys(input);

    /* Checks if the input values are the ones expected by server */
    if( valuesToUpt.every( update => allowedUpdates.includes(update) ) ) { 
        return true;
    }

    return false;
}