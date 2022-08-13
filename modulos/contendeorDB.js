

class Contenedor {
    constructor(opcion, tabla) {        
        this.knex = require('knex')(opcion);
        this.tabla = tabla;
        
        this.crearTabla();

    }

    async crearTabla() {

        try {
            if (await this.knex.schema.hasTable(this.tabla)) {
                console.log('La tabla ya existe');
            } else {
                await this.knex.schema.createTable(this.tabla, table => {

                    if (this.tabla == 'productos') {
                        table.increments('id');
                        table.string('titulo');
                        table.float('precio');
                        table.string('foto');
                    } else {
                        table.increments('id');
                        table.string('autor');
                        table.date('fechaHora');
                        table.string('texto');
                    }
                })
                    .then(() => {
                        console.log(`Tabla ${this.tabla} creada`);
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
        } catch (err) {
            console.log(err);
        }

    }

    async insertaRegistros(data) {

        try {

            await this.crearTabla();
            await this.knex(this.tabla).insert(data)
                .then(() => {
                    console.log('Nuevo registro Insertado');
                })
                .catch(err => {
                    console.log(err);
                });
        } catch (err) {
            console.log(err);
        }

    }


    async obtenerRegistros() {

        let contenido;

        await this.crearTabla();
        await this.knex.from(this.tabla).select("*")
            .then(rows => {
                contenido = rows;
            })
            .catch(err => {
                console.log(err);
            });

        return contenido;

    }

    async maximoID() {

        let contenido = {};

        await this.knex.from(this.tabla).select("*").where("ID", "=", `(SELECT MAX(MX.ID) FROM ${this.tabla} MX)`)
            .then(rows => {
                contenido = rows;
            })
            .catch(err => {
                console.log(err);
            });

        return contenido.id;

    }

    async getAll() {
        let contenido;

        try {
            contenido = await this.obtenerRegistros();
        }
        catch (error) {
            // console.log(`El archivo no existe, se va a pasar a la creación del mismo | Nombre del Archivo: ${this.arch}`);
            console.log(error);
        }

        return contenido;
    }

    async save(data) {
        try {

            await await this.insertaRegistros(data);
            return await this.maximoID();

        }
        catch (error) {
            console.log("No se pudo agregar el objeto al archivo.");
            return null;
        }
    }

}

module.exports = Contenedor;