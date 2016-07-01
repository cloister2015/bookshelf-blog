'use strict';

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

const Schema = require('./schema');
const sequence = require('when/sequence');
const _ = require('lodash');

function createTable(tableName) {

  return knex.schema.createTable(tableName, function (table) {

    let column;
    let columnKeys = _.keys(Schema[tableName]);

    _.each(columnKeys, function (key) {

      if (Schema[tableName][key].type === 'text' && Schema[tableName][key].hasOwnProperty('fieldtype')) {
        column = table[Schema[tableName][key].type](key, Schema[tableName][key].fieldtype);
      }
      else if (Schema[tableName][key].type === 'string' && Schema[tableName][key].hasOwnProperty('maxlength')) {
        column = table[Schema[tableName][key].type](key, Schema[tableName][key].maxlength);
      }
      else {
        column = table[Schema[tableName][key].type](key);
      }

      if (Schema[tableName][key].hasOwnProperty('nullable') && Schema[tableName][key].nullable === true) {
        column.nullable();
      }
      else {
        column.notNullable();
      }

      if (Schema[tableName][key].hasOwnProperty('primary') && Schema[tableName][key].primary === true ) {
        column.primary();
      }

      if (Schema[tableName][key].hasOwnProperty('unique') && Schema[tableName][key].unique ) {
        column.unique();
      }

      if (Schema[tableName][key].hasOwnProperty('unsigned') && Schema[tableName][key].unsigned) {
        column.unsigned();
      }

      if (Schema[tableName][key].hasOwnProperty('references')) {
        column.references(Schema[tableName][key].references);
      }

      if (Schema[tableName][key].hasOwnProperty('defaultTo')) {
        column.defaultTo(Schema[tableName][key].defaultTo);
      }

    });

  });

};

function createTables() {
  let tables = [];
  let tableNames = _.keys(Schema);
  tables = _.map(tableNames, function (tableName) {
    return function() {
      return createTable(tableName);
    };
  });

  return sequence(tables);
}

createTables()
.then(function() {
  console.log('tables created.');
  process.exit(0);
})
.catch(function (error) {
  throw error;
});
