import React, { Fragment } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fade from '@material-ui/core/Fade';
import '../styles.css';

// const openC = null
class CanvasHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  handleClick = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = (department) => {
    this.setState({
      anchorEl: null,
    });
    if (department === 'Brilla') {
      try {
        const response = axios.post(
          `${process.env.BACKEND_URL}/close`,
          this.props.channel
        );
        console.log(response);
      } catch (e) {
        console.log(e.message);
      }
    } else if (department === 'Comercializacion') {
      // Aqui va la lógica para Comercialización
    } else if (department === 'gascaribot') {
      // Aqui va la lógica para gascaribot
    }
  };

  render() {
    const openC = Boolean(this.state.anchorEl);
    return (
      <div className='testing'>
        <button className='btn--transfer' onClick={this.handleClick}>
          TRANSFERIR
        </button>

        <Menu
          id='fade-menu'
          anchorEl={this.state.anchorEl}
          keepMounted
          open={openC}
          onClose={this.handleClose}
          TransitionComponent={Fade}
        >
          <MenuItem onClick={this.handleClose('Brilla')}>Brilla</MenuItem>
          <MenuItem onClick={this.handleClose('Comercializacion')}>
            Comercialización
          </MenuItem>
          <MenuItem onClick={this.handleClose('Gascaribot')}>
            GasCaribot
          </MenuItem>
        </Menu>
      </div>
    );
  }
}
export default CanvasHeader;
