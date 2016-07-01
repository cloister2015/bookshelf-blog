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

  // Define Models

  let User = Bookshelf.Model.extend({
    tableName: 'users'
  });

  let Post = Bookshelf.Model.extend({
    tableName: 'posts',
    hasTimeStamps: true,
    category: function () {
      return this.belongsTo(Category, 'category_id');
    },
    tags: function () {
      return this.belongsToMany(Tag);
    },
    author: function () {
      return this.belongsTo(User);
    }
  });

  let Category = Bookshelf.Model.extend({
    tableName: 'categories',
    posts: function () {
      return this.hasMany(Post, 'category_id');
    }
  });

  let Tag = Bookshelf.Model.extend({
    tableName: 'tags',
    posts: function() {
      return this.belongsToMany(Post);
    }
  });

  // Define Collections

  let Users = Bookshelf.Collection.extend({ model: User });
  let Posts = Bookshelf.Collection.extend({ model: Post });
  let Categories = Bookshelf.Collection.extend({ model: Category });
  let Tags = Bookshelf.Collection.extend({ medel: Tag });

  // Routes

  // Users

  server.route({
    method: 'GET',
    path: '/users',
    config: {
      tags: ['api'],
      description: 'fetch all users',
      notes: 'fetch all users.'
    },
    handler: function (request, reply) {
      return rely('');
    }
  });

  server.route({
    method: 'POST',
    path: '/users',
    config: {
      tags: ['api'],
      description: 'create a new user',
      notes: 'create a new user.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'GET',
    path: '/users/{id}',
    config: {
      tags: ['api'],
      description: 'fetch a single user by id',
      notes: 'fetch a single user by id.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'PUT',
    path: '/users/{id}',
    config: {
      tags: ['api'],
      description: 'update a user',
      notes: 'update a user.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });
  server.route({
    method: 'DELETE',
    path: '/users/{id}',
    config: {
      tags: ['api'],
      description: 'remove a user',
      notes: 'remove user.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  // Categories
  server.route({
    method: 'GET',
    path: '/categories',
    config: {
      tags: ['api'],
      description: 'fetch all categories',
      notes: 'fetch all categories.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'POST',
    path: '/categories',
    config: {
      tags: ['api'],
      description: 'create a new category',
      notes: 'create a new category.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'GET',
    path: '/categories/{id}',
    config: {
      tags: ['api'],
      description: 'fetch a single category',
      notes: 'fetch a single category.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'PUT',
    path: '/categories/{id}',
    config: {
      tags: ['api'],
      description: 'update a category',
      notes: 'update a category.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'DELETE',
    path: '/categories/{id}',
    config: {
      tags: ['api'],
      description: 'remove a category',
      notes: 'remove a category.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  // Posts
  server.route({
    method: 'GET',
    path: '/posts',
    config: {
      tags: ['api'],
      description: 'fetch all posts',
      notes: 'fetch all posts'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'POST',
    path: '/posts',
    config: {
      tags: ['api'],
      description: 'create a new posts',
      notes: 'create a new posts.',
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'GET',
    path: '/posts/{id}',
    config: {
      tags: ['api'],
      description: 'fetch a single post by id',
      notes: 'fetch a single post by id.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'PUT',
    path: '/posts/{id}',
    config: {
      tags: ['api'],
      description: 'update a single post',
      notes: 'update a single post.'
    },
    handler: function (reuqest, reply) {
      return reply('');
    }
  });

  server.route({
    method: 'DELETE',
    path: '/posts/{id}',
    config: {
      tags: ['api'],
      description: 'delete a post',
      notes: 'delete a post.'
    },
    handler: function (request, reply) {
      return reply('');
    }
  });


  server.start((err) => {

    if (err) {
      throw err;
    }

    console.log(`Server running at ${server.info.uri}`);
  });

});
