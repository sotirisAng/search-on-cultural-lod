import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import InputTest from './components/InputTest';
import ResultTable2 from './components/ResultTable2';

import './App.css';

class App extends Component {
    state = {
        query: '',
        query_start: 'SELECT * WHERE{ ',
        query_end: ' }',
        prefixes: 'query= PREFIX edm: <http://www.europeana.eu/schemas/edm/> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX skos: <http://www.w3.org/2004/02/skos/core#> PREFIX dct: <http://purl.org/dc/terms/>',
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
        this.state.subjects.map((subject)=>
            subjects_string += subject
        );
        console.log(subjects_string);
        this.state.filters.map((filter)=>
           filters_string += Object.values(filter).join('')
        );
        console.log(filters_string);
        this.setState({
        query: this.state.prefixes + this.state.query_start  + subjects_string + filters_string + this.state.query_end,
            subjects:[],
            filters: []
        })
    };

    postQuery = (state) => {
        // let data: {
        //     query: {state.query},
        //     output: {"json"}
        // };

        let config = {
            headers: {
                'Accept': 'application/sparql-results+json,*/*;q=0.9',
                // 'Accept-Language': 'en-US,el;q=0.7,en;q=0.3',
                // 'Accept-Encoding': 'gzip, deflate',
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
            }
        };

        axios.post("http://localhost:3030/test3/sparql", this.state.query , config )
            .then((res) => {
                console.log(res.data.results.bindings);
                this.setState({
                    http_result: res.data.results.bindings
                })
            }).catch((error) => {
            console.log(error)
        });
    };




  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Search Semantic Integrated Museum Data </h2>
        </div>
          {/*<h2>Picasso</h2>*/}
          <h3>Artist</h3>
          <InputTest passValue={this.passValue}
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
          <h3>{this.state.query} </h3>
          <ResultTable2 http_result={this.state.http_result}/>

      </div>
    );
  }
}

export default App;
