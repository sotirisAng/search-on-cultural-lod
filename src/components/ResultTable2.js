import React from 'react'

class ResultTable2 extends React.Component {


    displayRows = () => {
        return(
            this.props.http_result.map((obj, index) =>{
                    const objkeys = Object.keys(obj);
                    // console.log(obj)
                    // console.log("objkeys = "+objkeys)
                    return(
                     <tr key={index}>
                         {objkeys.map((v,k) =>
                             // var v_s = v.toString()
                             // console.log (obj[v].value)
                             <td>{obj[v].value}</td>
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