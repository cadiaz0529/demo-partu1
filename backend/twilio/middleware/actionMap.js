const { handleAction, handleInformationRequestAction } = require('./common');

const EXAMPLES_FOLDER = 'examples';
const ACTIONS_FOLDER = 'actions';
const normalizedPath = require('path').join(__dirname, ACTIONS_FOLDER);
const actions = require('fs')
  .readdirSync(normalizedPath)
  .filter((file) => file !== EXAMPLES_FOLDER)
  .map((file) => ({
    file,
    data: require(`./${ACTIONS_FOLDER}/${file}`)
  }));

const actionMap = new Map();
for (const action of actions) {
  if (!action.data.action) {
    throw new Error(`Could not configure action for file ${action.file}`);
  }
  console.log('Configuring', action.data.action);
  actionMap.set(action.data.action, (agent) =>
    handleAction(agent, action.data)
  );
}

// Generic
actionMap.set('Common.AskData', handleInformationRequestAction);

module.exports = actionMap;
