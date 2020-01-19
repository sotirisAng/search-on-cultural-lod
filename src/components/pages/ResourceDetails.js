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

    distance = (s1, s2, caseSensitive= true ) => {
        var m = 0;
        var i;
        var j;

        // Exit early if either are empty.
        if (s1.length === 0 || s2.length === 0) {
            return 0;
        }

        // Convert to upper if case-sensitive is false.
        // if (!settings.caseSensitive) {
        //     s1 = s1.toUpperCase();
        //     s2 = s2.toUpperCase();
        // }

        // Exit early if they're an exact match.
        if (s1 === s2) {
            return 1;
        }

        var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
        var s1Matches = new Array(s1.length);
        var s2Matches = new Array(s2.length);

        for (i = 0; i < s1.length; i++) {
            var low  = (i >= range) ? i - range : 0;
            var high = (i + range <= (s2.length - 1)) ? (i + range) : (s2.length - 1);

            for (j = low; j <= high; j++) {
                if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
                    ++m;
                    s1Matches[i] = s2Matches[j] = true;
                    break;
                }
            }
        }

        // Exit early if no matches were found.
        if (m === 0) {
            return 0;
        }

        // Count the transpositions.
        var k = 0;
        var numTrans = 0;

        for (i = 0; i < s1.length; i++) {
            if (s1Matches[i] === true) {
                for (j = k; j < s2.length; j++) {
                    if (s2Matches[j] === true) {
                        k = j + 1;
                        break;
                    }
                }

                if (s1[i] !== s2[j]) {
                    ++numTrans;
                }
            }
        }

        var weight = (m / s1.length + m / s2.length + (m - (numTrans / 2)) / m) / 3;
        var l = 0;
        var p = 0.1;

        if (weight > 0.7) {
            while (s1[l] === s2[l] && l < 4) {
                ++l;
            }

            weight += l * p * (1 - weight);
        }

        return weight;
    }; //give credits for jaro distance

    createSameAsRelation = async (sub, obj) => {
        let askQuery = {
            query: '',
            query_ask: 'ASK WHERE{ ',
            query_insert: 'INSERT DATA { ',
            query_end: ' }',
            prefixes: 'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX owl: <http://www.w3.org/2002/07/owl#> ',

        };
        askQuery.query = 'query='+askQuery.prefixes + askQuery.query_ask + '<' + sub + '> owl:sameAs <' + obj + '>' + askQuery.query_end;
        let res = await MakeHttpReq('sparql', askQuery.query);
        console.log(res.data.boolean);
        if (!res.data.boolean) {
            askQuery.query = 'update= '+ askQuery.prefixes + askQuery.query_insert + '<' + sub + '> owl:sameAs <' + obj + '>' + askQuery.query_end;
            console.log(askQuery.query);
            MakeHttpReq('update', askQuery.query);
        }

    };



    // componentWillMount() {
    componentDidMount() {
        // let {id} = useParams();
        // console.log(id);
        let q = this.state.prefixes + this.state.query_start  +'<'+ this.props.location.state.resourceClicked +'>' + this.state.query_first_end;
        let searchVar ='';
        let  artist_federated = {
            europeanaStart : ' optional { {SERVICE <http://sparql.europeana.eu> { ?ExternalLink a edm:Agent .  ?ExternalLink skos:prefLabel ?name1. FILTER (lang(?name1) = "en") FILTER regex(?name1, "' ,
            input1 : searchVar,
            eupeana_end: '", "i")}} ',
            dbpedia_start: 'union {SERVICE <http://dbpedia.org/sparql/> { ?SameAsLink rdf:type dbo:Person; rdf:type dbo:Artist; rdf:type foaf:Person; foaf:name ?name2.  FILTER (lang(?name1) = "en")  FILTER regex(?name2, "',
            input2 : searchVar,
            dbpedia_end: '", "i")}}}'
        } ;
        this.setState({
        query: q
        // query: this.state.prefixes + this.state.query_start  +'<'+ this.props.location.state.resourceClicked +'>' + this.state.query_first_end + this.state.query_second + '<'+ this.props.location.state.resourceClicked +'>' + this.state.query_second_end
    });
        MakeHttpReq('sparql', q).then((res) =>{
                // console.log(res.data.results)
            res.data.results.bindings.map((obj) =>  {
                    if (obj.property.value === 'http://www.w3.org/2004/02/skos/core#prefLabel'){
                        searchVar = obj.object.value;
                        artist_federated ={...artist_federated,
                        input1: searchVar,
                        input2: searchVar};
                        let federated_string = Object.values(artist_federated).join('');

                        // console.log(artist_federated);
                        q = this.state.prefixes + this.state.query_start  +federated_string + '}';
                        console.log(q);
                        MakeHttpReq('sparql', q).then((res) =>{
                             console.log(res.data.results.bindings)
                            res.data.results.bindings.map((obj)=>{
                                let n = '';
                                if (obj.name1){n = obj.name1.value}
                                else if (obj.name2){n = obj.name2.value}
                                else{
                                    MakeHttpReq('sparql', this.state.query).then((res) =>{
                                            console.log('tora3')

                                            this.setState({
                                                http_result: res.data.results.bindings
                                            })
                                        }
                                    );
                                }

                                let jaro = this.distance(searchVar , n);
                                console.log(" jaro = "+jaro );
                                if (jaro > 0.95) {
                                    // if (jaro > 0.95 && ((1/lev) < 0.1)) {
                                    console.log('yes');
                                    // console.log(obj.artist.value);
                                    if (obj.ExternalLink) {
                                        console.log(obj.ExternalLink.value);
                                        this.createSameAsRelation(this.props.location.state.resourceClicked, obj.ExternalLink.value).then(() => {MakeHttpReq('sparql', this.state.query).then((res) =>{
                                            console.log('tora')
                                                this.setState({
                                                    http_result: res.data.results.bindings
                                                })
                                            }
                                        );});
                                    } else if (obj.SameAslLink) {
                                        console.log(obj.SameAslLink.value);
                                        this.createSameAsRelation(this.props.location.state.resourceClicked, obj.SameAslLink.value).then(() => {MakeHttpReq('sparql', this.state.query).then((res) =>{
                                            console.log('tora2')

                                            this.setState({
                                                    http_result: res.data.results.bindings
                                                })
                                            }
                                        );});
                                    }
                                }
                                else{
                                    MakeHttpReq('sparql', this.state.query).then((res) =>{
                                            console.log('tora3')

                                            this.setState({
                                                http_result: res.data.results.bindings
                                            })
                                        }
                                    );
                                }

                            });
                            // let lev = this.LevenshteinDistance(nam, n);


                        })
                    }
            })
            }
        );
    // }

    // componentDidMount() {
        // const { resourceClicked } = this.props.location.state;

        // MakeHttpReq('sparql', this.state.query).then((res) =>{
        //         this.setState({
        //             http_result: res.data.results.bindings
        //         })
        //     }
        // );
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