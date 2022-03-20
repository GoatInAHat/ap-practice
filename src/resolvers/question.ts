import { Resolver, Query, Arg, GraphQLTimestamp, ObjectType } from "type-graphql";
import fs from "fs";
import path from "path";

var rawdata:string = fs.readFileSync('questions.json', "utf-8");

const questiondata = JSON.parse(
    rawdata
        .replace('\u00e2', ' ')
        .replace('\u0080\u00b2', '′')
    );

@Resolver()
export class QuestionResolver {
    @Query(() => String)
    async hello() {
        return 'Hello World!';
    }

    @Query(() => String)
    async randomQuestion(
        @Arg("subject") subject: string
    ) {
        return JSON.stringify(questiondata[subject]['questions'][Math.floor(Math.random() * questiondata[subject]['questions'].length)]);
    }

    @Query(() => String)
    async allQuestions(
        @Arg("subject") subject: string
    ) {
        return JSON.stringify(questiondata[subject]['questions']);
    }

    @Query(() => [String])
    async subjectlist(
        @Arg("subject") subject: string
    ) {
        return Object.keys(questiondata);
    }
}

