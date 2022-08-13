const socket = io.connect();

class Producto {
    constructor(titulo, precio, foto, id) {
        this.titulo = titulo;
        this.precio = precio;
        this.foto = foto;
        this.id = id || 0;
    }
};

function render(data) {
    const html = data.map((elem, index) => {
        return (`<div>
            <strong>${elem.autor}</strong>:<br>  
            <span style="color: brown; font-size:12px">${elem.fechaHora}</span><br> 
            <em style="color: green">${elem.texto}</em> </div>`)
    }).join(" ");
    document.getElementById('mensajes').innerHTML = html;
}

function renderTabla(listaProductos) {       
    const html = ((listaProductos.length>0)?listaProductos.map((prod, index) => {
        return (`
        <tr >
            <td width="25%">${prod.titulo}</td>
            <td width="10%">${prod.precio}</td>
            <td width="65%"><img class="rounded mx-auto d-block" src="${prod.foto}" width="530px" height="300px" /></td>                
        </tr>
            `)
    }).join(" ") : `<td colspan=3>No hay productos</td>`);    
     
    document.getElementById('cuerpoTabla').innerHTML = html;
}

function nuevoProducto(e) {
    const pr = new Producto(document.getElementById('title').value, parseFloat(document.getElementById('price').value), document.getElementById('thumbnail').value);    

    socket.emit('nuevoProducto', pr);

    return false;
}

function addMessage(e) {

    const fecha = new Date();

    const mensaje = {
        autor: document.getElementById('username').value,
        fechaHora: `${fecha.getDay()}/${fecha.getMonth()}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()} `,
        texto: document.getElementById('texto').value
    };    

    socket.emit('nuevoMensaje', mensaje);

    //El return false previene el funcionamiento del comportamiento por default del submit que hace un refresh de la página, con el 'false' ya se previene esa acción no deseada.
    return false;
}

socket.emit('nuevoUsuario');
socket.on('mensaje', data => { render(data); });
socket.on('nuevoUsuario', data => { render(data); });
socket.on('listaProductos', data => { renderTabla(data);});



