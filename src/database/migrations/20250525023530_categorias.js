/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

  exports.up = function (knex) {
  return knex.schema.createTable('categorias', (table) => {
    table.uuid('id').primary(); // UUID

    table.string('tipo', 100).notNullable().unique(); // Ex: JavaScript, Python

    table.timestamp('criado_em').defaultTo(knex.fn.now());
    
    table.timestamp('modificado_em').defaultTo(knex.fn.now());
  });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('categorias');
};