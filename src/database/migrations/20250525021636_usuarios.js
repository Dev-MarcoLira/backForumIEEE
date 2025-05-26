/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('usuarios', (table) => {
    table.uuid('id').primary(); // UUID como chave primária

    table.string('nome').notNullable();

    table.string('email', 150).notNullable().unique(); // varchar(150) com unique

    table.string('senha', 255).notNullable(); // varchar(255) para armazenar hash da senha

    table.timestamp('criado_em').defaultTo(knex.fn.now()); // timestamp de criação
    
    table.timestamp('modificado_em').defaultTo(knex.fn.now()); // timestamp de modificação
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
 return knex.schema.dropTable('usuarios');
};