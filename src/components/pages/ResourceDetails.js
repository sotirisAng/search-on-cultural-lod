import React from 'react';
import ResultTable2 from "../ResultTable2";
import {MakeHttpReq} from "../MakeHttpReq";

export default class ResourceDetailes extends React.Component {
    constructor(props) {
        super(props);
    this.state = {
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
        modalTitle: '',
        showGraph: false
    };

    }


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
                type: obj && obj.type.value || '',
                title: obj && obj.title.value || '',
                date: obj && obj.date.value.match(/\d{4}/) || '',
                creator: obj && obj.creator.value || '',
                creatorLabel: obj && obj.creatorLabel.value || '',
                creatorAltLabel: obj && obj.creatorAltLabel.value.trim().replace(",","") || '',
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
                           optional { <${sub}> edm:begin ?begin.}
                           optional { <${sub}> edm:end ?end.}
                        } 
                    `
        return await MakeHttpReq('sparql', q).then((res) => {
            const obj = res.data.results.bindings[0] ;
            return {
                uri: sub,
                type: obj.type.value ,
                name: obj.name.value ,
                begin: obj.begin && obj.begin.value ,
                end: obj.end && (obj.end.value === 'Alive' ? "" : obj.end.value) ,
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
                               FILTER regex(?end,"${artist.end}")  
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
                                         FILTER regex(?begin,"${artist.begin}")
                            }
                            OPTIONAL {  ?linkedArtist dbo:deathDate ?end.
                                         FILTER regex(?end,"${artist.end}")
                            }
                            FILTER(?type=(dbo:Agent) || ?type=(dbo:Artist) )
                            FILTER (?name="${artist.name}"@en || ?name = "${artist.altName}"@en || ?name = "${artist.altName}" || ?name = "${artist.name}")
                        } 
                    }`
        return await MakeHttpReq('sparql', q).then((res) => {
            return res && res.data.results.bindings
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
                        ?creator rdfs:label ?cN.
                        BIND(REPLACE(?cN, ",", "") AS ?creatorName)
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
                        ?linkedArtwork dc:creator|dc:creator/skos:prefLabel ?c.
                        BIND(REPLACE(?c, ",", "") AS ?creator)
                        OPTIONAL{?linkedArtwork dc:date ?date.
                            FILTER regex(?date,"${artwork.date}")
                        }
                        OPTIONAL{?linkedArtwork dct:medium ?medium.}
                        FILTER (?type = edm:ProvidedCHO || ?type = ore:Proxy || ?type = edm:Proxy)
                        FILTER ((?title = "${artwork.title}" )|| (?title = "${artwork.title}"@en) || (?title = "${artwork.title}"@en-us))
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
        if (results ){
            results.map((federatedArtist) => {
                let begin = federatedArtist.begin && federatedArtist.begin.value
                let end = federatedArtist.end && federatedArtist.end.value
                if (begin !== undefined || end !== undefined) {
                    this.createSameAsRelation(artist.uri, federatedArtist.linkedArtist.value)
                }
            })
        }
    }

    componentDidMount() {
        const theLink = 'http://ct-linkdata.aegean.gr' + this.props.match.url;
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
        })


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

                        q = this.state.prefixes + this.state.query_start + '}';
                        MakeHttpReq('sparql', q).then((res) => {
                            res.data.results.bindings.map((obj) => {

                                    MakeHttpReq('sparql', this.state.query).then((res) => {

                                            this.setState({
                                                http_result: res.data.results.bindings
                                            })
                                        }
                                    );


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
        const theLink = 'http://ct-linkdata.aegean.gr' + this.props.match.url;
        const query = 'query= describe <' + theLink + '>';
        MakeHttpReq('sparql', query, 'application/rdf+xml').then((res) => {
                this.setState({
                    rdf_graph_data: res.data,
                    showModal: true
                })
            }
        );

    };

    showJson = () => {
        const theLink = 'http://ct-linkdata.aegean.gr' + this.props.match.url;
        const query = 'query=describe <' + theLink + '>';
        MakeHttpReq('sparql', query, 'application/ld+json').then((res) => {
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

    showGraph = () => {
        this.setState({
            showGraph: true
        })
    };

    closeGraph = () => {
        this.setState({
            showGraph: false
        })
    };


    render() {
        return (
            <div>
                <div>
                    <ResultTable2 http_result={this.state.http_result} triples={this.state.triples} showGraph={this.state.showGraph}
                                  onCloseGraph={this.closeGraph} detailed_resource={'http://ct-linkdata.aegean.gr' + this.props.match.url}/>
                </div>
                <button className={"btn btn-info"} onClick={this.showTurtle}>RDF-XML</button>
                {this.theModal()}
                <button className={"btn btn-info"} onClick={this.showJson}>JSON-LD</button>
                <button className={"btn btn-info"} onClick={this.showGraph}>Graph</button>
            </div>
        )
    }


}

