import React from 'react'
// import App from "../App";
// import PropTypes from 'prop-types'
import {MakeHttpReq} from "./MakeHttpReq";

export class InputTest extends React.Component{

    constructor(props) {
        super(props);
        this.selectSuggestion = this.selectSuggestion.bind(this);
    }
    state = {
        input_text: '',

        focus: false,
        suggestions:[],
        suggestionsList:[],


        query: '',
        prefixes: 'query= prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX edm: <http://www.europeana.eu/schemas/edm/> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX skos: <http://www.w3.org/2004/02/skos/core#> PREFIX dct: <http://purl.org/dc/terms/> Prefix dbo: <http://dbpedia.org/ontology/> prefix foaf: <http://xmlns.com/foaf/0.1/>',
        query_start: 'SELECT distinct * WHERE{ ',
        query_triple: this.props.triple,
        query_end: ' } group by ' + this.props.subject,
        filter : {
            start: ' FILTER regex(',
            subject: this.props.subject,
            between: ', "',
            value: this.input_text,
            end: '", "i") '
        }

    };


    onChange = async (e) => {
        let filter = {
            ...this.state.filter,
            value: e.target.value
        };
        this.setState({
            input_text: e.target.value,
            filter: filter
        });
        let query = this.state.prefixes + this.state.query_start + this.state.query_triple + Object.values(filter).join('') + this.state.query_end;
        let res = await MakeHttpReq('sparql', query);
        const sub = res.data.head.vars[0];
        let list = [];
        res.data.results.bindings.map((obj,index) => {
            list.push(obj[sub].value)
        });
        // console.log(list);
        this.setState({
            suggestions: list
        })
    };

    showList = () => {
        console.log('focus1');

        // return(
        //     // <ul className="list-group" style={{ 'position': 'relative', 'width': '300px', 'max-height': '200px', 'overflow-y': 'auto', 'z-index': 2 }}>
        //     <div className="form-group" style={{position: 'relative', width: 300, maxHeight: 200, overflowY: 'auto' , zIndex:100}}>
        //         <select multiple className="form-control" id="exampleFormControlSelect2">
        //             <option>1</option>
        //             <option>2</option>
        //             <option>3</option>
        //             <option>4</option>
        //             <option>5</option>
        //         </select>
        //     </div>
        // )
    };

    showSuggestions = () =>{
        const sug = this.state.suggestions;
        return(
            <div className="dropdown-content" style={{maxHeight:300 , overflowY: 'auto'}}>
                {sug.map((obj, index) =>
                        <a key={index} onClick={() => this.selectSuggestion(obj)}>
                    {obj}
                </a>
                )}
            </div>
        )
    };

    selectSuggestion = (obj) => {
        // prevent.default
        this.setState({ input_text: obj, suggestions: []});
        // console.log(obj);
    };

    // handleInputFocus = () => {
    //     this.setState({ focus: true});
    // };
    //
    // handleInputBlur = () => {
    //     this.setState({ focus: false });
    // };


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
            <form onSubmit={this.onSubmit} className={'form-group'} >
				<div className="dropdown">
                    <input className='dropdown-toggle' type={this.props.passvalueType} name="title" placeholder={this.props.placeholder} value={this.state.input_text} onChange={this.onChange}  />
                    <input type='submit' value="Submit" className={"btn btn-danger"} data-toggle={"button"} aria-pressed={"false"}/>
                    {this.showSuggestions()}
                </div>
			</form>
        )
    }

}

export default InputTest;