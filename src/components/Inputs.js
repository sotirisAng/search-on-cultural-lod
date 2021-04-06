import React from 'react'
// import App from "../App";
// import PropTypes from 'prop-types'
import {MakeHttpReq} from "./MakeHttpReq";

export class Inputs extends React.Component{

    constructor(props) {
        super(props);
        this.selectSuggestion = this.selectSuggestion.bind(this);
    }
    state = {
        input_text: this.props.default_value,

        focus: false,
        suggestions:[],
        suggestionsList:[],


        query: '',
        prefixes: 'query= prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX edm: <http://www.europeana.eu/schemas/edm/> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX skos: <http://www.w3.org/2004/02/skos/core#> PREFIX dct: <http://purl.org/dc/terms/> Prefix dbo: <http://dbpedia.org/ontology/> ',
        query_start: 'SELECT distinct * WHERE{ ',
        query_triple: this.props.triple,
        query_end: ' } group by ' + this.props.subject +' limit 500' ,
        filter : {
            start: ' FILTER regex(',
            subject: this.props.subject,
            between: ', "',
            value: this.input_text,
            end: '", "i") ',
            exclude_various:`FILTER regex(${this.props.subject},  "^(?!.*,.*)(?!.*\\\\|.*)") ` //^(?!Various Artists)|^(?!.*,.*)

        },
        plusbtn_value: '+',
        plusbtn_clicked: this.props.btn,
        clear: this.props.clear_inputs,
        couldClear:false


    };


    componentDidUpdate(prevProps, prevState){
        if(this.props.clear !== undefined){

            if(this.state.couldClear){
                this.state.clear = this.props.clear;
                if(this.state.clear){

                    this.clearInput()
                }
            }
        }
    }

    clearInput = () => {
        this.state.clear = false;
        this.state.plusbtn_clicked= false;
        this.state.input_text= '';
        this.state.couldClear = false;
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
        this.state.clear = false;
        let query = this.state.prefixes + this.state.query_start + this.state.query_triple + Object.values(filter).join('') + this.state.query_end;
        let res = await MakeHttpReq('sparql', query);
        const sub = res && res.data.head.vars[0];
        let list = [];
        res && res.data.results.bindings.map((obj) => {

            // if (obj[sub].value.match(/^(?!.*\|.*)$/)) {
            //     console.log(obj[sub].value.match(/^(?!.*\|.*)$/))
                list.push(obj[sub].value)
            // }

        });
        this.setState({
            suggestions: list
        })
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
        this.setState({ input_text: obj, suggestions: []});
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
        this.setState({
            plusbtn_clicked:  true,
            clear: false,
            couldClear:true,
            suggestions: []
        })
    };


    componentDidMount() {
        if(this.props.clear){
            this.setState({
                plusbtn_clicked: false
            })
        }
    }

    render() {
        return(
            <form onSubmit={this.onSubmit} className={'form-group'}  >
				<div className="dropdown">
                    <input className='dropdown-toggle' type={this.props.passvalueType} name="title" placeholder={this.props.placeholder} value={this.state.input_text || ''} onChange={this.onChange} disabled={this.state.plusbtn_clicked} />
                    <input type='submit' value={this.state.plusbtn_clicked ?  '✔' : '+' } className={this.state.plusbtn_clicked ?  'btn btn-success ' : 'btn btn-danger'} disabled={this.state.plusbtn_clicked}/>
                    {this.showSuggestions()}
                </div>
			</form>
        )
    }

}

export default Inputs;