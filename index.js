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
      Users.forge() //model.forge :: A simple helper function to instantiate a new Model without needing new.
      .fetch()
      .then(function (collection) {
        return reply(collection);
      })
      .catch(function (error) {
        return reply(error);
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/users',
    config: {
      tags: ['api'],
      description: 'create a new user',
      notes: 'create a new user.',
      validate: {
        params: {
          name:  Joi.string().required(),
          email: Joi.string().required()
        }
      }
    },
    handler: function (request, reply) {
      User.forge({
        name: request.params.name,
        email: request.params.email
      })
      .save() // model.save :: A promise resolving to the saved and updated model.
      .then(function (data) {
        return reply(data);
      })
      .catch(function (err) {
        return reply(`${err}`);
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/users/{id}',
    config: {
      tags: ['api'],
      description: 'fetch a single user by id',
      notes: 'fetch a single user by id.',
      validate: {
        params: {
          id: Joi.number().required()
        }
      }
    },
    handler: function (request, reply) {
      User.forge({id:request.params.id})
      .fetch() // Model.fetch :: A promise resolving to the fetched model or null if none exists.
      .then(function (user) {
        if (!user) {
          return reply({});
        } else {
          return reply(user);
        }
      })
      .catch(function(err) {
        return reply(err);
      });
    }
  });

  server.route({
    method: 'PUT',
    path: '/users/{id}',
    config: {
      tags: ['api'],
      description: 'update a user',
      notes: 'update a user.',
      validate: {
        params: {
          id: Joi.number().required(),
          name: Joi.string(),
          email: Joi.string()
        }
      }
    },
    handler: function (request, reply) {
      User.forge({id: request.params.id})
      .fetch({require:true})
      .then(function (user) {
        user.save({
          name: request.params.name || user.get('name'),
          email: request.params.email || user.get('email')
        }).then(function () {
          return reply('user updated successfully');
        }).catch(function (err) {
          return reply(err);
        })
      })
      .catch(function (err) {
        return reply(err);
      });
    }
  });

  server.route({
    method: 'DELETE',
    path: '/users/{id}',
    config: {
      tags: ['api'],
      description: 'remove a user',
      notes: 'remove user.',
      validate: {
        params: {
          id: Joi.number().required()
        }
      }
    },
    handler: function (request, reply) {
      User.forge({id: request.params.id})
      .fetch({require:true})
      .then(function(user) {
          user.destroy()
          .then(function() {
            return reply('user removed successfully.');
          })
          .catch(function (err) {
            return reply(err);
          });
      })
      .catch(function (err) {
        return reply(err);
      })
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
      Categories.forge()
      .fetch()
      .then(function(data) {
        return reply(data);
      })
      .catch(function(err) {
        return reply(err);
      });
    }
  });


  server.route({
    method: 'POST',
    path: '/categories',
    config: {
      tags: ['api'],
      description: 'create a new category',
      notes: 'create a new category.',
      validate: {
        payload: {
          name: Joi.string().required()
        }
      }
    },
    handler: function (request, reply) {
      Category.forge({
        name: request.payload.name
      })
      .save()
      .then(function (category) {
        return reply(category);
      })
      .catch(function (err) {
        return reply(err);
      });
    }
  });
/*
  server.route({
    method: 'GET',
    path: '/categories/{id}',
    config: {
      tags: ['api'],
      description: 'fetch a single category',
      notes: 'fetch a single category.',
      validate: {
        payload: {
          id: Joi.number()
        }
      }
    },
    handler: function (request, reply) {
      Category.forge({
        id: reqeust.payload.id
      })
      .fetch()
      .then(function (category) {
        if(!category) {
          return reply({});
        }
        else {
          return reply(category);
        }
      })
      .catch(function (err) {
        return reply(err);
      });
    }
  });
*/
  server.route({
    method: 'PUT',
    path: '/categories/{id}',
    config: {
      tags: ['api'],
      description: 'update a category',
      notes: 'update a category.',
      validate: {
        payload: {
          id: Joi.number().required(),
          name: Joi.string()
        }
      }
    },
    handler: function (request, reply) {
      Category.forge({
        id: request.payload.id
      })
      .fetch({require:true})
      .then(function (category) {
        category.save({
          name: request.payload.name || category.get('name')
        })
        .then(function () {
          return reply('category updated successfully.');
        })
        .catch(function (err) {
          return reply(err);
        });
      })
      .catch(function (err) {
        return reply(err);
      });
    }
  });


  server.route({
    method: 'DELETE',
    path: '/categories/{id}',
    config: {
      tags: ['api'],
      description: 'remove a category',
      notes: 'remove a category.',
      validate: {
        payload: {
          id: Joi.number().required()
        }
      }
    },
    handler: function (request, reply) {
      Category.forge({
        id: request.payload.id
      })
      .fetch({require:true})
      .then(function (category) {
        category.destroy()
        .then(function () {
          return reply('category removed successfully.');
        })
        .catch(function (err) {
          return reply(err);
        });
      })
      .catch(function (err) {
        return reply(err);
      });
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
