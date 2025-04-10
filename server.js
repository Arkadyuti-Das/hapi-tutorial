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
        },
        {
            plugin: require("@hapi/vision")
        }
    ]);

    server.views({
        engines:{
            hbs: require("handlebars")
        },
        path: path.join(__dirname, "views"),
        layout: "default"
    })

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
                    filename: "welcome.html"
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
                    return h.view("location", {location: request.location.ip});
                }
                return h.view("location", {location: "Location is not enabled"});
            }
        },
        {
            method: "GET",
            path: "/{any*}",      //Any route that doesn't match after /
            handler: (request, h)=>{
                return "404 not found";
            }
        },{
            method: "POST",
            path: "/login",
            handler: (request, h)=>{
                return h.view("index", {username: request.payload.username})
            }
        },{
            method: "GET",
            path: "/dynamic",
            handler: (request, h)=>{
                const data={
                    username: "Abcd"
                };
                return h.view("index", data) //The 1st argument is the file we wanted to render, the 2nd argument is the data we want to send along with the file.
            }
        }
    ]);
}

process.on("unhandledRejection", (error)=>{
    console.log(error);
    process.exit(1);
});

init();