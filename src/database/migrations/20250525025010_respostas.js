/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('respostas', (table) => {
    table.uuid('id').primary(); // ID como UUID

    table.uuid('usuario_id').nullable()
      .references('id').inTable('usuarios')
      .onDelete('SET NULL'); // mantêm a resposta mesmo se o usuário for deletado

    table.uuid('duvida_id').notNullable()
      .references('id').inTable('duvidas')
      .onDelete('CASCADE'); // se a dúvida for deletada, apaga as respostas

    table.text('descricao').notNullable(); // corpo da resposta

    table.timestamp('criado_em').defaultTo(knex.fn.now()); // registro automâtico
    
    table.timestamp('modificado_em').defaultTo(knex.fn.now()); // idem
  });
};



/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('respostas');
};

