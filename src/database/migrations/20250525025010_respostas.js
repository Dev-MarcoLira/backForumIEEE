/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('respostas', (table) => {
    table.uuid('id').primary(); // ID como UUID

    table.uuid('usuario_id').nullable()
      .references('id').inTable('usuarios')
      .onDelete('SET NULL'); // mant�m a resposta mesmo se o usu�rio for deletado

    table.uuid('duvida_id').notNullable()
      .references('id').inTable('duvidas')
      .onDelete('CASCADE'); // se a d�vida for deletada, apaga as respostas

    table.text('descricao').notNullable(); // corpo da resposta

    table.timestamp('criado_em').defaultTo(knex.fn.now()); // registro autom�tico
    
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

