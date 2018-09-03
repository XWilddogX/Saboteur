function cerrarPartida(id) {
    if (confirm("Seguro que quieres cerrar la partida") == true) {
        window.location.href="/cerrarPartida?id="+id;
    }
}