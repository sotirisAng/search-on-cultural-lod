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
        artist: '?cho dc:creator ?artist. ?artist skos:prefLabel ?name. ',
        artist_filter: {
            start: 'FILTER regex(?name, "',
            value: '',
            end: '")'
        },
        filters: [],
        http_result: []
    };

    filter = {
        start: 'FILTER regex(?name, "',
        value: '',
        end: '")'
    };

    passValue = (input_text) => {
        this.setState(prevState => ({
            artist_filter: {
                ...prevState.artist_filter,
                value: input_text
            }
        }))
    };

    builtQuery = (input_text) => {
        this.setState({
       query: this.state.prefixes + this.state.query_start  + this.state.artist + this.state.artist_filter.start + this.state.artist_filter.value + this.state.artist_filter.end + this.state.query_end
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
                // console.log(res.data.results.bindings);
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
          <h2>Semantic Data Integration Museum Search</h2>
        </div>
          <h2>Picasso</h2>
          <InputTest passValue={this.passValue}/>
          <button className={'btn btn-success'} onClick={this.builtQuery}>Build Query</button>
          <button className={'btn btn-danger'} onClick={this.postQuery}>Post Query</button>
          <h3>{this.state.query} </h3>
          <ResultTable2 http_result={this.state.http_result}/>
          {/*{this.state.http_result.map((obj, index) =>*/}
          {/*    <ul key={index}>*/}
          {/*        <li>{obj.artist.value}</li>*/}
          {/*        <li>{obj.name.value}</li>*/}
          {/*        <li>{obj.cho.value}</li>*/}
          {/*    </ul>*/}
          {/*)}*/}
      </div>
    );
  }
}

export default App;
