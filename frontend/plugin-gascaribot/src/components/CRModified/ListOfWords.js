import React from 'react';
import '../../styles.css';
import JSONMessages from '../../utils/messages.json';
class ListOfWords extends React.Component {
  render() {
    return (
      <div className='prueba'>
        <h1 className='title'>Mensajes rápidos</h1>
        <div className='fast-messages-container'>
          {JSONMessages.messages.map((message, index) => {
            return (
              <div className='message-container' key={index}>
                <div>
                  <p className='property'>{message.property}</p>
                </div>
                <div className='messages'>
                  <p>{message.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
export default ListOfWords;
