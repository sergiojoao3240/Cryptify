export function isUpdateValid (input: any, allowedUpdates: string[]) {
    var valuesToUpt = Object.keys(input);

    /* Checks the sub-level for address if it exists */
    if(valuesToUpt.includes("address")) {
        valuesToUpt.splice(valuesToUpt.indexOf("address"), 1);
        Object.keys(input["address"]).forEach(element => valuesToUpt.push(element));
    }

    /* Checks the sub-level for location if it exists */
    if(valuesToUpt.includes("location")) {
        valuesToUpt.splice(valuesToUpt.indexOf("location"), 1);
        Object.keys(input["location"]).forEach(element => valuesToUpt.push(element));
    }

    /* Checks if the input values are the ones expected by server */
    if( valuesToUpt.every( update => allowedUpdates.includes(update) ) ) { 
        return true;
    }

    return false;
}