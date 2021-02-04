import { combineReducers } from 'redux';

import { reduce as CustomTaskListReducer } from './CustomTaskListState';

export const namespace = 'gascaribot';

export default combineReducers({
  customTaskList: CustomTaskListReducer
});
