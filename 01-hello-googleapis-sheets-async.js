/**
 * @license
 * Copyright Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// [START sheets_quickstart]
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const util = require('util');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
const readFileAsync = util.promisify(fs.readFile);

readFileAsync('credentials.json')
    .then(content => {
        // Authorize a client with credentials, then call the Google Sheets API.
        console.log('content', JSON.parse(content));
        // authorize(JSON.parse(content), listMajors);
        authorizeAsync(JSON.parse(content), listMajors);
    })
    .catch(err => {
        return console.log('Error loading client secret file:', err);
    })

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorizeAsync(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    readFileAsync(TOKEN_PATH)
        .then(token => {
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        })
        .catch(err => {
            return getNewToken(oAuth2Client, callback);
        })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const fs_writeFileAsync = util.promisify(fs.writeFile);

    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs_writeFileAsync(TOKEN_PATH, JSON.stringify(token))
                .then(() => {
                    console.log('Token stored to', TOKEN_PATH);
                })
                .catch(err => {
                    console.error(err);
                });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1apRDff_DTfD0yAmNtzuTZMioer/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });

    const getAsync = util.promisify(sheets.spreadsheets.values.get);

    getAsync({
        spreadsheetId: '1apRDff_DTfD0yAmNtzuTZMioer-PK5is200epqLrjnY',
        range: 'Base Data!A2:R',
    })
        .then(res => {
            const rows = res.data.values;
            if (rows.length) {
                console.log(JSON.stringify(rows));
            } else {
                console.log('No data found.');
            }
        })
        .catch(err => {
            return console.log('The API returned an error: ' + err);
        })

}
// [END sheets_quickstart]
