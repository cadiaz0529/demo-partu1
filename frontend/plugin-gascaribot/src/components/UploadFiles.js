import React from 'react';
import { Button } from '@material-ui/core';
import { Actions } from '@twilio/flex-ui';
import { Fragment } from 'react';

class UploadFiles extends React.Component {
  state = {
    selectedFile: null,
  };

  onFileChange = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
    this.onFileUpload();
  };

  onFileUpload = () => {
    const formData = new FormData();
    formData.append(
      'myFile',
      "https://images.unsplash.com/photo-1452873867668-7325bd9f4438?ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
    );

    console.log(this.state.selectedFile);
    try {
      Actions.invokeAction('SendMediaMessage', {
        file: formData,
        channelSid: this.props.channelSid,
      });
      this.setState({
        selectedFile: null,
        isFilePicked: false,
      });
    } catch (error) {
      console.log('the error come here:', error.message);
      this.setState({
        selectedFile: null,
        isFilePicked: false,
      });
    }
  };

  render() {
    return (
      <Fragment>
        <Button variant='contained' color='primary' component='label'>
          Adjuntar archivo
          <input type='file' hidden onChange={this.onFileChange} />
        </Button>
        {this.state.isFilePicked ? this.handleSubmissionEvent() : null}
      </Fragment>
    );
  }
}

export default UploadFiles;
