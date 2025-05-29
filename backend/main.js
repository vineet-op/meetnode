const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const { auth } = require('google-auth-library');

// Updated scopes
const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/meetings.space.created'
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// Reuse existing auth functions
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return auth.fromJSON(credentials);
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) return client;

    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });

    if (client.credentials) await saveCredentials(client);
    return client;
}

/**
 * Create scheduled meeting
 * @param {OAuth2Client} authClient 
 * @param {Object} schedule - { title, startTime, endTime, attendees, timezone }
 */
async function createScheduledMeeting(authClient, schedule) {
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    const event = {
        summary: schedule.title,
        start: {
            dateTime: schedule.startTime,
            timeZone: schedule.timezone || 'UTC',
        },
        end: {
            dateTime: schedule.endTime,
            timeZone: schedule.timezone || 'UTC',
        },
        attendees: schedule.attendees.map(email => ({ email })),
        conferenceData: {
            createRequest: {
                requestId: Math.random().toString(36).substring(2, 15),
                conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
        }
    };

    const res = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all' // Send invites to attendees
    });

    return {
        meetUrl: res.data.hangoutLink,
        calendarEvent: res.data.htmlLink,
        eventId: res.data.id
    };
}

// Example usage
async function main() {
    try {
        const authClient = await authorize();

        const schedule = {
            title: 'Project Kickoff Meeting',
            startTime: '2025-06-15T14:00:00', // ISO format
            endTime: '2025-06-15T15:00:00',
            timezone: 'America/Los_Angeles',
            attendees: ['attendee1@example.com', 'attendee2@example.com']
        };

        const meeting = await createScheduledMeeting(authClient, schedule);
        console.log('Scheduled Meeting Created!');
        console.log(`Meet URL: ${meeting.meetUrl}`);
        console.log(`Calendar Event: ${meeting.calendarEvent}`);
    } catch (error) {
        console.error('Error creating meeting:', error.message);
    }
}

main();