'use strict';
const _ = require('lodash');
const Promise = require('bluebird');
const Boom = require('boom');
const Joi = require('joi');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const Good = require('good');
const Blipp = require('blipp');
const HapiSwagger = require('hapi-swagger');

const server = new Hapi.Server();
server.connection({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 8080
});

const knex = require('knex')({
  client: process.env.BLOG_DB_CLIENT || 'mysql',
  connection: {
    host: process.env.BLOG_DB_HOST || '0.0.0.0',
    user: process.env.BLOG_DB_USER || 'root',
    password: process.env.BLOG_DB_PASSWORD || 'melanielaurent',
    database: process.env.BLOG_DB_DATABASE || 'blog',
    charset: process.env.BLOG_DBCHARSET || 'utf8'
  }
});

const Bookshelf = require('bookshelf')(knex);

server.register([
{ register: Inert },
{ register: Vision },
{ register: HapiSwagger },
{ register: Good, 
  options: {
    ops: {
      interval: 1000
    },
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', response: '*' }]
      }, {
        module: 'good-console'
      }, 'stdout'],
      http: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ error: '*'}],
      }]
    }
  }
},
{ register: Blipp }
], (err) => {

  if (err) {
    throw err;
  }

  server.route({
    method: 'GET',
    path: '/',
    config: {
      tags: ['api'],
      description: '/',
      notes: '/',
    },
    handler: function (request, reply) {
      return reply('index');
    }
  });
  

  server.start((err) => {

    if (err) {
      throw err;
    }
    
    console.log(`Server running at ${server.info.uri}`);
  });

});

