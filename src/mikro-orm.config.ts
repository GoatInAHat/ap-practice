import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { Post } from "./entities/Post";

export default {
    migrations: {
        path: path.join(__dirname,"./migrations"),
        pattern: /^[\w-]+\d+.*\.[tj]s$/
    },
    entities: [Post],
    user: 'postgres',
    password: 'parker99',
    dbName: 'lireddit',
    type: 'postgresql',
    debug: false
} as Parameters<typeof MikroORM.init>[0];