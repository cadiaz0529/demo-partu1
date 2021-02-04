import React from 'react';
import { connect } from 'react-redux';
import { Actions, withTheme } from '@twilio/flex-ui';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import messageJSON from '../../utils/messages.json';
import { CannedResponsesStyles } from './CannedResponses.Styles';

class CannedResponses extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      response: '',
      selectedFile: null,
    };
  }

  fileSelectedHandler(e) {
    this.setState({
      selectedFile: e.target.files[0],
    });

    Actions.invokeAction("SendMediaMessage", { file: e.target.files[0], channelSid: this.props.channelSid });
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });

    Actions.invokeAction('SetInputText', {
      body: event.target.value,
      channelSid: this.props.channelSid,
    });

    Actions.invokeAction('SendMessage', {
      channelSid: this.props.channelSid,
      body: event.target.value,
    });
  };

  render() {
    return (
      <CannedResponsesStyles>
        <FormControl className='form'>
          <InputLabel className='input-label' htmlFor='response'>
            Respuestas rápidas
          </InputLabel>
          <Select
            value={this.state.response}
            onChange={this.handleChange}
            name='response'
          >
            {messageJSON.messages.map((data, index) => {
              return (
                <MenuItem
                  className='item'
                  key={(index, index)}
                  value={data.message}
                >
                  {data.property}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {/* <input type="file" onChange={(e) => this.fileSelectedHandler(e)}/> */}
      </CannedResponsesStyles>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let currentTask = false;
  state.flex.worker.tasks.forEach((task) => {
    if (ownProps.channelSid === task.attributes.channelSid) {
      currentTask = task;
    }
  });

  return {
    state,
    currentTask,
  };
};

export default connect(mapStateToProps)(withTheme(CannedResponses));
