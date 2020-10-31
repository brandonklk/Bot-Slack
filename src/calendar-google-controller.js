import { resolve } from 'url';

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const packageJson = require('../package.json');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';

const Calendar = (Data) => {
    
    const init = async ()  => {
        console.log('[X] Calendar iniciado')
    

        await fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
            authorize(JSON.parse(content), listEvents);
        });
        
        function authorize(credentials, callback) {
            const {client_secret, client_id, redirect_uris} = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2( client_id, client_secret, redirect_uris[0]);

            fs.readFile(TOKEN_PATH, (err, token) => {
              if (err) return getAccessToken(oAuth2Client, callback);
              oAuth2Client.setCredentials(JSON.parse(token));
              callback(oAuth2Client);
            });
        }

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
            // console.log('events:', events)

            if (events.length) {
                Data.setEventos(parseEventsGoogleFormSlack(events))
                // return {
                //     msg: 'Eventos encotrados',
                //     length: events.length,
                //     events,
                // }
            } else {
                console.log('No upcoming events found.');
                console.log('Nenhum evento futuro encontrado.');
                
                // return {
                //     msg: 'Nenhum evento futuro encontrado.'
                // }
            }

        });
    }
    
    function createEvent(data={}) {
        console.log('createEvent')
        console.log('data', data)
    }

    function parseEventsGoogleFormSlack (list) {

        const formatDate = (date) => {
          const d = date.getDate() < 10 ? `0${date.getDate()*1}`: date.getDate()*1
          const m = date.getMonth()+1 < 10 ? `0${date.getMonth()+1}`: date.getMonth()+1
          const y = date.getFullYear()
          
          return `${d}/${m}/${y}`
        }
      
        const formatHour = (date) => {
          const re = /\d\d:\d\d/gmi
          const hour = date.match(re)[0]
      
          return hour
        }
        
        const listParsed = list.map(e => {
        const data = formatDate(new Date(e.start.dateTime))
        const startTime = formatHour(e.start.dateTime)
        const endTime = formatHour(e.end.dateTime)
    
        return {
            startTime,
            endTime,
            data,
            description: e.summary
        }
        })
    
        return listParsed
    }

    return {
        init,
        listEvents,
        parseEventsGoogleFormSlack
    }
}


export default Calendar