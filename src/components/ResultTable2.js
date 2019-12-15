import React from 'react'
import {Link} from 'react-router-dom'
import ResourceDetails from "./pages/ResourceDetails";


class ResultTable2 extends React.Component {

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

            weight = weight + l * p * (1 - weight);
        }

        return weight;
    };

    http_results = () => {};

    displayRows = () => {
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
        return(
            this.props.http_result.reduce((res, obj) => {
                // console.log("name = "+ obj.name.value )
                let n ='';
                let nam = undefined;
                if (obj.name) { nam = obj.name.value;}
                // if (obj.name) { }
                if (obj.name1) {console.log("name1 = "+obj.name1.value);  n = obj.name1.value;}
                if (obj.name2) {console.log("name2 = "+obj.name2.value);  n = obj.name2.value;}
                if (n === ''){
                    console.log(n)
                    res.push(obj);
                }
                else if (nam !== undefined){
                    let jaro = this.distance(nam , n);
                    console.log(jaro)
                    if (jaro > 0.95) {
                        console.log('yes')
                        if (obj.name1) delete obj.name1;
                        if (obj.name2) delete obj.name2;
                        res.push(obj);
                    }
                }
                // console.log( 'result = '+ res)
                return res;
            }, []).map((obj, index) =>{
                    const objkeys = Object.keys(obj);
                    // console.log(obj)
                    // console.log("objkeys = "+objkeys)
                //     console.log("name = "+obj.name.value)
                // let n ='';
                //      if (obj.name1) {console.log("name1 = "+obj.name1.value);  n = obj.name1.value;}
                //      if (obj.name2) {console.log("name2 = "+obj.name2.value);  n = obj.name2.value;}
                // let jaro = this.distance(obj.name.value , n)
                //
                // console.log('jaro = ' + jaro);
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
                                 {  if (obj[v].value.includes('mple.')) {
                                     value = <td><Link to={{
                                         pathname: '/details',
                                         state: {resourceClicked: obj[v].value}
                                     }}> {obj[v].value} </Link></td>
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



    render() {

        return(
            <div>
                <table className={'table'}>
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