import { Resolver, Query, Arg, GraphQLTimestamp, ObjectType } from "type-graphql";
import fs from "fs";
import path from "path";

const rawdata = fs.readFileSync(path.resolve(__dirname, 'questions.json'));
const questiondata = JSON.parse(rawdata.toString());

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

