import supertest from "supertest";

import config from "../../config";
const {url} = config;

let token = ''

// контроллер User

const user = {
//Authorization
    login: (payload) => {
        return supertest(url)
            .post('/Account/v1/Authorized')
            .set('Accept', 'application/json')
            .send(payload)
    },

    token: (payload) => {
        return supertest(url)
            .post('/Account/v1/GenerateToken')
            .set('Accept', 'application/json')
            .send(payload)
    },

    signup: (payload) => {
        return supertest(url)
        .post('/Account/v1/User')
        .set('Accept', 'application/json')
        .send(payload)
    },

    check: (uuid, token) => {
        return supertest(url)
        .get('/Account/v1/User/' + uuid)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
    },

    delete: (uuid, token) => {
        return supertest(url)
        .delete('/Account/v1/User/' + uuid)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
    }
    
}

export default user