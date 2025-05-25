/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("curtir_duvidas", (table) => {
    table.uuid("usuario_id").notNullable()
      .references("id").inTable("usuarios")
      .onDelete("CASCADE"); // se o usu�rio for deletado, remove o "curtir"

    table.uuid("duvida_id").notNullable()
      .references("id").inTable("duvidas")
      .onDelete("CASCADE");   // se a d�vida for deletada, remove o "curtir"

    table.primary(["usuario_id", "duvida_id"]); // <- chave prim�ria composta   
  

    table.timestamp("criado_em").defaultTo(knex.fn.now());
    
    table.timestamp("modificado_em").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("curtir_duvidas");
};
