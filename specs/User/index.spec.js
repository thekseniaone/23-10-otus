import supertest from "supertest";
import user from "../helper/user";
import config from "../../config"

describe('user', () => {

    //Авторизация
    describe('POST /Account/v1/Authorized', () => {
        test('Метод должен существовать', async () => {
            const res = await supertest('https://bookstore.demoqa.com')
                .post('/Account/v1/Authorized')
                .send({})
            expect(res.status).not.toEqual(404)
        })

        test('Пользователь существует', async () =>{
            const res = await user.signup(config.credentials)
            expect(res.status == 200 || res.status == 406).toBe(true)
            //swagger возвращает 406, если пользователь существует
        })

        test('Авторизация должна проходить успешно с правильным логином и паролем', async () => {
            await user.token(config.credentials)
            const res = await user.login(config.credentials)
            expect(res.status).toEqual(200)
            expect(JSON.stringify(res.body)).toEqual("true")
        })

        test('Авторизация должна возвращать статус с кодом ошибки, если логин неверный', async () => {
            const res = await user.login({userName:'test19284982374',password: 'Test1234#'})
            expect(res.status).toEqual(404)
            expect(JSON.stringify(res.body.code)).toEqual("\"1207\"")
            expect(JSON.stringify(res.body.message)).toEqual("\"User not found!\"")
        })

        test('Авторизация должна возвращать статус с кодом ошибки, если пароль неверный', async () => {
            const res = await user.login({userName:config.credentials.userName,password: 'Test1234&'})
            expect(res.status).toEqual(404)
            expect(JSON.stringify(res.body.code)).toEqual("\"1207\"")
            expect(JSON.stringify(res.body.message)).toEqual("\"User not found!\"")
        })
    })


    //Получение информации
    describe('GET /Account/v1/User/{UUID}', ()=>{
        test('Метод должен существовать', async () => {
            const res = await supertest('https://bookstore.demoqa.com')
                .post('/Account/v1/User/{UUID}')
                .send({})
            expect(res.status).not.toEqual(404)
        })

        test('Получение информации о существующем авторизованном пользователе', async () => {
            const usernameUnique = 'testuser' + Math.floor(Math.random() * 10000000)
    
            const resCreate = await user.signup({userName: usernameUnique, password:config.credentials.password})
            expect(resCreate.status).toEqual(201)

            const resToken = await user.token({userName: usernameUnique, password:config.credentials.password})
            expect(resToken.status).toEqual(200)

            const res = await user.check(resCreate.body.userID, resToken.body.token)
            expect(res.status).toEqual(200)
            expect(res.body.userId).toEqual(resCreate.body.userID)
        })

        //смысла писать тест "Получение информации о существующем НЕавторизованном пользователе" не вижу,
        //поскольку запрос на получение информации не сработает без токена

        test('Получение информации с некорректным токеном', async () => {
            const usernameUnique = 'testuser' + Math.floor(Math.random() * 10000000)
    
            const resCreate = await user.signup({userName: usernameUnique, password:config.credentials.password})
            expect(resCreate.status).toEqual(201)

            const resToken = await user.token({userName: usernameUnique, password:config.credentials.password})
            expect(resToken.status).toEqual(200)

            const res = await user.check(resCreate.body.userID, resToken.body.token + "test")
            expect(res.status).toEqual(401)
            expect(res.body.message).toEqual('User not authorized!')
        })

        test('Получение информации с некорректным userid', async () => {
            const usernameUnique = 'testuser' + Math.floor(Math.random() * 10000000)
    
            const resCreate = await user.signup({userName: usernameUnique, password:config.credentials.password})
            expect(resCreate.status).toEqual(201)

            const resToken = await user.token({userName: usernameUnique, password:config.credentials.password})
            expect(resToken.status).toEqual(200)

            const res = await user.check(resCreate.body.userID + '-test', resToken.body.token)
            expect(res.status).toEqual(401)
            expect(res.body.message).toEqual('User not found!')
        })
    })

    //Удаление пользователя
    describe('DELETE /Account/v1/User/{UUID}', ()=>{
        test('Метод должен существовать', async () => {
            const res = await supertest('https://bookstore.demoqa.com')
                .post('/Account/v1/User/{UUID}')
                .send({})
            expect(res.status).not.toEqual(404)
        })


        test('Удаление существующего пользователя', async () => {
            const usernameUnique = 'testuser' + Math.floor(Math.random() * 10000000)
    
            const resCreate = await user.signup({userName: usernameUnique, password:config.credentials.password})
            expect(resCreate.status).toEqual(201)

            const resToken = await user.token({userName: usernameUnique, password:config.credentials.password})
            expect(resToken.status).toEqual(200)

            const res = await user.delete(resCreate.body.userID, resToken.body.token)
            expect(res.status).toEqual(204)

            const resCheckAfterDelete = await user.check(resCreate.body.userID, resToken.body.token)
            expect(resCheckAfterDelete.body.message).toEqual("User not found!")


        })

        test('Удаление несуществующего пользователя, неправильный UUID', async () => {
            const usernameUnique = 'testuser' + Math.floor(Math.random() * 10000000)
    
            const resCreate = await user.signup({userName: usernameUnique, password:config.credentials.password})
            expect(resCreate.status).toEqual(201)

            const resToken = await user.token({userName: usernameUnique, password:config.credentials.password})
            expect(resToken.status).toEqual(200)
            
            const res = await user.delete(resCreate.body.userID + "test", resToken.body.token)
            expect(res.body.code).toEqual("1207")
            expect(res.body.message).toEqual("User Id not correct!")
        })

        test('Удаление существующего пользователя с неправильным токеном', async () => {
            const usernameUnique = 'testuser' + Math.floor(Math.random() * 10000000)
    
            const resCreate = await user.signup({userName: usernameUnique, password:config.credentials.password})
            expect(resCreate.status).toEqual(201)

            const resToken = await user.token({userName: usernameUnique, password:config.credentials.password})
            expect(resToken.status).toEqual(200)

            const res = await user.delete(resCreate.body.userID, resToken.body.token + "test")
            expect(res.body.code).toEqual("1200")
            expect(res.body.message).toEqual("User not authorized!")
        })

    })
    
})