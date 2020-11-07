import { RTMClient }  from '@slack/rtm-api'
import { SLACK_OAUTH_TOKEN, BOT_SPAM_CHANNEL } from './constants'
import  { WebClient } from '@slack/web-api';
import { getEventOfGoogleCalendar } from './formatUtils';

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const rtm = new RTMClient(SLACK_OAUTH_TOKEN);
const web = new WebClient(SLACK_OAUTH_TOKEN);

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';
let EVENTS_OF_CALENDAR = []
const EVENTS_NOT_FOUND = "Nenhum evento encontrado."

// {
//   kind: 'calendar#event',
//   etag: '"3206814414336000"',
//   id: '17cpmtntbeugg9pcji3lmdn61h',
//   status: 'confirmed',
//   htmlLink: 'https://www.google.com/calendar/event?eid=MTdjcG10bnRiZXVnZzlwY2ppM2xtZG42MWggZGF5YW4uZnJlaXRhc0BjYXRvbGljYXNjLm9yZy5icg',
//   created: '2020-10-22T22:53:27.000Z',
//   updated: '2020-10-22T22:53:27.168Z',
//   summary: 'Teste',
//   creator: { email: 'dayan.freitas@catolicasc.org.br', self: true },
//   organizer: { email: 'dayan.freitas@catolicasc.org.br', self: true },
//   start: { dateTime: '2020-10-22T19:30:00-03:00' },
//   end: { dateTime: '2020-10-22T20:30:00-03:00' },
//   iCalUID: '17cpmtntbeugg9pcji3lmdn61h@google.com',
//   sequence: 0,
//   reminders: { useDefault: true }
// }

rtm.start()
  .catch(console.error);

rtm.on('ready', async () => {
    console.log('bot started')
    sendMessage(BOT_SPAM_CHANNEL, `Bot de datas online.`)
})

rtm.on('slack_event', async (eventType, event) => {
  if (event && event.type === 'message'){
    const {channel ,text, user} = event;

    if (text.trim().includes('!list')) {
      const listOfEventsCalendar = await getEventOfGoogleCalendar(EVENTS_OF_CALENDAR)

      if(listOfEventsCalendar.length <= 0) {
        sendMessage(channel, EVENTS_NOT_FOUND)
      } else {
        listOfEventsCalendar.forEach(evento => {
          const string_event = `${evento.data} [${evento.startTime}-${evento.endTime}] - ${evento.description}`
          sendMessage(channel, string_event)  
        });
      }
    }

    if(text.trim().includes('!a-list')) {
      const listOfEventsCalendarOfBirthday = await getEventOfGoogleCalendar(EVENTS_OF_CALENDAR);

      if(listOfEventsCalendarOfBirthday.length <= 0) {
        sendMessage(channel, EVENTS_NOT_FOUND)
      } else {
        listOfEventsCalendarOfBirthday.forEach(events => {
          if(events.location != undefined) {
            const eventInBirthday = `Olá <@${user}>, aniversário dia ${events.data} [${events.startTime}-${events.endTime}] - ${events.description} - ${events.location}`
            sendMessage(channel, eventInBirthday)  
          }
        });
      }
    }
  }
})

async function sendMessage(channel, message) {
  console.log(message)
    await web.chat.postMessage({
        channel: channel,
        text: message,
    })
}


fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listEvents);
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    EVENTS_OF_CALENDAR = events

    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        var start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}