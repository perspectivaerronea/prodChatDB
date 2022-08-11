const fs = require('fs');

const express = require('express');
const { Server: IOServer } = require('socket.io');
const { Server: HttpServer } = require('http');

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

const handlebars = require('express-handlebars');
const Contenededor = require('./modulos/contenedor');

class Producto {
    constructor(title, price, thumbnail, id) {
        this.title = title;
        this.price = price;
        this.thumbnail = thumbnail;
        this.id = id || 0;
    }
};

const archivoMensajes = async (nombreArchivo) => {
    try {
        const contenido = await fs.promises.readFile(nombreArchivo, 'utf-8');
        return JSON.parse(contenido);
    } catch(err){
        await fs.promises.writeFile(nombreArchivo, JSON.stringify([], null, 2));
        const contenido = await fs.promises.readFile(nombreArchivo, 'utf-8');        
        return JSON.parse(contenido);
    }
}

const grabarMensajes = async (nombreArchivo, mensajes) => {
    try {
        await fs.promises.writeFile(nombreArchivo, JSON.stringify(mensajes) );
        const contenido = await fs.promises.readFile(nombreArchivo, 'utf-8');        
        return JSON.parse(contenido);
    } catch(err){
        console.log(err);
    }
}

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

const archivo = new Contenededor('./docs/productos.txt');

app.use('/', async (req, res) => {
    const arr = await archivo.getAll();
    const listaProductos = arr;
    res.status(201).render('./partials/tabla', { listaProductos });
});

// El servidor funcionando en el puerto 3000
httpServer.listen(3000, () => console.log('SERVER ON'))

const archMensaje = './docs/mensajes.txt';
io.on('connection', (socket) => {

    socket.on('nuevoUsuario', async () => {     
                
        //Envio Mensajes en el Chat
        const arrMsg = await archivoMensajes(archMensaje);
        io.sockets.emit('mensaje', arrMsg);

        //Envio Lista de Productos
        const arr = await archivo.getAll();
        const listaProductos = arr;        

        io.sockets.emit('listaProductos', listaProductos);
    })

    socket.on('nuevoProducto', async (pr) => {        

        const id = await archivo.save(pr);
        const arr = await archivo.getAll();
        const listaProductos = arr;        

        io.sockets.emit('listaProductos', listaProductos);
    })

    socket.on('nuevoMensaje', async(data) => {
        
        const arrMsg = await archivoMensajes(archMensaje);    
        arrMsg.push(data);
        
        const arrMsgNuevo = await grabarMensajes(archMensaje, arrMsg);                    
        
        io.sockets.emit('mensaje', arrMsgNuevo);
    });
})