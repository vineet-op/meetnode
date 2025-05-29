require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const { auth } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/meetings.space.created'
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

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

// Modified meeting creation function
async function createMeeting() {
    try {
        const authClient = await authorize();
        const meetClient = new SpacesServiceClient({ authClient });
        const [response] = await meetClient.createSpace({});
        return response.meetingUri;
    } catch (error) {
        console.error('Meeting creation failed:', error);
        throw new Error('Failed to create meeting space');
    }
}

app.post('/api/schedule-meeting', async (req, res) => {
    try {
        const authClient = await authorize();
        const schedule = req.body;

        // Validate input
        if (!schedule.title || !schedule.startTime || !schedule.endTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

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
            attendees: (schedule.attendees || []).map(email => ({ email })),
            conferenceData: {
                createRequest: {
                    requestId: Math.random().toString(36).substring(2, 15),
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            }
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: schedule.sendInvites ? 'all' : 'none'
        });

        res.json({
            meetUrl: response.data.hangoutLink,
            calendarEvent: response.data.htmlLink,
            eventId: response.data.id,
            startTime: response.data.start.dateTime,
            endTime: response.data.end.dateTime
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

app.post('/api/instant-meet', async (req, res) => {
    try {
        const meetUrl = await createMeeting();
        res.json({
            success: true,
            meetUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});