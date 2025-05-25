/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

  exports.up = function (knex) {
  return knex.schema.createTable('duvidas', (table) => {
    table.uuid('id').primary();
    
    table.text('descricao').notNullable();

    table.uuid('usuario_id').notNullable()
      .references('id').inTable('usuarios')
      .onDelete('CASCADE'); // exclui d�vidas se o usu�rio for deletado

    table.uuid('categoria_id').nullable()
      .references('id').inTable('categorias')
      .onDelete('SET NULL'); // mant�m a d�vida se a categoria for deletada

    table.boolean('resolvida').defaultTo(false);

    table.timestamp('criado_em').defaultTo(knex.fn.now());
    
    table.timestamp('modificado_em').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('duvidas');
};
