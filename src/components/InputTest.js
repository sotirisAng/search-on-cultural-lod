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
        if (typeof this.props.passValue !== "undefined") {
            this.props.passValue(this.state.input_text, this.props.subject, this.props.custom_filter);
        }
        if (typeof this.props.passService !== "undefined") {
            if (this.state.input_text !== '')
            this.props.passService(this.state.input_text);
        }
        if (this.state.input_text !== '' || this.state.input_text !== false)
        this.props.passSubject(this.props.triple);
        // this.props.builtQuery(this.state.input_text);
        // this.setState({input_text: ''})

    };



    render() {
        return(
            <form onSubmit={this.onSubmit} >
				<input type={this.props.passvalueType} name="title" placeholder="Add.." value={this.state.input_text} onChange={this.onChange} />
				<input type='submit' value="Submit" className="btn btn-primary" />
			</form>
        )
    }

}

export default InputTest;