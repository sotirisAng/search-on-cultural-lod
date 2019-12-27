import React, { Component } from 'react';
// import axios from 'axios';
import logo from './logo.svg';
import InputTest from './components/InputTest';
import ResultTable2 from './components/ResultTable2';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import ResourceDetails from "./components/pages/ResourceDetails";
// import {d3} from "node_modules/d3-sparql";


import './App.css';
import {MakeHttpReq} from "./components/MakeHttpReq";

class App extends Component {
    state = {
        query: '',
        query_start: 'SELECT distinct * WHERE{ ',
        query_end: ' }',
        prefixes: 'query= prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX edm: <http://www.europeana.eu/schemas/edm/> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX skos: <http://www.w3.org/2004/02/skos/core#> PREFIX dct: <http://purl.org/dc/terms/> Prefix dbo: <http://dbpedia.org/ontology/> prefix foaf: <http://xmlns.com/foaf/0.1/>',
        // artist: '?cho dc:creator ?artist. ?artist skos:prefLabel ?name. ',
        // artist_filter: {
        //     start: 'FILTER regex(?name, "',
        //     value: '',
        //     end: '")'
        // },
        subjects:[],
        filters: [],
        filter : {
            start: ' FILTER regex(',
            subject: '',
            between: ', "',
            value: '',
            end: '") '
        },
        external_services:[],
        http_result: []
    };

    filter = {
        start: 'FILTER regex(?name, "',
        value: '',
        end: '")'
    };


    // passValue = (input_text) => {
    //     this.setState(prevState => ({
    //         artist_filter: {
    //             ...prevState.artist_filter,
    //             value: input_text
    //         }
    //     }))
    // };

    passValue = (input_text, sub, custom_filter) => {
        console.log(custom_filter);
        if (input_text !== '')
       {
           const filter = (custom_filter !== undefined ) ?
               ( {
                   ...custom_filter,
                   subject: sub,
                   value: input_text
               }) :
               ({
                   // ...this.state.filter,
                   start: ' FILTER regex(',
                   subject: sub,
                   between: ', "',
                   value: input_text,
                   end: '", "i") '
               });
           this.setState(prevState => ({
               filter: filter,
               // filters: this.state.filters.push(filter)
           }));
           this.state.filters.push(filter);
       }
        // console.log(this.state.filter);;
        // console.log(this.state.filters);
    };

    passService = (input_text) => {

      let  artist_federated = {
            europeanaStart : ' optional { {SERVICE <http://sparql.europeana.eu> { ?ExternalLink a edm:Agent .  ?ExternalLink skos:prefLabel ?name1. FILTER (lang(?name1) = "en") FILTER regex(?name1, "' ,
            input1 : input_text,
            eupeana_end: '", "i" )}} ',
            dbpedia_start: 'union {SERVICE <http://dbpedia.org/sparql/> { ?SameAsLink rdf:type dbo:Person; rdf:type dbo:Artist; rdf:type foaf:Person; foaf:name ?name2. FILTER regex(?name2, "',
          input2 : input_text,
          dbpedia_end: '","i")}}}'
        } ;

        this.state.external_services.push(artist_federated);

    };

    passSubject = (triple) => {
        // this.setState({
        //     subjects: this.state.subjects.push(triple)
        // });
        this.state.subjects.push(triple);
        console.log(this.state.subjects);

    };

    builtQuery = (input_text) => {
        let subjects_string = '';
        let filters_string = '';
        let services_string = '';
        this.state.subjects.map((subject)=>
            subjects_string += subject
        );
        console.log(subjects_string);
        this.state.filters.map((filter)=>
           filters_string += Object.values(filter).join('')
        );
        this.state.external_services.map((service)=>
           services_string += Object.values(service).join('')
        );
        console.log(filters_string);
        this.setState({
        query: this.state.prefixes + this.state.query_start  + subjects_string + filters_string + services_string + this.state.query_end,
            subjects:[],
            filters: [],
            external_services: []
        })
    };

    clearQuery = () =>{
        this.setState({
            query: '',
            subjects:[],
            filters: [],
            external_services: []
        })
    };

    postQuery = () => {
        // let data: {
        //     query: {state.query},
        //     output: {"json"}
        // };

        MakeHttpReq('sparql', this.state.query).then((res) =>{
            this.setState({
                http_result: res.data.results.bindings
            })
        }
        );

    };






  render() {
    return (
        <Router>
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Search Semantic Integrated Museum Data </h2>
                </div>
                {/*<h2>Picasso</h2>*/}
                <h3>Artist</h3>
                <InputTest passValue={this.passValue}
                           passService={this.passService}
                           passvalueType={'text'}
                           passSubject={this.passSubject}
                           triple={"?cho dc:creator ?artist. ?artist skos:prefLabel ?name. "}
                           subject={'?name'}
                />
                <h3>Lived Between (Years)</h3>
                <InputTest passValue={this.passValue}
                           custom_filter={{
                               start: ' FILTER(',
                               subject: '',
                               between: '>= "',
                               value: '',
                               end: '") '
                           }}
                           passvalueType={'text'}
                           passSubject={this.passSubject}
                           triple={"?artist edm:begin ?born. "}
                           subject={'?born'}
                />
                <InputTest passValue={this.passValue}
                           custom_filter={{
                               start: ' FILTER(',
                               subject: '',
                               between: '<= "',
                               value: '',
                               end: '") '
                           }}
                           passvalueType={'text'}
                           passSubject={this.passSubject}
                           triple={"?artist edm:end ?died."}
                           subject={'?died'}
                />
                <h3>Title</h3>
                <InputTest passValue={this.passValue}
                           passvalueType={'text'}
                           passSubject={this.passSubject}
                           triple={"?cho dct:title ?title. "}
                           subject={'?title'}
                />
                <h3>Medium</h3>
                <InputTest passValue={this.passValue}
                           passvalueType={'text'}
                           passSubject={this.passSubject}
                           triple={"?cho dct:medium ?medium. "}
                           subject={'?medium'}
                />
                <h3>Date</h3>
                <InputTest passValue={this.passValue}
                           custom_filter={{
                               start: ' FILTER(',
                               subject: '',
                               between: '= "',
                               value: '',
                               end: '") '
                           }}
                           passvalueType={'text'}
                           passSubject={this.passSubject}
                           triple={"?cho dc:date ?date."}
                           subject={'?date'}
                />
                <h3>Classification</h3>
                <InputTest passValue={this.passValue}
                           passvalueType={'text'}
                           passSubject={this.passSubject}
                           triple={"?cho dc:type ?classification. "}
                           subject={'?classification'}
                />
                <h3>Thumbnail</h3>
                <InputTest
                    passvalueType={'checkbox'}
                    passSubject={this.passSubject}
                    triple={"?cho edm:hasView ?thumbnail. "}
                    subject={'?thumbnail'}
                />
                <button className={'btn btn-success'} onClick={this.builtQuery}>Build Query</button>
                <button className={'btn btn-danger'} onClick={this.postQuery}>Post Query</button>
                <button className={'btn btn-warning'} onClick={this.clearQuery}>Clear Query</button>
                <h3>{this.state.query} </h3>

                <Route exact path="/" render={props => (
                    <React.Fragment>
                        <ResultTable2 http_result={this.state.http_result}/>
                    </React.Fragment>
                )}/>
                <Route path="/details" render={(props) => <ResourceDetails {...props}/>} />
            </div>
        </Router>

    );
  }
}

export default App;
