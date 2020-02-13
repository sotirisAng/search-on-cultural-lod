// import React from 'react';
import axios from 'axios';

export function MakeHttpReq(urlEnding,query,accept ) {

    let config = {
        headers: {
            'Accept': accept || 'application/json,*/*;q=0.9',
            // 'Accept-Language': 'en-US,el;q=0.7,en;q=0.3',
            // 'Accept-Encoding': 'gzip, deflate',
            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };
    let url = "http://localhost:3030/tdb2MomaCmoa/"+urlEnding;// || "http://192.168.1.8:3030/tdb2MomaCmoa/"+urlEnding;
   return axios.post(url, query , config )
        .then((res) => {
            console.log(res);
                return res;
        }).catch((error) => {
        console.log(error)
    });

}