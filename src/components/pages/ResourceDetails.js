import React from 'react';
import axios from 'axios';
import ResultTable2 from "../ResultTable2";

export default class ResourceDetailes extends React.Component {

    state = {
        query: '',
        query_start: 'SELECT distinct * WHERE{ ',
        query_end: ' ?p ?o . }',
        prefixes: 'query= prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX edm: <http://www.europeana.eu/schemas/edm/> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX skos: <http://www.w3.org/2004/02/skos/core#> PREFIX dct: <http://purl.org/dc/terms/> Prefix dbo: <http://dbpedia.org/ontology/> prefix foaf: <http://xmlns.com/foaf/0.1/>',
        http_result: []
    };

    componentWillMount() {
        this.setState({
        query: this.state.prefixes + this.state.query_start  +'<'+ this.props.location.state.resourceClicked +'>' + this.state.query_end,
    });
    }

    componentDidMount() {
        // const { resourceClicked } = this.props.location.state;

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
        return(
            <div>
                <h1>
                    <ResultTable2 http_result={this.state.http_result}/>
                </h1>
            </div>
        )
    }


}
// export default Details1;