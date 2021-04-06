import React from 'react'
import {Link} from 'react-router-dom'
import {Curve2} from "./Curve2";

const PAGE_SIZE = 10

class ResultTable2 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            triples: [],
            total_pages: 1,
            current_page: 1,
            offset: 0,
            first_page: true,
            last_page: false
        };

    }


    displayRows = () => {
            let triples=[];
        if (this.props.http_result.length === 0 && this.props.triples.length !== 0 && this.props.posted===true)
            return <h3>No results</h3>;
        else {
            let results_to_show = this.props.http_result < PAGE_SIZE ? this.props.http_result : this.props.http_result.slice(this.state.offset, this.state.offset + PAGE_SIZE)
                return(
                    results_to_show.map((obj, index) =>{
                        const objkeys = Object.keys(obj);
                        if(this.props.triples.length > 0 ) {
                            this.props.triples.map(triple => {
                                if(obj[triple[0]] !== undefined && obj[triple[2]] !== undefined)
                                    triples.push(
                                        {
                                            subject: obj[triple[0]].value,
                                            predicate: triple[1],
                                            object: obj[triple[2]].value
                                        }
                                    )
                                return triples
                            });
                            // this.setState({
                            //     triples: triples
                            // })
                            this.state.triples = triples;
                        }
                        let setImg = false;
                        return(
                            <tr key={index}>
                                {
                                    objkeys.map((v,k) =>
                                        {
                                            if(k===0 && obj[v].value === 'http://www.europeana.eu/schemas/edm/hasView') {
                                                setImg = true;

                                            }
                                            let value;
                                            if (obj[v].type !== 'uri')  {
                                                value = <td key={index+ k} style={{maxWidth: 300, overflow:'hidden'}}>{obj[v].value}</td>;
                                            }
                                            else
                                            {  if (obj[v].value.includes('http://ct-linkdata.aegean.gr/museum_data')) { //change search element for new mapping dataset
                                                let id=obj[v].value.split('museum_data/')[1];
                                                value = <td key={index+ k} style={{maxWidth: 300, overflow:'hidden'}}><Link to={{
                                                    pathname: '/'+id,
                                                    state: {resourceClicked: obj[v].value,
                                                    }
                                                }} > {obj[v].value} </Link></td>
                                            }
                                            else if(k===1 && setImg){
                                                value = <td key={index+ k}><img alt={obj[v].value} src={obj[v].value}/></td>
                                            }
                                            else {
                                                value = <td key={index+ k}><a href={obj[v].value}> {this.showPrefix(obj[v].value)} </a></td>
                                            }}
                                            return value
                                        }

                                    )}
                            </tr>
                        )
                    }
                )
            )
        }

    };


    nextPage = () => {
        this.setState({
            current_page: this.state.current_page + 1,
            offset: this.state.offset + PAGE_SIZE,
            last_page: (this.state.current_page + 1) === Math.ceil(this.props.http_result.length / PAGE_SIZE),
            first_page: (this.state.current_page + 1) === 1
        })
    }

    previousPage = () => {
        this.setState({
            current_page: this.state.current_page - 1,
            offset: this.state.offset - PAGE_SIZE,
            first_page: (this.state.current_page - 1) === 1,
            last_page: (this.state.current_page - 1) === Math.ceil(this.props.http_result.length / PAGE_SIZE),
        })
    }

    showPrefix = (url) =>{
        switch(url) {
            case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':
                return 'rdf:type';
            case 'http://www.europeana.eu/schemas/edm/end':
                return 'edm:end';
            case 'http://www.europeana.eu/schemas/edm/begin':
                return 'edm:begin';
            case 'http://www.w3.org/2004/02/skos/core#note':
                return 'skos:note';
            case 'http://www.w3.org/2004/02/skos/core#prefLabel':
                return 'skos:prefLabel';
            case 'http://www.europeana.eu/schemas/edm/EuropeanaAggregation':
                return 'edm:EuropeanaAggregation';
            case 'http://www.europeana.eu/schemas/edm/aggregatedCHO':
                return 'edm:aggregatedCHO';
            case 'http://www.europeana.eu/schemas/edm/hasView':
                return 'edm:hasView';
            case 'http://www.europeana.eu/schemas/edm/ProvidedCHO':
                return 'edm:ProvidedCHO';
            case 'http://purl.org/dc/elements/1.1/date':
                return 'dc:date';
            case 'http://purl.org/dc/elements/1.1/title':
                return 'dc:title';
            case 'http://purl.org/dc/elements/1.1/type':
                return 'dc:type';
            case 'http://purl.org/dc/elements/1.1/creator':
                return 'dc:creator';
            case 'http://purl.org/dc/terms/medium':
                return 'dct:medium';
            case 'http://www.w3.org/2002/07/owl#sameAs':
                return 'owl:sameAs';
            case 'http://www.openarchives.org/ore/terms/isAggregatedBy':
                return 'ore:isAggregatedBy';
            default:
            return url;
        }
    };


    displayHeaders = () => {
        if (this.props.http_result[0] !== undefined) {
            const temp = this.props.http_result[0];
            if (temp.name1) delete temp.name1;
            if (temp.name2) delete temp.name2;
            const temp2 = Object.keys(temp);
            return(
                   temp2.map((obj, index) =>
                       <th key={index} >
                           {obj.toLocaleUpperCase()}
                       </th>
                   )
            )
        }
    };

    displayGraph = () => {
        if (this.props.showGraph) {
            return (
                <div className="modal fade bd-example-modal-lg show" tabIndex="-1" role="dialog"
                     style={{display: 'block'}}
                     hidden={!this.props.showGraph}
                     aria-labelledby="myLargeModalLabel">
                    <div className="modal-dialog modal-xl modal-dialog-scrollable ">
                        <div className="modal-content mx-auto">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLongTitle">Results as Directed Graph</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                        onClick={this.props.onCloseGraph}>
                                    <h1 aria-hidden="true">&times;</h1>
                                </button>
                            </div>
                            <div className="modal-body">
                                <Curve2 triples={this.state.triples} />
                            </div>
                        </div>
                    </div>
                </div>

            )
        }

        // if (this.props.showGraph)
        //     {
        //     return <Curve2 triples={this.state.triples}/>}
    }


    render() {
        return(
            <div>
                { this.displayGraph()}
                <table className='table table-striped'>
                    <thead className={'thead-dark'}>
                    <tr>
                        {this.displayHeaders()}
                    </tr>
                    </thead>
                    <tbody>
                    {this.displayRows()}
                    </tbody>
                    <tfoot hidden={Math.ceil(this.props.http_result.length / PAGE_SIZE) < 2}>
                    <tr>
                        <td className={'col-4'}>
                            <button className={'btn btn-secondary btn-lg btn-block'} onClick={this.previousPage}
                                    disabled={this.state.first_page}>
                                Previous
                            </button>
                        </td>
                        <td className={'col-4'}>
                            Page {this.state.current_page} of {Math.ceil(this.props.http_result.length / PAGE_SIZE)}
                        </td>
                        <td className={'col-4'}>
                            <button className={'btn btn-secondary btn-lg btn-block'} onClick={this.nextPage}
                                    disabled={this.state.last_page}>
                                Next
                            </button>
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        )
    }
}

export default ResultTable2;