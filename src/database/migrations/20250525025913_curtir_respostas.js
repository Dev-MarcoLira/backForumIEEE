/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("curtir_respostas", (table) => {
    table.uuid("usuario_id").notNullable()
      .references("id").inTable("usuarios")
      .onDelete("CASCADE");

    table.uuid("resposta_id").notNullable()
      .references("id").inTable("respostas")
      .onDelete("CASCADE");

    table.primary(["usuario_id", "resposta_id"]);

    table.timestamp("criado_em").defaultTo(knex.fn.now());
    
    table.timestamp("modificado_em").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("curtir_respostas");
};
