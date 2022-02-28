console.log('Hello World!');

require('source-map-support').install();

import "reflect-metadata";
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { QuestionResolver } from "./resolvers/question";

const main = async () => {

    const app = express();
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [QuestionResolver],
            validate: false
        }),
    });

    apolloServer.applyMiddleware({app});

    app.listen(4000, () => {
        console.log('express server started on localhost:4000');
    })
};

main();