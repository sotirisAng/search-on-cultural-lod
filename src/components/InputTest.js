import React from 'react'
// import App from "../App";
// import PropTypes from 'prop-types'
export class InputTest extends React.Component{

    state = {
        input_text: ''
    };

    onChange = (e) => {
        this.setState({input_text: e.target.value});
    };


    onSubmit = (e) => {
        e.preventDefault();
        this.props.passValue(this.state.input_text);
        // this.props.builtQuery(this.state.input_text);
        // this.setState({input_text: ''})
    };



    render() {
        return(
            <form onSubmit={this.onSubmit} >
				<input type='text' name="title" placeholder="Ad.." value={this.state.input_text} onChange={this.onChange} />
				<input type='submit' value="Submit" className="btn btn-primary" />
			</form>
        )
    }

}

export default InputTest;