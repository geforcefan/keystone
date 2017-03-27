import path from 'path'

let root = path.join(__dirname, "..", "..", "..");
let server = path.join(root, "src", "server");
let client =  path.join(root, "src", "client");

export default {
    root: root,
    locales: path.join(root, "locales"),
    server: {
        routes: path.join(server, "routes"),
        services: path.join(server, "services"),
        setup: path.join(server, "setup"),
        schedules: path.join(server, "schedules"),
    },
    views: path.join(root, "src", "views"),
    static: path.join(root, "src", "static"),
};