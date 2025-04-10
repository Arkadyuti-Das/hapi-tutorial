"use strict"

const Hapi=require("@hapi/hapi");
const path=require("path");

const init=async()=>{
    const server=Hapi.server({
        port: 3000,
        host: "localhost",
        routes:{
            files:{
                relativeTo: path.join(__dirname, "static")
            }
        }
    });

    await server.start();
    console.log(`Server started on: ${server.info.uri}`);

    await server.register([
        {
            plugin: require("hapi-geo-locate"),
            options:{
                enabledByDefault: true
            }
        },
        {
            plugin: require("@hapi/inert")
        }
    ]);

    server.route([
        {
            method: "GET",
            path: "/",
            handler: (request, h)=>{
                // return "Hello World";
                return h.file("welcome.html");
            }
        },
        {
            method: "GET",
            path: "/download",
            handler: (request, h)=>{
                return h.file("welcome.html", {
                    mode: "inline",
                    filename: "welcome-file.html"
                })
            }
        },
        {
            method: "GET",
            path: "/users/{username?}",      //{username} means that after /users/ I need to put something. To make it optional use {username?}
            handler: (request, h)=>{
                const user=request.params.username? request.params.username: "stranger";
                return `Hello ${user}`;
            }
        },
        {
            method: "GET",
            path: "/location",
            handler: (request, h)=>{
                if (request.location){
                    return request.location;
                }
                return "Location not enabled";
            }
        },
        {
            method: "GET",
            path: "/{any*}",      //Any route that doesn't match after /
            handler: (request, h)=>{
                return "404 not found";
            }
        }
    ]);
}

process.on("unhandledRejection", (error)=>{
    console.log(error);
    process.exit(1);
});

init();