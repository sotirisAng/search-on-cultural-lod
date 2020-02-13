import React from 'react'
import {Link} from 'react-router-dom'
import {Curve2} from "./Curve2";


class ResultTable2 extends React.Component {

    state = {
        triples: []
    };

    displayRows = () => {
            let triples=[];
        if (this.props.http_result.length === 0 && this.props.triples.length !== 0 && this.props.posted===true)
            return <h3>No results</h3>;
        else {
            return(
                this.props.http_result.map((obj, index) =>{
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
                            });
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
                                                value = <td style={{maxWidth: 300, overflow:'hidden'}}>{obj[v].value}</td>;
                                            }
                                            else
                                            {  if (obj[v].value.includes('localhost')) { //change search element for new mapping dataset
                                                let id=obj[v].value.split('3000/')[1];
                                                value = <td style={{maxWidth: 300, overflow:'hidden'}}><Link to={{
                                                    pathname: '/'+id,
                                                    state: {resourceClicked: obj[v].value,
                                                    }
                                                }} > {obj[v].value} </Link></td>
                                            }
                                            else if(k===1 && setImg){
                                                value = <td><img alt={obj[v].value} src={obj[v].value}/></td>
                                            }
                                            else {
                                                value = <td><a href={obj[v].value}> {this.showPrefix(obj[v].value)} </a></td>
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

    displayGraph(){
        if (this.props.showGraph)
            {
            return <Curve2 triples={this.state.triples}/>}
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

                </table>
            </div>
        )
    }
}

export default ResultTable2;