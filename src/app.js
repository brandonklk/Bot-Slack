
import Data from './data'
import Slack from './slack-controller'
import Calendar from './calendar-google-controller'

const data = Data()

const calendar_google_controller = Calendar(data)
const slack_controller = Slack(data)

calendar_google_controller.init().then(slack_controller.init)
