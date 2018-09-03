/*
 * Ejemplo de de acceso a la BD de contactos.
 */

var mysql = require("mysql");

var datosConexion = {
    host: "localhost",
    user: "root",
    password: "",
    database: "saboteur"
};

/**
 * Operación de escritura para registrar a un usuario en la base de datos.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.registrarUsuario = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("INSERT INTO USUARIO VALUES ('"+datos.nick+"'," +
                           "'"+datos.pass+"', '"+datos.nombre+"', "+
                           "'"+datos.sexo+"', '"+datos.foto+"',"+
                           "'"+datos.fecha+"')",
            function(err, result) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    conexion.end();
                    resultado(null, true);
                }
            });
        }
    });
};

/**
 * Operación de lectura sobre la base de datos, si encontramos un usuario 
 * al que le encaje la password devolvemos su información (en vez de devolver
 * un 1, de esta manera minimizamos costes de accesos para cargar las fotos)
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.iniciarSesion = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("SELECT * FROM USUARIO WHERE NICK = '"+datos.user+"' AND" +
                           " PASSWORD ='"+datos.pass+"'",
            function(err, result) {
                if (err) resultado(err, null);
                else {
                    conexion.end();
                    if (result.length === 1)
                        resultado(null, result[0]);
                    else 
                        resultado(null, null);
                }
            });
        }
    });
};

/**
 * Operación de escritura sobre la base de datos para crear una partida nueva.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.crearPartida = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("INSERT INTO PARTIDA (ID_CREADOR, NOMBRE, "+
                "NUM_JUGADORES, TURNOS_RESTANTES) VALUES ('"+datos.nick+
                           "','"+datos.nombre+"','"+datos.numjugadores+"','"+
                           datos.restantes+"')",
            function(err, result) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    //Una vez creada la partida, generamos las cartas especiales.
                    conexion.query("INSERT INTO CARTAS (ID_PARTIDA, NOMBRE_CARTA, "+
                        "FILA, COLUMNA, USADA, HIDDEN_BUS, HIDDEN_SAB) VALUES ('"+
                        result.insertId+"','Gold','"+datos.pepitaoro+"','6','1','1','1')");
                    conexion.query("INSERT INTO CARTAS (ID_PARTIDA, NOMBRE_CARTA, "+
                        "FILA, COLUMNA, USADA, HIDDEN_BUS, HIDDEN_SAB) VALUES ('"+
                        result.insertId+"','NoGold','"+datos.normales[0]+"','6','1','1','1')");
                    conexion.query("INSERT INTO CARTAS (ID_PARTIDA, NOMBRE_CARTA, "+
                            "FILA, COLUMNA, USADA, HIDDEN_BUS, HIDDEN_SAB) VALUES ('"+
                            result.insertId+"','NoGold','"+datos.normales[1]+"','6','1','1','1')");
                    conexion.commit();
                    conexion.end();
                    resultado(null, true);
                }
            });
        }
    });
};

/**
 * Operación de escritura sobre la base de datos, hace una baja lógica de una
 * partida.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.cerrarPartida = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("UPDATE PARTIDA SET ACTIVA = '0' WHERE "+
            "ID = '"+datos+"'",
            function(err, result) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    conexion.end();
                    resultado(null, true);
                }
            });
        }
    });
};

/**
 * Operación de escritura sobre la base de datos, vincula a un usuario a una partida
 * a través de la tabla roles.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.unir = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("INSERT INTO ROLES (ROL, ID_JUGADOR, ID_PARTIDA, CARTAS)"+
           "VALUES ('"+datos.rol+"', '"+datos.id_jug+"','"+datos.id_partida+
           "','"+datos.max_cartas+"') ON DUPLICATE KEY UPDATE "+
            "ROL='"+datos.rol+"', ID_JUGADOR='"+datos.id_jug+"', ID_PARTIDA='"+datos.id_partida+"',"+
            " Cartas ='"+datos.max_cartas+"'",
            function(err, result) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    /*Si es el primer usuario que se une a la partida será el 
                    primero en jugar*/
                    if (datos.turno !== null) {
                        conexion.query("UPDATE PARTIDA SET TURNO = '"+datos.turno+
                                "' WHERE ID = '"+datos.id_partida+"'", 
                        function (err, res) {
                            if (err) resultado(err, false);        
                            conexion.commit();
                            conexion.end();
                            resultado(null, true);
                        });
                    }
                    else {
                        conexion.end();
                        resultado(null, true);
                    }
                }
            });
        }
    });
};

/**
 * Operación de lectura sobre la base de datos, carga todas las partidas de la
 * base de datos.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.cargarListaPartidas = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err);
        else {
            conexion.query("SELECT ID, ACTIVA, NOMBRE, DATE(F_CREACION) AS FECHA, "+
                "ID_CREADOR, ID_GANADOR, NUM_JUGADORES AS MAX, TURNOS_RESTANTES, FILAS,"+
                "COLUMNAS, TURNO FROM PARTIDA ",
            function(err, result) {
                if (err) resultado(err);
                else {
                    conexion.end();
                    resultado(null, result);
                }
            });
        }
    });
};

/**
 * Operación de lectura sobre la base de datos, carga los datos de todos los 
 * usuarios de todas las partidas.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.cargarListaJugadoresPorPartida = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err);
        else {
            conexion.query("SELECT * FROM ROLES ",
            function(err, result) {
                if (err) resultado(err);
                else {
                    conexion.end();
                    resultado(null, result);
                }
            });
        }
    });
};

/**
 * Operación de lectura sobre la base de datos, carga los datos de todos los 
 * usuarios de una partida en concreto.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.cargarListaJugadoresPartida = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err);
        else {
            conexion.query("SELECT * FROM ROLES WHERE ID_PARTIDA ='"+datos.id_partida+"'",
            function(err, result) {
                if (err) resultado(err);
                else {
                    conexion.end();
                    resultado(null, result);
                }
            });
        }
    });
};

/**
 * Carga toda la información de una partida y un jugador en concreto 
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.cargarPartida = function (datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err);
        else {
            conexion.query("SELECT * FROM PARTIDA P, ROLES R, CARTAS C WHERE P.ID = "+
                    "'"+datos.id+"'"+"AND R.ID_PARTIDA = '"+datos.id+"' AND R.ID_JUGADOR ="+
                    "'"+datos.nick+"' AND C.ID_PARTIDA = '"+datos.id+"'",
            function(err, result) {
                if (err) resultado(err);
                else {
                    conexion.end();
                    resultado(null, result);
                }
            });
        }
    });
};

/**
 * Carga todos los jugadores en una partida en concreto.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.cargarRoles = function (datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err);
        else {
            conexion.query("SELECT ID_JUGADOR, ROL FROM ROLES R WHERE R.ID_PARTIDA = " 
            +"'"+datos+"'",
            function(err, result) {
                if (err) resultado(err);
                else {
                    conexion.end();
                    resultado(null, result);
                }
            });
        }
    });
};

/**
 * Agrega una carta en la base de datos.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.insertarCarta = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err);
        else {
            conexion.query("INSERT INTO CARTAS (ID_PARTIDA, ID_JUGADOR, NOMBRE_CARTA)"+
                "VALUES ('"+datos.id_partida+"','"+datos.id_jug+"','"+datos.carta+"')",
            function(err) {
                if (err) resultado(err);
                else {
                    conexion.commit();
                    conexion.end();
                    resultado(null, true);
                }
            });
        }
    });
}; 

/**
 * Carga todas las cartas utilizadas de una partida en concreto.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.cargarCartas = function (datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err);
        else {
            conexion.query("SELECT * FROM CARTAS WHERE ID_PARTIDA = '"+datos+"' "+
            "AND USADA = '1'",
            function(err, result) {
                if (err) resultado(err);
                else {
                    conexion.end();
                    resultado(null, result);
                }
            });
        }
    });
};

/**
 * Marca una carta dada como utilizada.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.ponerCarta = function (datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("UPDATE CARTAS SET FILA = '"+datos.fila+"', "+
            " COLUMNA ='"+datos.columna+"', USADA = '1'  WHERE ID_CARTA = '"+datos.id_carta+"'",
            function(err) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    conexion.end();
                    resultado(null, true);
                }
            });
        }
    });
};

/**
 * Destruye una carta a petición (se elimina por temas de optimización)
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.descartarCarta = function (datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("DELETE FROM CARTAS WHERE ID_CARTA = '"+
                    datos.id_carta+"'",
            function(err) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    conexion.end();
                    resultado(null, true);
                }
            });
        }
    });
};

/**
 * Destruye una carta a petición (se elimina por temas de optimización)
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.boom = function (datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("DELETE FROM CARTAS WHERE FILA = '"+
                    datos.fila+"' && COLUMNA = '"+datos.columna+"'",
            function(err) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    //A diferencia de la anterior, la carta bomba se marca como usada
                         conexion.query("UPDATE CARTAS SET USADA = '1'"+
                        " WHERE ID_CARTA = '"+datos.id_carta+"'");
                        conexion.commit();
                        conexion.end();
                        resultado(null, true);
                }
            });
        }
    });
};

/**
 * Deshabilita el modo invisible de una carta de juego.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.mostrarOculta = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            //Muestra esa carta para todos los saboteadores.
            if (datos.rol === "0") {
                conexion.query("UPDATE CARTAS SET HIDDEN_SAB = '0'"+
                " WHERE FILA ='"+datos.fila+"' AND COLUMNA = '6' AND"+
                " ID_PARTIDA = '"+datos.id_partida+"'",
                function(err, result) {
                    if (err) resultado(err, false);
                    else {
                        conexion.commit();
                         conexion.query("UPDATE CARTAS SET USADA = '1'"+
                        " WHERE ID_CARTA = '"+datos.id_carta+"'");
                        conexion.commit();
                        conexion.end();
                        resultado(null, true);
                    }
                });
            }
            //Muestra esa carta para buscadores.
            else if (datos.rol === "1"){
                conexion.query("UPDATE CARTAS SET HIDDEN_BUS = '0'"+
                " WHERE FILA ='"+datos.id_fila+"' AND COLUMNA = '6' AND"+
                " ID_PARTIDA = '"+datos.id_partida+"'",
                function(err, result) {
                    if (err) resultado(err, false);
                    else {
                        conexion.commit();
                        conexion.end();
                        resultado(null, true);
                    }
                });
            }
            //Muestra esa carta para todos los jugadores
            else if (datos.rol === null){
                conexion.query("UPDATE CARTAS SET HIDDEN_BUS = '0', "+
                " HIDDEN_BUS = '0' WHERE FILA ='"+datos.id_fila+
                "' AND COLUMNA = '6' AND"+"ID_PARTIDA = '"+datos.id_partida+"'",
                function(err, result) {
                    if (err) resultado(err, false);
                    else {
                        conexion.commit();
                        conexion.end();
                        resultado(null, true);
                    }
                });
            }
        }
    });
};

/**
 * Destroza (o repara) la herramienta de un jugador a petición.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.manipularHerramienta = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            if (datos.carta === "PicoArreglado") {
                conexion.query("UPDATE ROLES SET HERR_ROTA = '0'"+
                " WHERE ID_JUGADOR ='"+datos.id_jug+"' AND "+
                "ID_PARTIDA = '"+datos.id_partida+"'",
                function(err, result) {
                    if (err) resultado(err, false);
                    else {
                        conexion.commit();
                         conexion.query("UPDATE CARTAS SET USADA = '1'"+
                        " WHERE ID_CARTA = '"+datos.id_carta+"'");
                        conexion.commit();
                        conexion.end();
                        resultado(null, true);
                    }
                });
            }
            else {
                conexion.query("UPDATE ROLES SET HERR_ROTA = '1'"+
                " WHERE ID_JUGADOR ='"+datos.id_jug+"' AND "+
                "ID_PARTIDA = '"+datos.id_partida+"'",
                function(err, result) {
                    if (err) resultado(err, false);
                    else {
                        conexion.commit();
                         conexion.query("UPDATE CARTAS SET USADA = '1'"+
                        " WHERE ID_CARTA = '"+datos.id_carta+"'");
                        conexion.commit();
                        conexion.end();
                        resultado(null, true);
                    }
                });
            }
        }
    });
};

/**
 * Finaliza la partida con una baja lógica y establece el ganador de esta.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.ganar = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("UPDATE PARTIDA SET ACTIVA = '0', ID_GANADOR ='"+
            +datos.rol+"', TURNOS_RESTANTES = '0' WHERE ID = '"+datos.id_partida+"'",
            function(err, result) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    conexion.end();
                    resultado(null, true);
                }
            });
        }
    });
};

/**
 * Modifica el turno de una partida dada.
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.siguienteTurno = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("UPDATE PARTIDA SET TURNOS_RESTANTES = TURNOS_RESTANTES - 1"+
            " WHERE ID = '"+datos.id_partida+"'",
            function(err, result) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    conexion.query("UPDATE PARTIDA SET TURNO = '"+datos.turno+"'"+
                    " WHERE ID = '"+datos.id_partida+"'");
                    conexion.commit();
                    conexion.end();
                    resultado(null, true);
                }
            });
        }
    });
};

/**
 * Agrega un comentario en una partida
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.insertarComentario = function(datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err, false);
        else {
            conexion.query("INSERT INTO COMENTARIOS (ID_JUGADOR, ID_PARTIDA, COMENTARIO)\n\
                 VALUES ('"+datos.id_jug+"',"+"'"+datos.id_partida+"', '"+datos.comentario+"')",
            function(err, result) {
                if (err) resultado(err, false);
                else {
                    conexion.commit();
                    conexion.end();
                    resultado(null, true);
                }
            });
        }
    });
};

/**
 * Carga todos los comentarios de una partida
 * @param {type} datos
 * @param {type} resultado
 * @returns {undefined}
 */
exports.cargarComentarios = function (datos, resultado) {
    var conexion = mysql.createConnection(datosConexion);
    conexion.connect(function(err) {
        if (err) resultado(err);
        else {
            conexion.query("SELECT * FROM COMENTARIOS C JOIN USUARIO U ON "+ 
                "C.ID_JUGADOR = U.NICK WHERE C.ID_PARTIDA = '"+datos.id+"'",
            function(err, result) {
                if (err) resultado(err);
                else {
                    conexion.end();
                    resultado(null, result);
                }
            });
        }
    });
};
