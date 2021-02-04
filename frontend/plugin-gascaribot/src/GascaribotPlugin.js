import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import ListOfWords from './components/CRModified/ListOfWords';
import CannedResponses from './components/CannedResponses/CannedResponses';
import CanvasHeader from './components/CanvasHeader';
import UploadFiles from './components/UploadFiles';
import reducers, { namespace } from './states';
import axios from 'axios';

const PLUGIN_NAME = 'GascaribotPlugin';

var channelV = null;
export default class GascaribotPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  init(flex, manager) {
    this.registerReducers(manager);
    flex.TaskCanvasHeader.Content.add(<CanvasHeader key='canvasHeaderComponent'/>);
    flex.AgentDesktopView.Panel2.Content.add(<ListOfWords key='custom-crm' />);
    flex.MessageInput.Content.add(<CannedResponses key='canned-responses' />);
    flex.MessageInput.Content.add(<UploadFiles key='PasteFileComponent' />);
    flex.AgentDesktopView.Panel2.Content.remove('container');

    //INSTANCES
    flex.Manager.getInstance().workerClient.on('reservationCreated', () => {
      // flex.Actions.invokeAction("AcceptTask", { sid: reservation.sid });
      // flex.Actions.invokeAction("SelectTask", { sid: reservation.sid });
      flex.AudioPlayerManager.play({
        url:
          'https://codeskulptor-demos.commondatastorage.googleapis.com/descent/gotitem.mp3',
        repeatable: false,
      });
    });

    flex.Manager.getInstance().chatClient.on('messageAdded', (payload) => {
      let author = `client:${payload.author}`;
      if (author != manager.workerClient.attributes.contact_uri) {
        flex.AudioPlayerManager.play({
          url:
            'https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3',
          repeatable: false,
        });
      }
    });

    flex.Manager.getInstance().chatClient.on('channelJoined', (payload) => {
      console.log('Entra al channelJoined');
      let body = `Hola mi nombre es ${manager.workerClient.attributes.full_name} es para mi un gusto atenderte💙,
     ¿En que te puedo colaborar?😁`;

      channelV = payload.sid;

      flex.Actions.invokeAction('SendMessage', {
        channelSid: payload.sid,
        body: body,
      });
    });

    //ACTIONS
    flex.Actions.replaceAction('WrapupTask', (payload, original) => {
      if (payload.task.taskChannelUniqueName !== 'chat') {
        original(payload);
      } else {
        return new Promise(function (resolve, reject) {
          const data = {
            channelSid: payload.task.attributes.channelSid,
            status: 'Finished',
          };
          try {
            const response = axios.post(`${process.env.BACKEND_URL}/close`, data);
            console.log('Respuesta', response);
          } catch (e) {
            console.log(e.message)
          }

          flex.Actions.invokeAction('SendMessage', {
            body: 'Gracias por tu tiempo. Espero estes muy bien!💙',
            channelSid: payload.task.attributes.channelSid,
          }).then(() => {
            resolve(original(payload));
          });
        });
      }
    });
  }

  registerReducers(manager) {
    if (!manager.store.addReducer) {
      console.error(
        `You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`
      );
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
