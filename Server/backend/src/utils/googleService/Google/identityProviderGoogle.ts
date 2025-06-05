//_____________IMPORTS____________
// Google API Module
import {google} from "googleapis";
//_____________IMPORTS____________

const people = google.people('v1');


/* Configuration of GOOGLE as Access Token provider
 * Copyright 2012 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
*/

/**
 * Create a new OAuth2 client with the configured keys.
*/

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID, /* Client ID */
    process.env.GOOGLE_CLIENT_SECRET, /* Client Secret */
    process.env.GOOGLE_AUTH_REDIRECT /* Callback route */
);

/**
 * This is one of the many ways you can configure googleapis to use authentication credentials. 
 * In this method, we're setting a global reference for all APIs.  Any other API you use here, 
 * like google.drive('v3'), will now use this auth client. You can also override the auth client 
 * at the service and method call levels.
*/
google.options({auth: oauth2Client});
export default oauth2Client;