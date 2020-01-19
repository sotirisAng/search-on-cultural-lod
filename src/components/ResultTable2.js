import React from 'react'
import {Link} from 'react-router-dom'
import ResourceDetails from "./pages/ResourceDetails";
import {MakeHttpReq} from "./MakeHttpReq";
import {LevenshteinDistance} from "./LevenshteinDistance";
import {CurveLinks} from "./CurveLinks";
import {Curve2} from "./Curve2";


class ResultTable2 extends React.Component {

    state = {
        triples: []
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

    LevenshteinDistance = (a, b) => {
        // Create empty edit distance matrix for all possible modifications of
        // substrings of a to substrings of b.
        const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

        // Fill the first row of the matrix.
        // If this is first row then we're transforming empty string to a.
        // In this case the number of transformations equals to size of a substring.
        for (let i = 0; i <= a.length; i += 1) {
            distanceMatrix[0][i] = i;
        }

        // Fill the first column of the matrix.
        // If this is first column then we're transforming empty string to b.
        // In this case the number of transformations equals to size of b substring.
        for (let j = 0; j <= b.length; j += 1) {
            distanceMatrix[j][0] = j;
        }

        for (let j = 1; j <= b.length; j += 1) {
            for (let i = 1; i <= a.length; i += 1) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                distanceMatrix[j][i] = Math.min(
                    distanceMatrix[j][i - 1] + 1, // deletion
                    distanceMatrix[j - 1][i] + 1, // insertion
                    distanceMatrix[j - 1][i - 1] + indicator, // substitution
                );
            }
        }

        return distanceMatrix[b.length][a.length];
    };

    createSameAsRelation = async (sub, obj) => {
        let askQuery = {
            query: '',
            query_ask: 'ASK WHERE{ ',
            query_insert: 'INSERT { ',
            query_end: ' }',
            prefixes: 'query= prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX owl: <http://www.w3.org/2002/07/owl#>',

        };
        askQuery.query = askQuery.prefixes + askQuery.query_ask + '<' + sub + '> owl:sameAs <' + obj + '>' + askQuery.query_end;
        let res = await MakeHttpReq('sparql', askQuery.query);
        console.log(res.data.boolean);
        if (res.data.boolean) {
            askQuery.query = askQuery.prefixes + askQuery.query_insert + '<' + sub + '> owl:sameAs <' + obj + '>' + askQuery.query_end;
            console.log('askQuery.query');
        }

    };

    http_results = () => {};

    displayRows = () => {
        // if(this.props.triples !== ''){
            let temp = this.props.triples.replace(/\?/g,'').split('. ');
            let tr = [];
            let triples=[];
            // console.log(temp[0]);
            temp.map(triple => {
                tr.push(triple.split(' ') ) ;
            });
            tr.pop();
            console.log(tr);
        // }

        // let result  = this.props.http_result.reduce((res, obj) => {
        //     let n ='';
        //     if (obj.name1) {console.log("name1 = "+obj.name1.value);  n = obj.name1.value;}
        //     if (obj.name2) {console.log("name2 = "+obj.name2.value);  n = obj.name2.value;}
        //     let jaro = this.distance(obj.name.value , n);
        //     if (jaro > 0.85) {
        //         res.push(obj);
        //     }
        //     console.log( 'result = '+ res)
        //     return res;
        // }, []).map((obj, index) => {
        //
        // });
        // results = this.http_results()
        // let c = 1;
        return(
            this.props.http_result.reduce((res, obj) => {
                console.log(obj)
                // c++;
                let n ='';
                let nam = '';
                if (obj.name) {
                    nam = obj.name.value;
                    console.log(nam);
                    if (obj.name1) {console.log("name1 = " +obj.name1.value);  n = obj.name1.value;}
                    else if (obj.name2) {console.log("name2 = " +obj.name2.value);  n = obj.name2.value;}
                    else if (n === ''){
                        console.log('n='+n);
                        res.push(obj);
                    }

                        let jaro = this.distance(nam , n);
                        // let lev = this.LevenshteinDistance(nam, n);
                        console.log(" jaro = "+jaro );
                        if (jaro > 0.95) {
                            // if (jaro > 0.95 && ((1/lev) < 0.1)) {
                            console.log('yes');
                            console.log(obj.artist.value);
                            if(obj.ExternalLink){
                                console.log(obj.ExternalLink.value);
                                this.createSameAsRelation(obj.artist.value, obj.ExternalLink.value)
                            }
                            else if (obj.SameAslLink){
                                console.log(obj.SameAslLink.value);
                                this.createSameAsRelation(obj.artist.value, obj.SameAslLink.value)
                            }
                            // console.log(obj.ExternalLink.value);
                            // this.createSameAsRelation(obj.artist.value, obj.ExternalLink.value)
                            if (obj.name1) delete obj.name1;
                            if (obj.name2) delete obj.name2;
                            res.push(obj);
                        }


                }
                else if (n === ''){
                    // console.log('n='+n);
                    res.push(obj);
                }
                // console.log( 'result = '+ res)
                return res;
            }, []).map((obj, index) =>{
                    const objkeys = Object.keys(obj);
                if(triples !== []) {

                    tr.map(triple => {
                        triples.push(
                            {
                                subject: obj[triple[0]].value,
                                predicate: triple[1],
                                object: obj[triple[2]].value
                            }
                        )
                    })
                    console.log(triples);
                    this.state.triples = triples;
                }
                    // let x = 'cho';
                    // console.log(obj[x].value);
                    // console.log(objkeys);
                    // console.log("name = "+obj.name.value)
                // let n ='';
                //      if (obj.name1) {console.log("name1 = "+obj.name1.value);  n = obj.name1.value;}
                //      if (obj.name2) {console.log("name2 = "+obj.name2.value);  n = obj.name2.value;}
                // let jaro = this.distance(obj.name.value , n)
                //
                // console.log('c = ' + c);
                    return(
                     <tr key={index}>
                         {objkeys.map((v,k) =>

                                // console.log('index = ' + index + ' v= ' + v + ' k= '+k);
                                // var v_s = v.toString()
                             {
                                 let value;
                                 // if (obj[v].type === 'uri' && obj[v].value.includes('mple.')) {console.log(obj[v].value)}
                                 // return (v === 'thumbnail') ? <td><a href={obj[v].value}> {obj[v].value} </a></td> : <td>{obj[v].value}</td>}
                                 if (obj[v].type !== 'uri')  {
                                      value = <td>{obj[v].value}</td> }
                                 else
                                 {  if (obj[v].value.includes('localhost')) { //change search element for new mapping dataset
                                     let id=obj[v].value.split('3000/')[1]
                                     value = <td><Link to={{
                                         pathname: '/'+id,
                                         // path:'/details',
                                         state: {resourceClicked: obj[v].value,
                                            }
                                     }} > {obj[v].value} </Link></td>
                                 } else {
                                     value = <td><a href={obj[v].value}> {obj[v].value} </a></td>
                                 }}
                                 return value
                             }

                         )}
                         {/*<td>{obj.name.value}</td>*/}
                         {/*<td>{obj.cho.value}</td>*/}
                     </tr>
                 )
            }
            )
        )
    };

    displayHeaders = () => {
        if (this.props.http_result[0] !== undefined) {
            const temp = this.props.http_result[0];
            if (temp.name1) delete temp.name1;
            if (temp.name2) delete temp.name2;
            const temp2 = Object.keys(temp);
            // console.log(temp);
            // console.log(temp2);
            return(
                   temp2.map((obj, index) =>
                       <th key={index}>
                           {obj}
                       </th>
                   )
            )
        }
    };

    displayGraph(){
        if (this.state.triples.length > 0 && this.props.showGraph)
            {console.log(this.state.triples)
            return <Curve2 triples={this.state.triples}/>}
    }


    render() {

        return(
            <div>
                { this.displayGraph()}
                <table className='table'>
                    <thead>
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