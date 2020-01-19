import React from 'react';
// import axios from 'axios';
import ResultTable2 from "../ResultTable2";
import {MakeHttpReq} from "../MakeHttpReq";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams
} from "react-router-dom";

export default class ResourceDetailes extends React.Component {

    state = {
        query: '',
        query_start: 'SELECT distinct * WHERE{ ',
        // query_start: 'SELECT distinct * WHERE{ {',
        query_first_end: ' ?property ?object . } ',
        query_second: ' ',
        query_second_end: 'limit 1000',
        // query_second: 'union { ?s ?prop   ',
        // query_second_end: '.} }  limit 1000',
        prefixes: 'query= prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX edm: <http://www.europeana.eu/schemas/edm/> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX skos: <http://www.w3.org/2004/02/skos/core#> PREFIX dct: <http://purl.org/dc/terms/> Prefix dbo: <http://dbpedia.org/ontology/> prefix foaf: <http://xmlns.com/foaf/0.1/>',
        http_result: [],
        triples:''
    };

    componentWillMount() {
        // let {id} = useParams();
        // console.log(id);
        this.setState({
        query: this.state.prefixes + this.state.query_start  +'<'+ this.props.location.state.resourceClicked +'>' + this.state.query_first_end
        // query: this.state.prefixes + this.state.query_start  +'<'+ this.props.location.state.resourceClicked +'>' + this.state.query_first_end + this.state.query_second + '<'+ this.props.location.state.resourceClicked +'>' + this.state.query_second_end
    });
    }

    componentDidMount() {
        // const { resourceClicked } = this.props.location.state;

        MakeHttpReq('sparql', this.state.query).then((res) =>{
                this.setState({
                    http_result: res.data.results.bindings
                })
            }
        );
    };
    


    render() {
        return(
            <div>
                <p>
                    <ResultTable2 http_result={this.state.http_result} triples={this.state.triples}/>
                </p>
            </div>
        )
    }


}
// export default Details1;