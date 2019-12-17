import React from 'react';
import axios from 'axios';

export function MakeHttpReq(urlEnding,query ) {

    let config = {
        headers: {
            'Accept': 'application/sparql-results+json,*/*;q=0.9',
            // 'Accept-Language': 'en-US,el;q=0.7,en;q=0.3',
            // 'Accept-Encoding': 'gzip, deflate',
            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };
    let url = "http://localhost:3030/test3/"+urlEnding
   return axios.post(url, query , config )
        .then((res) => {
            console.log(res);
                return res;
        }).catch((error) => {
        console.log(error)
    });

}