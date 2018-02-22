"use strict";

// content of index.js
const http = require( "http" );
const querystring = require( 'querystring' );
const port = 3000;

const users = [
    {
        name: "John"
    }, {
        name: "Jim"
    }, {
        name: "Jane"
    }, {
        name: "Joe"
    }, {
        name: "Adam"
    }, {
        name: "Scott"
    }, {
        name: "Brandon"
    }, {
        name: "Jones"
    }, {
        name: "Roger"
    }, {
        name: "Rick"
    }, {
        name: "Morty"
    }, {
        name: "Lela"
    }, {
        name: "Wyatt"
    }, {
        name: "Vera"
    }, {
        name: "Sasha"
    }, {
        name: "Albert"
    }, {
        name: "Cole"
    }, {
        name: "Alan"
    }, {
        name: "Dog"
    }, {
        name: "Godin"
    }, {
        name: "Jeremy"
    }, {
        name: "Arkham"
    }, {
        name: "Poe"
    }, {
        name: "Lizzy"
    }, {
        name: "Marie"
    }, {
        name: "Zeke"
    }, {
        name: "Dorian"
    }, {
        name: "Janice"
    }, {
        name: "Elmo"
    }, {
        name: "Finn"
    }, {
        name: "Martin"
    }, {
        name: "John"
    }, {
        name: "Jim"
    }, {
        name: "Jane"
    }, {
        name: "Joe"
    }, {
        name: "Adam"
    }, {
        name: "Scott"
    }, {
        name: "Brandon"
    }, {
        name: "Jones"
    }, {
        name: "Roger"
    }, {
        name: "Rick"
    }, {
        name: "Morty"
    }, {
        name: "Lela"
    }, {
        name: "Wyatt"
    }, {
        name: "Vera"
    }, {
        name: "Sasha"
    }, {
        name: "Albert"
    }, {
        name: "Cole"
    }, {
        name: "Alan"
    }, {
        name: "Dog"
    }, {
        name: "Godin"
    }, {
        name: "Jeremy"
    }, {
        name: "Arkham"
    }, {
        name: "Poe"
    }, {
        name: "Lizzy"
    }, {
        name: "Marie"
    }, {
        name: "Zeke"
    }, {
        name: "Dorian"
    }, {
        name: "Janice"
    }, {
        name: "Elmo"
    }, {
        name: "Finn"
    }, {
        name: "Martin"
    }
];

const requestHandler = ( request, response ) => {
    // Website you wish to allow to connect
    response.setHeader( 'Access-Control-Allow-Origin', '*' );

    // Request methods you wish to allow
    response.setHeader( 'Access-Control-Allow-Methods', 'GET, POST' );

    response.setHeader( 'Content-Type', 'application/json' );

    let body = [];
    request.on( 'error', ( err ) => {
        console.error( err );
        response.status( 500 ).end( "Server error" );
    } ).on( 'data', ( chunk ) => {
        body.push( chunk );
    } ).on( 'end', () => {
        body = Buffer.concat( body ).toString();

        const query = querystring.parse( body );
        const retrieved = parseInt( query.retrieved );
        const retrieve = parseInt( query.retrieve );
        const searchQuery = query.searchQuery.toLowerCase();
        let filteredUsers;

        if (searchQuery.length > 0) {
            // At this point, we have the headers, method, url and body, and can now
            // do whatever we need to in order to respond to this request.
            filteredUsers = users.filter( function( user ) {
                return user.name.toLowerCase().indexOf( searchQuery ) !== -1;
            } );
        } else {
            filteredUsers = users;
        }

        // Get user selection
        const selection = filteredUsers.slice( retrieved, retrieved + retrieve );

        setTimeout( function() {
            response.end( JSON.stringify( { items: selection } ) );
        }, 1000 )

    } );
};

const server = http.createServer( requestHandler );

server.listen( port, ( err ) => {
    if ( err ) {
        return console.log( "something bad happened", err );
    }

    console.log( `server is listening on ${port}` );
} );
