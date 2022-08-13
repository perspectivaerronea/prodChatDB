const express = require('express');
const { Server: IOServer } = require('socket.io');
const { Server: HttpServer } = require('http');

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

const handlebars = require('express-handlebars');
const ContenededorDB = require('./modulos/contendeorDB');

// const { createTable } = require('./manejoDB/createTable');
// const { selectTable } = require('./manejoDB/selectTable');
// const { insertMensaje } = require('./manejoDB/insertTable');

const { options_sqlite3 } = require('./options/SQLite3');
// const knex_mensajes = require('knex')(options_sqlite3);

const { options_mariaDB } = require('./options/mariaDB');
// const knex_productos = require('knex')(options_mariaDB);

class Producto {
    constructor(titulo, precio, foto, id) {
        this.titulo = titulo;
        this.precio = precio;
        this.foto = foto;
        this.id = id || 0;
    }
};

// const archivoMensajes = async () => {

//     let contenido;

//     try {
//         await createTable();
//     } catch (err) {
//         console.log(err);
//     }

// }

// const obtenerMensajes = async () =>{
    
//     let contenido;

//     try {
//         contenido = await selectTable();
//     } catch (err) {
//         console.log(err);
//     }

//     return contenido;
// }

// const grabarMensajes = async (mensajes) => {

//     let contenido;

//     // Inserta las líneas en la tabla
//     try {
//         await insertMensaje(mensajes);
//     } catch (err) {
//         console.log(err);
//     }

//     return await obtenerMensajes();
// }

// Indicamos que queremos cargar los archivos estáticos que se encuentran en dicha carpeta
app.use(express.static('./public'))

//Las siguientes líneas son para que el código reconozca el req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Configuro el Engine para usar HandleBars
app.engine('hbs', handlebars.engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutDir: __dirname + '/views/layouts',
    partialDir: __dirname + '/views/partials'
}))

app.set('views', './views');
app.set('view engine', 'hbs');

const DBMensajes = new ContenededorDB(options_sqlite3, 'mensajes');
const DBProductos = new ContenededorDB(options_mariaDB, 'productos');


app.use('/', async (req, res) => {
    const arr = await DBProductos.getAll();
    const listaProductos = arr;
    res.status(201).render('./partials/tabla', { listaProductos });
});

// El servidor funcionando en el puerto 3000
httpServer.listen(3000, () => console.log('SERVER ON'))

io.on('connection', (socket) => {

    socket.on('nuevoUsuario', async () => {

        //Envio Mensajes en el Chat
        const arrMsg = await DBMensajes.getAll();

        
        io.sockets.emit('mensaje', arrMsg);

        //Envio Lista de Productos
        const arr = await DBProductos.getAll();
        const listaProductos = arr;

        io.sockets.emit('listaProductos', listaProductos);
    })

    socket.on('nuevoProducto', async (data) => {

        const id = await DBProductos.save(data);
        const arr = await DBProductos.getAll();
        const listaProductos = arr;

        io.sockets.emit('listaProductos', listaProductos);
    })

    socket.on('nuevoMensaje', async (data) => {

        await DBMensajes.save(data);

        const arrMsgNuevo = await DBMensajes.obtenerRegistros();

        io.sockets.emit('mensaje', arrMsgNuevo);
    });
})
