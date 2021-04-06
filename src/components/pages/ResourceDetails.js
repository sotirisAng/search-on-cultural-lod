import React from 'react';
import ResultTable2 from "../ResultTable2";
import {MakeHttpReq} from "../MakeHttpReq";

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
        triples: '',
        rdf_graph_data: '',
        showModal: false,
        modalTitle: ''
    };


    distance = (s1, s2) => {
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
            var low = (i >= range) ? i - range : 0;
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
        let ask = `query= 
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
                    PREFIX owl: <http://www.w3.org/2002/07/owl#>
                    
                    ASK WHERE{ 
                    <${sub}> owl:sameAs <${obj}>
                    }
                `
        let update = `update= 
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
                        PREFIX owl: <http://www.w3.org/2002/07/owl#>

                        INSERT DATA {
                        <${sub}> owl:sameAs <${obj}>
                        }
                    `


        let res = await MakeHttpReq('sparql', ask);

        if (!res.data.boolean) {
             await MakeHttpReq('update', update).then(async () => {
                let q = this.state.prefixes + this.state.query_start + '<' + sub + '>' + this.state.query_first_end;
                await MakeHttpReq('sparql', q).then((res) => {
                    this.setState({
                        http_result: res.data.results.bindings
                    })
                })
            })
        }

    };

    checkType = async (sub) => {
        const q = `query= PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX edm: 
<http://www.europeana.eu/schemas/edm/> select distinct ?type where { <${sub}> rdf:type ?type . } `;
        return await MakeHttpReq('sparql', q).then((res) => {
            return res.data.results.bindings[0].type.value
        })
    }

    getArtworkValuesForLinking = async (sub) => {
        const q = `query= 
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  
                    PREFIX edm: <http://www.europeana.eu/schemas/edm/> 
                    PREFIX dc: <http://purl.org/dc/elements/1.1/>  
                    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>  
                    select distinct * where 
                    { <${sub}>  rdf:type ?type ; 
                                dc:title ?title; 
                                dc:date ?date; 
                                dc:creator ?creator. 
                       ?creator skos:prefLabel ?creatorLabel. 
                       ?creator skos:altLabel ?creatorAltLabel. 
                     } `
        return await MakeHttpReq('sparql', q).then((res) => {
            const obj = res.data.results.bindings[0];
            return {
                uri: sub,
                type: obj.type.value,
                title: obj.title.value,
                date: obj.date.value,
                creator: obj.creator.value,
                creatorLabel: obj.creatorLabel.value,
                creatorAltLabel: obj.creatorAltLabel.value.trim(),
            }
        })
    }

    getArtistValuesForLinking = async (sub) => {
        const q = `query= 
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  
                        PREFIX edm: <http://www.europeana.eu/schemas/edm/> 
                        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>  
                        select distinct * where { 
                          <${sub}> rdf:type ?type ; 
                                   skos:prefLabel ?name;
                                   skos:altLabel ?altName;
                                   edm:begin ?begin;
                                   edm:end ?end;
                        } 
                    `
        return await MakeHttpReq('sparql', q).then((res) => {
            const obj = res.data.results.bindings[0];
            return {
                uri: sub,
                type: obj.type.value,
                name: obj.name.value,
                begin: obj.begin.value,
                end: (obj.end.value === 'Alive' ? "" : obj.end.value),
                altName: obj.altName.value.trim()
            }
        })
    }

    federatedEuropeanaArtist = async (artist) => {
        const q = `query= 
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
                PREFIX edm: <http://www.europeana.eu/schemas/edm/>
                PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
                PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                PREFIX dbo: <http://dbpedia.org/ontology/>
                PREFIX ore: <http://www.openarchives.org/ore/terms/>
                
                SELECT DISTINCT * WHERE {
                    SERVICE <http://sparql.europeana.eu> {
                    ?linkedArtist  rdf:type ?type.
                    ?linkedArtist  skos:prefLabel ?name.
                    OPTIONAL {?linkedArtist  edm:begin|dbo:birthDate ?begin.
                                FILTER regex(?begin,"${artist.begin}")       
                            }
                    OPTIONAL {?linkedArtist  dbo:deathDate|edm:end ?end. 
                               FILTER regex(?begin,"${artist.begin}")  
                            }
                    FILTER(?type=edm:Agent || ?type=ore:Proxy)
                    FILTER (?name="${artist.name}"@en || ?name = "${artist.altName}"@en || ?name = "${artist.altName}" || ?name = "${artist.name}")
                    }
                }`
        return await MakeHttpReq('sparql', q).then((res) => {
            return res.data.results.bindings
        })
    }

    federatedDbpediaArtist = async (artist) => {
        const q = `query= 
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
                        PREFIX dbo: <http://dbpedia.org/ontology/>
                        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                        
                        SELECT DISTINCT * WHERE{ 
                            SERVICE <http://dbpedia.org/sparql/> {
                            ?linkedArtist rdf:type ?type;
                                          rdfs:label ?name.
                            OPTIONAL {  ?linkedArtist dbo:birthDate ?begin.
                                        BIND (YEAR(?begin) AS ?beginYear)
                                        FILTER (?beginYear="${artist.begin}"^^xsd:integer)
                            }
                            OPTIONAL {  ?linkedArtist dbo:deathDate ?end.
                                        BIND (YEAR(?end) AS ?endYear)
                                        FILTER (?endYear="${artist.end}"^^xsd:integer)
                            }
                            FILTER(?type=(dbo:Agent) || ?type=(dbo:Artist) )
                            FILTER (?name="${artist.name}"@en || ?name = "${artist.altName}"@en || ?name = "${artist.altName}" || ?name = "${artist.name}")
                        } 
                    }`
        return await MakeHttpReq('sparql', q).then((res) => {
            return res.data.results.bindings
        })
    }

    federatedDbpediaArtwork = async (artwork) => {
        const q = `query= 
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
                PREFIX edm: <http://www.europeana.eu/schemas/edm/>
                PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
                PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                PREFIX dbo: <http://dbpedia.org/ontology/>
                PREFIX dbp: <http://dbpedia.org/property/>
                PREFIX ore: <http://www.openarchives.org/ore/terms/>
                
                SELECT DISTINCT * WHERE {
                    SERVICE <http://dbpedia.org/sparql/> {
                        ?linkedArtwork  rdf:type ?type.
                        ?linkedArtwork rdfs:label ?title.
                        ?linkedArtwork dbo:author|dbp:artist  ?creator.
                        ?creator rdfs:label ?creatorName.
                        OPTIONAL{?linkedArtwork dbp:year ?date.
                            FILTER regex(?date,"${artwork.date}")
                        }
                        OPTIONAL{?linkedArtwork dbp:medium ?medium.}
                        FILTER (?type = dbo:Artwork)
                        FILTER (?title = "${artwork.title}" || ?title = "${artwork.title}"@en)
                        FILTER (?creatorName="${artwork.creatorLabel}"@en || ?creatorName = "${artwork.creatorAltLabel}"@en || ?creatorName = "${artwork.creatorLabel}" || ?creatorName = "${artwork.creatorAltLabel}")
                    }
                }`
        return await MakeHttpReq('sparql', q).then((res) => {
            return res.data.results.bindings
        })
    }

    federatedEuropeanaArtwork = async (artwork) => {
        const q = `query= 
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
                PREFIX edm: <http://www.europeana.eu/schemas/edm/>
                PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
                PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                PREFIX dbo: <http://dbpedia.org/ontology/>
                PREFIX ore: <http://www.openarchives.org/ore/terms/>
                PREFIX dct: <http://purl.org/dc/terms/>
                PREFIX dc: <http://purl.org/dc/elements/1.1/>
                
                SELECT DISTINCT * WHERE {
                    SERVICE <http://sparql.europeana.eu> {
                        ?linkedArtwork  rdf:type ?type.
                        ?linkedArtwork dc:title ?title.
                        ?linkedArtwork dc:creator ?creator.
                        OPTIONAL{?linkedArtwork dc:date ?date.
                            FILTER regex(?date,"${artwork.date}")
                        }
                        OPTIONAL{?linkedArtwork dct:medium ?medium.}
                        FILTER (?type = edm:ProvidedCHO || ?type = edm:Proxy)
                        FILTER (?title = "${artwork.title}" || ?title = "${artwork.title}"@en)
                        FILTER (?creator="${artwork.creatorLabel}"@en || ?creator = "${artwork.creatorAltLabel}"@en || ?creator = "${artwork.creatorLabel}" || ?creator = "${artwork.creatorAltLabel}")
                    }
                }`
        return await MakeHttpReq('sparql', q).then((res) => {
            return res.data.results.bindings
        })
    }

    compareFederatedArtworkResults = (artwork, results) => {
        results.map((federatedArtwork) => {
                this.createSameAsRelation(artwork.uri, federatedArtwork.linkedArtwork.value)
        })
    }

    compareFederatedArtistResults = (artist, results) => {
        results.map((federatedArtist) => {
            let begin = federatedArtist.begin && federatedArtist.begin.value
            let end = federatedArtist.end && federatedArtist.end.value
            if (begin !== undefined || end !== undefined) {
                this.createSameAsRelation(artist.uri, federatedArtist.linkedArtist.value)
            }
        })
    }

    componentDidMount() {
        const theLink = 'http://ct-linkdata.aegean.gr/museum_data' + this.props.match.url;
        let q = this.state.prefixes + this.state.query_start + '<' + theLink + '>' + this.state.query_first_end;
        // let q = this.state.prefixes + this.state.query_start  +'<'+ this.props.location.state.resourceClicked +'>' + this.state.query_first_end;
        this.checkType(theLink).then(async r => {
            if (r === 'http://www.europeana.eu/schemas/edm/ProvidedCHO') {

                const artwork = await this.getArtworkValuesForLinking(theLink)
                this.federatedDbpediaArtwork(artwork).then(r => {
                    this.compareFederatedArtworkResults(artwork, r)
                })
                this.federatedEuropeanaArtwork(artwork).then(r => {
                    this.compareFederatedArtworkResults(artwork, r)
                })


            } else if (r === 'http://www.europeana.eu/schemas/edm/Agent') {
                const artist = await this.getArtistValuesForLinking(theLink)
                this.federatedDbpediaArtist(artist).then(r => {
                    this.compareFederatedArtistResults(artist, r)
                })
                this.federatedEuropeanaArtist(artist).then(r => {
                    this.compareFederatedArtistResults(artist, r)
                })

            }
            // console.log(r.data.results.bindings) http://www.europeana.eu/schemas/edm/ProvidedCHO http://www.europeana.eu/schemas/edm/Agent
        })


        let searchVar = '';
        let artist_federated = {
            europeanaStart: ' optional { {SERVICE <http://sparql.europeana.eu> { ?ExternalLink a edm:Agent .  ?ExternalLink skos:prefLabel ?name1. FILTER (lang(?name1) = "en") FILTER regex(?name1, "',
            input1: searchVar,
            eupeana_end: '", "i")}} ',
            dbpedia_start: 'union {SERVICE <http://dbpedia.org/sparql/> { ?SameAsLink rdf:type dbo:Person; rdf:type dbo:Artist; rdf:type foaf:Person; foaf:name ?name2.  FILTER (lang(?name2) = "en")  FILTER regex(?name2, "',
            input2: searchVar,
            dbpedia_end: '", "i")}}}'
        };
        this.setState({
            query: q
        });
        MakeHttpReq('sparql', q).then((res) => {
                res.data.results.bindings.map((obj) => {
                    if (obj.property.value === 'http://purl.org/dc/elements/1.1/title') {
                        this.setState({
                            modalTitle: obj.object.value
                        })
                    }
                    if (obj.property.value === 'http://www.w3.org/2004/02/skos/core#prefLabel') {
                        this.setState({
                            modalTitle: obj.object.value
                        });
                        searchVar = obj.object.value;
                        artist_federated = {
                            ...artist_federated,
                            input1: searchVar,
                            input2: searchVar
                        };


                        let federated_string = '' //Object.values(artist_federated).join('');

                        q = this.state.prefixes + this.state.query_start + federated_string + '}';
                        MakeHttpReq('sparql', q).then((res) => {
                            res.data.results.bindings.map((obj) => {
                                let n = '';
                                if (obj.name1) {
                                    n = obj.name1.value
                                } else if (obj.name2) {
                                    n = obj.name2.value
                                } else {
                                    MakeHttpReq('sparql', this.state.query).then((res) => {

                                            this.setState({
                                                http_result: res.data.results.bindings
                                            })
                                        }
                                    );
                                }

                                let jaro = this.distance(searchVar, n);
                                if (jaro > 0.95) {
                                    if (obj.ExternalLink) {
                                        this.createSameAsRelation(theLink, obj.ExternalLink.value).then(() => {
                                            MakeHttpReq('sparql', this.state.query).then((res) => {
                                                    this.setState({
                                                        http_result: res.data.results.bindings
                                                    })
                                                }
                                            );
                                        });
                                    } else if (obj.SameAslLink) {
                                        this.createSameAsRelation(theLink, obj.SameAslLink.value).then(() => {
                                            MakeHttpReq('sparql', this.state.query).then((res) => {

                                                    this.setState({
                                                        http_result: res.data.results.bindings
                                                    })
                                                }
                                            );
                                        });
                                    }
                                } else {
                                    MakeHttpReq('sparql', this.state.query).then((res) => {
                                            this.setState({
                                                http_result: res.data.results.bindings
                                            })
                                        }
                                    );
                                }

                            });
                        })
                    } else {
                        MakeHttpReq('sparql', this.state.query).then((res) => {
                                this.setState({
                                    http_result: res.data.results.bindings
                                })
                            }
                        );
                    }
                })
            }
        );
    };

    showTurtle = () => {
        const theLink = 'http://ct-linkdata.aegean.gr/museum_data' + this.props.match.url;
        const query = 'query= describe <' + theLink + '>';
        MakeHttpReq('query', query, 'application/rdf+xml').then((res) => {
                this.setState({
                    rdf_graph_data: res.data,
                    showModal: true
                })
            }
        );

    };

    showJson = () => {
        const theLink = 'http://ct-linkdata.aegean.gr/museum_data' + this.props.match.url;
        const query = 'query= describe <' + theLink + '>';
        MakeHttpReq('query', query, 'application/ld+json').then((res) => {
                this.setState({
                    rdf_graph_data: JSON.stringify(res.data, null, 2),
                    showModal: true
                })
            }
        );

    };

    closeModal = () => {
        this.setState({showModal: false});
    };

    theModal = () => {
        return (
            <div className="modal fade bd-example-modal-lg show" tabIndex="-1" role="dialog" style={{display: 'block'}}
                 hidden={!this.state.showModal}
                 aria-labelledby="myLargeModalLabel">
                <div className="modal-dialog modal-lg modal-dialog-scrollable ">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">{this.state.modalTitle}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                    onClick={this.closeModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                                <pre>
                                    <code>{this.state.rdf_graph_data}</code>
                                </pre>
                        </div>
                    </div>
                </div>
            </div>

        )
    };


    render() {
        return (
            <div>
                <div>
                    <ResultTable2 http_result={this.state.http_result} triples={this.state.triples}/>
                </div>
                <button className={"btn btn-info"} onClick={this.showTurtle}>RDF-XML</button>
                {this.theModal()}
                <button className={"btn btn-info"} onClick={this.showJson}>JSON-LD</button>
            </div>
        )
    }


}

