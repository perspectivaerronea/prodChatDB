const socket = io.connect();

class Producto {
    constructor(title, price, thumbnail, id) {
        this.title = title;
        this.price = price;
        this.thumbnail = thumbnail;
        this.id = id || 0;
    }
};

function render(data) {
    const html = data.map((elem, index) => {
        return (`<div>
            <strong>${elem.author}</strong>:<br>  
            <span style="color: brown; font-size:12px">${elem.fechaHora}</span><br> 
            <em style="color: green">${elem.text}</em> </div>`)
    }).join(" ");
    document.getElementById('mensajes').innerHTML = html;
}

function renderTabla(listaProductos) {       
    const html = ((listaProductos.length>0)?listaProductos.map((prod, index) => {
        return (`
        <tr >
            <td width="25%">${prod.title}</td>
            <td width="10%">${prod.price}</td>
            <td width="65%"><img class="rounded mx-auto d-block" src="${prod.thumbnail}" width="530px" height="300px" /></td>                
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
        author: document.getElementById('username').value,
        fechaHora: `${fecha.getDay()}/${fecha.getMonth()}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()} `,
        text: document.getElementById('texto').value
    };    

    socket.emit('nuevoMensaje', mensaje);

    //El return false previene el funcionamiento del comportamiento por default del submit que hace un refresh de la página, con el 'false' ya se previene esa acción no deseada.
    return false;
}

socket.emit('nuevoUsuario');
socket.on('mensaje', data => { render(data); });
socket.on('nuevoUsuario', data => { render(data); });
socket.on('listaProductos', data => { renderTabla(data);});



