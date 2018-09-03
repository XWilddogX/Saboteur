/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var exports = module.exports = {};

/**
 * Genera la posición de la carta especial ORO
 * @returns {Number}
 */
exports.generarPepitaOro = function() {
    var posicion = [1, 3, 5];
    return posicion[Math.floor(Math.random()*2)];
    var temp = Math.floor(Math.random()*3);
    if (temp === 2)
        return posicion[2];
    return posicion[temp];
};

/**
 * Genera las posiciones de las cartas especiales NoGOLD
 * @param {type} posGold
 * @returns {Array}
 */
exports.generarNoGold = function(posGold) {
    switch(posGold) {
        case 1: return [3, 5]; break;
        case 3: return [1, 5]; break;
        case 5: return [1, 3]; break;
    }
};

/**
 * Indica el número de turnos de una partida en función del número de jugadores
 * máximos permitidos.
 * @param {type} num_jugadores
 * @returns {Number}
 */
exports.maxTurnos = function(num_jugadores) {
    switch(num_jugadores) {
        case '3': return 50; break;
        case '4': return 45; break;
        case '5': return 40; break;
        case '6': return 40; break;
        case '7': return 35; break;
    }
    return null;
};

/**
 * Indica el número de cartas de una partida en función del número de jugadores
 * máximos permitidos.
 * @param {type} num_jugadores
 * @returns {Number}
 */
exports.numCartasIniciales = function(num_jugadores) {
    switch(num_jugadores) {
        case '3': return 6; break;
        case '4': return 6; break;
        case '5': return 6; break;
        case '6': return 5; break;
        case '7': return 5; break;
    }
    return null;
};

/**
 * Genera un rol para un usuario al entrar en una partida.
 * @param {type} c_sabo
 * @param {type} c_buscadores
 * @param {type} num_jugadores
 * @returns {Number|exports.seleccionarRol.temp}
 */
exports.seleccionarRol = function(c_sabo, c_buscadores, num_jugadores) {
    //Los saboteadores se delimitan con 0, los buscadores con 1
    if (c_sabo === null && c_buscadores === null) {
        var temp = Math.floor(Math.random()*2);
        if (temp === 2)
            return 1;
        return temp;
    }
    else if (c_sabo === null)
        return 0;
    else if (c_buscadores === null)
        return 1;
    else {
        if (num_jugadores === '3' || num_jugadores === '4') {
                if (c_sabo < c_buscadores && c_sabo === 0) 
                    return 0;
                else
                    return 1;
        }
        else if (num_jugadores === '5' || num_jugadores === '6') {
            if (c_sabo < c_buscadores && c_sabo < 2) 
                return 0;
            else
                return 1;
        }
        else if (num_jugadores === '7') {
            if (c_sabo < c_buscadores && c_sabo < 2) 
                return 0;
            else
                return 1;
        }
    }
    return null;
};

/**
 * Hace los cálculos para cambiar el turno al siguiente jugador en una partida.
 * @param {type} jugadores
 * @param {type} actual
 * @returns {unresolved}
 */
exports.siguienteJugador = function(jugadores, actual) {
    var i = 0, encontrado = false;
    while (i < jugadores.length && !encontrado) {
        if (jugadores[i].ID_JUGADOR === actual)
            encontrado = true;
        else i++;
    }
        
    if (i + 1 === jugadores.length)
        return jugadores[0].ID_JUGADOR;
    else
        return jugadores[i + 1].ID_JUGADOR;
};

/**
 * Genera la carta de un jugador
 * @returns {String}
 */
exports.generarCartas = function() {
    var cartas = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10",
    "T11", "T12", "T13", "T14", "T15", "Bomba", "Lupa", "PicoArreglado", "PicoRoto"];
    
    var temp = Math.floor(Math.random()*19);
    if (temp === 19)
        cartas[18];
    return cartas[temp];
};

/**
 * Genera las cartas iniciales un jugador al entrar en una partida
 * @param {type} num_cartas
 * @returns {Array|exports.iniciarlizarCartas.array}
 */
exports.iniciarlizarCartas = function(num_cartas) {
    var array = [];
    var cartas = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10",
    "T11", "T12", "T13", "T14", "T15", "Bomba", "Lupa", "PicoArreglado", "PicoRoto"];
    for (var i = 0; i < num_cartas; i++) {
        var temp = Math.floor(Math.random()*19);
        if (temp === 19)
            array[i] = cartas[18];
        array[i] = cartas[temp];
    }
    return array;
};

/**
 * Comprueba si la posición de la carta "Lupa" es correcta
 * @param {type} fila
 * @param {type} columna
 * @returns {Boolean}
 */
exports.comprobarLupa = function(fila, columna) {
    return ((fila === "1" || fila === "3" || fila === "5") && columna === "6");
};

/**
 * Comprueba que la carta bomba no ataque al vacío o a una carta clave
 * @param {type} cartas
 * @param {type} fila
 * @param {type} columna
 * @returns {Boolean}
 */
exports.comprobarBomba = function(cartas, fila, columna) {
    if (((fila === "1" || fila === "3" || fila === "5") && columna === "6") ||
            fila === "3" && columna === "0") {
        return false;
    }
    else {
        for (var i = 0; i < cartas.length; i++) {
            if (cartas[i].FILA === parseInt(fila) && cartas[i].COLUMNA === parseInt(columna))
                return true;
        }
        return false;
    }
};

/**
 * Comprueba si la posición de una carta es correcta.
 * @param {type} cartas
 * @param {type} fila
 * @param {type} columna
 * @param {type} nombre_carta
 * @returns {Boolean}
 */
exports.comprobarPosicionValida = function(cartas, fila, columna, 
    nombre_carta) {
    //Si la carta se coloca encima de una clave genera error.
    if ((fila === 3 && columna === 0) ||
            (columna === 6 && (fila === 1 || fila === 3 || fila === 5))) {
        return false;
    }
    //Generamos un tablero sobre el que trabajar comodamente.
    var n = 0; 
    var tablero = new Array(7);
    for (var i = 0; i < 7; i++) {
      tablero[i] = new Array(7);
    }
    while (n < cartas.length) {
        if (cartas[n].FILA !== null && cartas[n].COLUMNA !== null) {
            if (cartas[n].FILA === fila && cartas[n].COLUMNA === columna)
                return false;
            else 
                tablero[cartas[n].FILA][cartas[n].COLUMNA] = cartas[n].NOMBRE_CARTA;
        }
        n++;
    }
    tablero[fila][columna] = nombre_carta;
    /*Comprobamos hacia todas las direcciones si la carta puesta es compatible
    con la adyacente*/
    if (comprobarCondiciones(tablero, fila, columna,1,0) ||
    comprobarCondiciones(tablero, fila, columna,-1,0) ||
    comprobarCondiciones(tablero, fila, columna,0,1) ||
    comprobarCondiciones(tablero, fila, columna,0,-1))
        return true;
    else {
        return false;
    }
};

/**
 * Comprueba si existe un ganador en la partida
 * @param {type} cartas
 * @param {type} fila
 * @param {type} columna
 * @param {type} nombre_carta
 * @param {type} restantes
 * @returns {Boolean}
 */
exports.comprobarGanador = function(cartas, fila, columna, 
    nombre_carta, restantes) {
        //Si los turnos son iguales a 0 ganan los saboteadores
        if (restantes - 1 === 0) return true;
        else if (fila !== undefined && columna !== undefined) {
            var n = 0, tablero = new Array(7);
            for (var i = 0; i < 7; i++) {
              tablero[i] = new Array(7);
            }
            while (n < cartas.length) {
                if (cartas[n].FILA !== null && cartas[n].COLUMNA !== null) {
                    if (cartas[n].FILA === fila && cartas[n].COLUMNA === columna)
                        return false;
                    else 
                        tablero[cartas[n].FILA][cartas[n].COLUMNA] = cartas[n].NOMBRE_CARTA;
                }
                n++;
            }
            tablero[fila][columna] = nombre_carta;
            /*Como en la función anterior, comprobamos si la carta adyacente es un
            oro*/
            if (comprobarOros(tablero, fila, columna,1,0) ||
            comprobarOros(tablero, fila, columna,-1,0) ||
            comprobarOros(tablero, fila, columna,0,1) ||
            comprobarOros(tablero, fila, columna,0,-1))
                return true;
            else return false;
        }
    else return false;
};

function comprobarOros(tablero, fila, columna,df,dc) {
    var f = fila + df, c = columna + dc;
    if ((f < 7 && f >= 0) && (c < 7 && c >= 0)) {
        if ((f === 1 && c ===6) || (f === 3 && c ===6) ||  (f === 5 && c ===6)){
            if(tablero[f][c] !== undefined) return tablero[f][c] === "Gold";
        }
        else return false;
    }
    else return false;
}

/**
 * Realiza los calculos para comprobar la compatibilidad de la carta a poner y
 * las adyacentes a esta.
 * @param {type} tablero
 * @param {type} fila
 * @param {type} columna
 * @param {type} df
 * @param {type} dc
 * @returns {Boolean}
 */
function comprobarCondiciones(tablero, fila, columna,df,dc) {
    var f = fila + df, c = columna + dc;
    if ((f < 7 && f >= 0) && (c < 7 && c >= 0)) {
        if (f === 3 && c === 0) 
            return comprobarCarta("Nueva", tablero[fila][columna], df, -dc);
        else if (f === 1 && c ===6) {
            if(tablero[f][c] !== undefined)
                comprobarCarta(tablero[f][c], tablero[fila][columna], df, -dc);
            else
                return true;
        }
        else if (f === 3 && c ===6) {
            if(tablero[f][c] !== undefined)
                comprobarCarta(tablero[f][c], tablero[fila][columna], df, -dc);
            else
                return true;
        }
        else if (f === 5 && c ===6) {
            if(tablero[f][c] !== undefined)
                comprobarCarta(tablero[f][c], tablero[fila][columna], df, -dc);
            else
                return true;
        }
        else
            return comprobarCarta(tablero[f][c], tablero[fila][columna], df, -dc);
    }
};

/**
 * Comprueba la compatibilidad de cartas a través de su nombre
 * @param {type} adyacente
 * @param {type} nueva
 * @param {type} df
 * @param {type} dc
 * @returns {Boolean}
 */
function comprobarCarta(adyacente, nueva, df, dc) {
    switch(adyacente) {
        case 'Nueva':
            if (df === 1) return comprobarHaciaArriba(nueva);
            else if (dc === -1) return comprobarHaciaIzquierda(nueva);
            else if (dc === 1) return comprobarHaciaDerecha(nueva);
            else return comprobarHaciaAbajo(nueva);
            break;
        case 'T1':
            if(df === 1 || dc === -1 || dc === 1) return false;
            else return comprobarHaciaAbajo(nueva);
            break;
        case 'T2':
            if(df === 1 || df === -1 || dc === -1) return false;
            else return comprobarHaciaDerecha(nueva);
            break;
        case 'T3':
            if(df === 1 || dc === -1) return false;
            else {
                if (df === -1) return comprobarHaciaAbajo(nueva);
                else return comprobarHaciaDerecha(nueva);
            }
            break;
        case 'T4':
            if(df === -1 || dc === 1 || dc === -1) return false;
            else return comprobarHaciaArriba(nueva);
            break;
        case 'T5':
            if(dc === 1 || dc === -1) return false;
            else {
                if (df === -1) return comprobarHaciaAbajo(nueva);
                else return comprobarHaciaArriba(nueva);
            }
            break;
        case 'T6':
            if(df === -1 || dc === -1) return false;
            else {
                if (df === 1) return comprobarHaciaArriba(nueva);
                else return comprobarHaciaDerecha(nueva);
            }
            break;
        case 'T7':
            if (dc === -1) return false;
            else {
                if (df === 1) return comprobarHaciaArriba(nueva);
                else if (dc === 1) return comprobarHaciaDerecha(nueva);
                else return comprobarHaciaAbajo(nueva);
            }
            break;
        case 'T8':
            if(df === 1 || df === -1 || dc === 1) return false;
            else return comprobarHaciaIzquierda(nueva);
            break;
        case 'T9':
            if(df === 1 || dc === 1) return false;
            else {
                if (df === -1) return comprobarHaciaAbajo(nueva);
                else return comprobarHaciaIzquierda(nueva);
            }
            break;
        case 'T10':
            if(df === 1 || df === -1) return false;
            else {
                if (dc === 1) return comprobarHaciaDerecha(nueva);
                else return comprobarHaciaIzquierda(nueva);
            }
            break;
        case 'T11':
            if (df === 1) return false;
            else {
                if (dc === -1) return comprobarHaciaIzquierda(nueva);
                else if (dc === 1) return comprobarHaciaDerecha(nueva);
                else return comprobarHaciaAbajo(nueva);
            }
            break;
        case 'T12':
            if(df === -1 || dc === 1) return false;
            else {
                if (df === 1) return comprobarHaciaArriba(nueva);
                else return comprobarHaciaIzquierda(nueva);
            }
            break;
        case 'T13':
            if (dc === 1) return false;
            else {
                if (df === 1) return comprobarHaciaArriba(nueva);
                else if (dc === -1) return comprobarHaciaIzquierda(nueva);
                else return comprobarHaciaAbajo(nueva);
            }
            break;
        case 'T14':
            if (df === -1) return false;
            else {
                if (df === 1) return comprobarHaciaArriba(nueva);
                else if (dc === -1) return comprobarHaciaIzquierda(nueva);
                else return comprobarHaciaDerecha(nueva);
            }
            break;
        case 'T15':
            if (df === 1) return comprobarHaciaArriba(nueva);
            else if (dc === -1) return comprobarHaciaIzquierda(nueva);
            else if (dc === 1) return comprobarHaciaDerecha(nueva);
            else return comprobarHaciaAbajo(nueva);
            break;
        case undefined: return false; break;
    }
};

function comprobarHaciaAbajo(nueva) {
    if (nueva === 'T1' ||nueva === 'T2' || nueva === 'T3' || nueva === 'T8'
                    || nueva === 'T9' || nueva === 'T10' || nueva === 'T11')
                return false;
                else return true;
}

function comprobarHaciaArriba(nueva) {
    if (nueva === 'T4' ||nueva === 'T2' || nueva === 'T6' || nueva === 'T8'
            || nueva === 'T12' || nueva === 'T14' || nueva === 'T10')
        return false;
        else return true;
}

function comprobarHaciaDerecha(nueva) {
    if (nueva === 'T1' || nueva === 'T2' || nueva === 'T3' || nueva === 'T4'
        || nueva === 'T5' || nueva === 'T6' || nueva === 'T7')
        return false;
        else return true;
}

function comprobarHaciaIzquierda(nueva) {
    if (nueva === 'T1' ||nueva === 'T4' || nueva === 'T5' || nueva === 'T8'
        || nueva === 'T9' || nueva === 'T12' || nueva === 'T13') 
        return false;
        else return true;
}