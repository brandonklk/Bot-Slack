import Data from './data' 
import { RTMClient }  from '@slack/rtm-api'
import { WebClient } from '@slack/web-api';
import { SLACK_OAUTH_TOKEN, BOT_SPAM_CHANNEL } from './constants'

const rtm = new RTMClient(SLACK_OAUTH_TOKEN);
const web = new WebClient(SLACK_OAUTH_TOKEN);

const Slack = (Data) => {
    const init = () => {

        rtm.start().catch(console.error);

        rtm.on('ready', async () => {            
            console.log('[X] Bot Slack init...')
            // sendMessage(BOT_SPAM_CHANNEL, `Bot de datas online.`)
        })

        rtm.on('slack_event', async (eventType, event) => {
            if (event && event.type === 'message') {
                runEvent(event)
            }
        })
    }

    const runEvent = (event) => {
        const {channel ,text, user} = event;

        
        if (text.trim().includes('!')) {
            // sendMessage(channel, `Olá <@${user}>`)
            if (text.trim().includes('list')) {
                Data.getEventos().forEach(evento => {
                    const string_event = `${evento.data} [${evento.startTime}-${evento.endTime}] - ${evento.description}`
                    sendMessage(channel, string_event)
                });
            }

        }
    }

    async function sendMessage (channel, text) {
        // console.log('@@sendMessage')
        // console.log('channel', channel)
        // console.log('message',text)
        await web.chat.postMessage({channel, text})
    }
    return {init, runEvent, sendMessage}
}

export default Slack