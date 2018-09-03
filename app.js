var express = require('express');
var path = require('path');
var fs = require('fs');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
var baseDatos = require('./bd');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

var upload = multer({dest: 'public/uploads/'});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

var reglas = require('./reglas');

/*
 * Petición POST obtenida a partir del formulario registro.html
 */
app.post("/registrar", upload.single('file'), function(req, res) {
    var temp = {};
    if (req.file !== undefined) {
        var file = req.file.path + "."+ req.file.mimetype.substr(6);
        fs.rename(req.file.path, file, function(err) {
            if (err)
                res.render('error', {message: "Ocurrió un problema",error: err}); 
        });
        temp.foto = req.file.filename + "." + req.file.mimetype.substr(6);
    }
    else
        temp.foto = null;
    temp.nick = req.body.nick;
    temp.pass = req.body.pass;
    temp.nombre = req.body.nombre;
    temp.sexo = req.body.sexo;
    temp.fecha = req.body.fecha;
    baseDatos.registrarUsuario(temp, function(err, results) {
        if (err !== null)
            res.render('error', {message: "Ocurrió un problema",error: err});  
        if (results)
            res.redirect('/');
    });
});

/*
 * Sistema de carga, verifica si hay una sesión iniciada, en función de ello
 * te redirige a la pantalla principal o a la de bienvenida
 */
app.get("/", function(req, res){
    if (req.cookies.nick === undefined)
        res.render('index', {status: "No hay usuario conectado"});
    else
        res.render('MainWindow', {status: req.cookies.nick, foto: req.cookies.foto});
});

/*
 * Sistema de seguridad, comprueba que un usuario ha iniciado sesión antes
 * de llevarle a la pantalla principal.
 */
app.get("/MainWindow", function(req, res){
    
    if (req.cookies.nick === undefined)
        res.render('index', {status: "No hay usuario conectado", foto: null});
    else {
        res.render('MainWindow', {status: req.cookies.nick, foto: req.cookies.foto});
    }
});

/*
 *  Carga la información de la página de resumen, para ello obtiene el
 *  nombre de usuario y todas las partidas en las que tiene algo que ver
 */
app.get("/mainboard", function(req, res){
    baseDatos.cargarListaPartidas(req.cookies.nick, 
    function(err, results) {
        if (err !== null)
            res.render('internerr', {message: "Ocurrió un problema",error: err}); 
        else {
            baseDatos.cargarListaJugadoresPorPartida(req.cookies.nick, 
            function(err, results_jugadores) {
                if (err !== null) {
                    res.render('error', {
                          message: "Ocurrió un problema",
                          error: err
                        }); 
                    }
                    else {
                        res.render('mainboard', {status: req.cookies.nick, 
                        partida: results, jugadores_part: results_jugadores});
                    }   
            });
        }   
    });
});

/**
 * Carga la página para que el usuario pueda unirse a una de las partidas 
 * disponibles
 */
app.get("/unirse", function(req, res){
    baseDatos.cargarListaPartidas(req.cookies.nick, 
    function(err, results) {
        if (err !== null)
            res.render('internerr', {message: "Ocurrió un problema",error: err}); 
        else {
            baseDatos.cargarListaJugadoresPorPartida(req.cookies.nick, 
            function(err, results_jugadores) {
                if (err !== null)
                    res.render('error',{message: "Ocurrió un problema",error: err}); 
                else {
                    res.render('unirse', {status: req.cookies.nick, 
                    partida: results, jugadores_part: results_jugadores});
                }   
            });
        }   
    });
});

/*
 * Petición POST obtenida para crear una partida, al finalizar redirige a 
 * mainboard
 */
app.post("/crearPartida", function(req, res) {
    var temp = {};
    temp.nick = req.cookies.nick;
    temp.nombre = req.body.nombre;
    temp.numjugadores = req.body.num;
    temp.restantes = reglas.maxTurnos(req.body.num);
    temp.pepitaoro = reglas.generarPepitaOro();
    temp.normales = reglas.generarNoGold(temp.pepitaoro);
    baseDatos.crearPartida(temp, function(err, results) {
        if (err !== null)
            res.render('internerr', {message: "Ocurrió un problema",error: err});  
        if (results)
            res.redirect('/mainboard');
    });
});

/*
 * Petición POST obtenida a partir del formulario login
 */
app.post("/login", function(req, res) {
    baseDatos.iniciarSesion(req.body, function(err, results) {
        if (err !== null)
            res.render('error', { message: "La base de datos ha explotado",
                  error: err
                });        
        if (results !== null) {
            var minute = 600 * 1000;
            res.cookie('nick', req.body.user, { maxAge: minute });
            if (results.FOTO !== null) {
                res.cookie('foto', results.FOTO, { maxAge: minute });
                res.render('MainWindow', {status: req.body.user, 
                    foto: results.FOTO});
            }
            else {
                res.cookie('foto', null, { maxAge: minute });
                res.render('MainWindow', {status: req.body.user, 
                    foto: null});
            }
        }
        else
            res.render('error', {message: "Contraseña incorrecta",
                error: "Reintentalo de nuevo"
            });  
    });
});

/*
 * Petición GET para la página que desconecta al usuario
 */
app.get('/desconectar',function(req, res){
    res.clearCookie("nick");
    res.clearCookie("foto");
    res.render('index', {status: "No hay usuario conectado"});
});

/**
 * Dado un usuario y un id de partida, agrega a este a una partida, para ello
 * le asigna un rol y genera las cartas iniciales.
 */
app.get('/unirsePartida',function(req, res){
    var temp, turno = null;
    baseDatos.cargarRoles(req.query.id_partida, function(err, resultado) {
        if (err !== null)
            res.render('internerr', {message: "Ocurrió un problema", error: err });  
        if (resultado.length === 0) {
            temp = reglas.seleccionarRol(null, null, req.query.max_jug);
            turno = req.query.id_jug;
        }
        else {
            var sab = 0, bus = 0;
            for (var i = 0; i < resultado.length; i++) {
                if (resultado[i].ROL === 0)
                    sab++;
                else if(resultado[i].ROL === 1)
                    bus++;
            }
            temp = reglas.seleccionarRol(sab, bus, req.query.max_jug);
        }
        var datos = {};
        datos.id_jug = req.query.id_jug;
        datos.id_partida = req.query.id_partida;
        datos.rol = temp;
        datos.turno = turno;
        datos.max_cartas = reglas.numCartasIniciales(req.query.max_jug);
        baseDatos.unir(datos, function(err, results) {
        if (err !== null)
            res.render('internerr', { message: "Ocurrió un problema",error: err});  
        if (results) {
            var cartas = reglas.iniciarlizarCartas(datos.max_cartas);
            for (var i = 0; i < cartas.length; i++) {
                var aux = {};
                aux.id_jug = req.query.id_jug;
                aux.id_partida = req.query.id_partida;
                aux.carta = cartas[i];
                aux.usada = 0;
                baseDatos.insertarCarta(aux, function (err, result) {
                    if (err) res.render('internerr', { message: "Ocurrió un problema", 
                        error: err });
                });
            }
            res.redirect('/mainboard');
        }
       });
    });
});

/**
 * Finaliza bruscamente una partida, esto implica que no existe ningún ganador.
 */
app.get('/cerrarPartida',function(req, res){
    baseDatos.cerrarPartida(req.query.id, function(err, results) {
     if (err !== null)
            res.render('internerr', { message: "Ocurrió un problema", error: err});  
        if (results)
            res.redirect('/mainboard');
    });
});

/**
 * Carga una partida a petición del usuario, para ello carga la partida en sí,
 * los usuarios que participan en ella, el turno, los movimientos disponibles
 * y los comentarios.
 */
app.get('/entrarPartida',function(req, res){
    var datos = {};
    datos.id = req.query.id;
    datos.nick = req.cookies.nick;
    baseDatos.cargarPartida(datos, function(err, results) {
        if (err !== null)
            res.render('internerr', { message: "Ocurrió un problema",error: err});  
        if (results) {
            var listaJugadores = [], n = 0;
            for (i = 0; i < results.length; i++) {
                if (listaJugadores.indexOf(results[i].ID_JUGADOR) === -1) {
                    listaJugadores[n] = results[i].ID_JUGADOR;
                    n++;
                }
            }
            baseDatos.cargarComentarios(datos, function(err, coments) {
                if (err !== null)
                    res.render('internerr', { message: "Ocurrió un problema",error: err});  
                if (results)
                   res.render('game', {partida: results, status: req.cookies.nick,
                listajugadores: listaJugadores, comentarios: coments});
            });
        }
    });
});

/*
 * Petición POST obtenida a partir del formulario de registro de usuario.
 */
app.post("/registrar", function(req, res) {
    baseDatos.registrarUsuario(req.body, function(err, results) {
        if (err !== null)
            res.render('error', { message: "Ocurrió un problema", error: err});  
        if (results)
            res.redirect('/');
    });
});

app.get("/mainboard", function(req, res){
    baseDatos.cargarListaPartidas(req.cookies.nick, 
    function(err, results) {
        if (err !== null)
            res.render('internerr', { message: "Ocurrió un problema", error: err }); 
        else {
            baseDatos.cargarListaJugadoresPorPartida(req.cookies.nick, 
            function(err, results_jugadores) {
                if (err !== null)
                    res.render('internerr', { message: "Ocurrió un problema",error: err}); 
                else {
                    res.render('mainboard', {status: req.cookies.nick, 
                    partida: results, jugadores_part: results_jugadores});
                }   
            });
        }   
    });
});

/**
 * Pulsada una carta muestra la página preguntando dónde colocarla, para ello
 * es necesario el usuario conectado, la carta selecciones, el numero restante
 * de movimientos (para comprobar el fin de la partida), el estado de la herra-
 * mienta y el id de la partida.
 */
app.get("/play", function(req, res){
    res.render('play', {user: req.cookies.nick, 
    carta: req.query.carta, id_carta: req.query.idcarta,
    id_partida: req.query.id_partida, rol: req.query.rol_jugador,
    id_jug: req.query.id_jug, rest: req.query.rest, pico: req.query.pico});
});

/**
 * Esta página se carga cuando un usuario selecciona una carta de tipo herramienta
 * Esta función recibe todos los datos de la función play y además se le pasa
 * la lista de todos los jugadores de la partida.
 */
app.get("/herr", function(req, res){
    baseDatos.cargarListaJugadoresPorPartida(req.query.id_partida, 
    function(err, results_jugadores) {
        if (err !== null)
            res.render('internerr', { message: "Ocurrió un problema", error: err}); 
        else {
            res.render('herr', {user: req.cookies.nick, 
            carta: req.query.carta, id_carta: req.query.idcarta,
            id_partida: req.query.id_partida, rol: req.query.rol_jugador,
            id_jug: req.query.id_jug, rest: req.query.rest,
            lista_jugadores: results_jugadores});
        }   
    });
});

/**
 * Función de procesamiento clave del juego.
 * Se invoca cuando el jugador ha seleccionado una carta herramienta y selecciona
 * un usuario al que aplicarla, para ello manipula la herramienta, genera una
 * nueva carta, comprueba si los saboteadores han ganado la partida y, en caso
 * contrario, pasa el turno al siguiente jugador. Al acabar redirige al mainboard
 */
app.get("/herramienta", function(req, res){
    var temp = req.query;
    baseDatos.cargarCartas(temp.id_partida, function(err, cartas) {
        if(err) res.render('internerr', {message: "Ocurrió un problema",error: err});
        else {
            baseDatos.manipularHerramienta(temp, function (err, result) {
                if (err !== null)
                    res.render('internerr', { message: "Ocurrió un problema", error: err }); 
                else {
                    var new_carta = reglas.generarCartas();
                    var cartaNueva = {id_partida: temp.id_partida, id_jug: temp.id_jug,
                    carta: new_carta};
                    var ok = false;
                    baseDatos.insertarCarta(cartaNueva, function (err, ok) {
                        if(err) res.render('internerr', { message: "Ocurrió un problema",
                            error: err });
                        else {
                    resultado = reglas.comprobarGanador(cartas, temp.fila, temp.columna, 
                        temp.carta, temp.rest);
                    if (temp.rest - 1 === 0)
                        temp.rol = 1;
                    if(resultado) {
                        baseDatos.ganar(temp, function (err, ok) {
                            if (err !== null)
                            res.render('internerr', {message: "Ocurrió un problema",error: err}); 
                            else res.redirect("/mainboard");
                        });
                    }
                        baseDatos.cargarRoles(temp.id_partida, function(err, jugadores) {
                            if (err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                            else {
                                var nuevoTurno = reglas.siguienteJugador(jugadores, 
                                temp.id_jug, jugadores[0].MAX);
                                cartaNueva.turno = nuevoTurno;
                                baseDatos.siguienteTurno(cartaNueva, function (err, ok) {
                                    if(err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                                    else res.redirect("/mainboard");
                                });
                            }
                          });
                        }
                    });
                }
            });
        } 
    });
});

/**
 * Función de procesamiento clave del juego.
 * Se invoca cuando el jugador ha seleccionado una carta y selecciona
 * una fila/columna al que aplicarla, para ello comprueba si la posición escogida
 * es válida, genera una nueva carta, comprueba si los hay ganadores y, en caso
 * contrario, pasa el turno al siguiente jugador. Al acabar redirige al mainboard
 */
app.get("/putCard", function(req, res){
    var temp = req.query;
    temp.fila = temp.fila - 1;
    temp.columna = temp.columna - 1;
    if (temp.carta === "Lupa") {
        res.redirect("/usarLupa?id_carta="+temp.id_carta+"&id_jug="+temp.id_jug+
            "&id_partida="+temp.id_partida+"&rest="+temp.rest+"&fila="+temp.fila+
            "&columna="+temp.columna+"&carta="+temp.carta+"&rol="+temp.rol);
    }
    else if (temp.carta === "Bomba") {
        res.redirect("/bomba?id_carta="+temp.id_carta+"&id_jug="+temp.id_jug+
            "&id_partida="+temp.id_partida+"&rest="+temp.rest+"&fila="+temp.fila+
            "&columna="+temp.columna+"&carta="+temp.carta+"&rol="+temp.rol);
    }
    else {
    baseDatos.cargarCartas(temp.id_partida, function(err, cartas) {
        if(err) res.render('internerr', {message: "Ocurrió un problema",error: err});
        else {
        resultado = reglas.comprobarPosicionValida(cartas, temp.fila, temp.columna, 
        temp.carta);
        if (resultado === true) {
            if (temp.pico === '1')
                res.render('internerr', {message: "Ocurrió un problema",error: 
                            "Tu pico está roto"});
            else {
                baseDatos.ponerCarta(temp, function (err, result) {
                    if (err !== null)
                        res.render('internerr', { message: "Ocurrió un problema", error: err }); 
                    else {
                        var cartaNueva = {id_partida: temp.id_partida, id_jug: temp.id_jug,
                        carta: reglas.generarCartas()}, ok = false;
                        baseDatos.insertarCarta(cartaNueva, function (err, ok) {
                            if(err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                            else {
                                ganador = reglas.comprobarGanador(cartas, temp.fila, temp.columna, 
                                    temp.carta, temp.rest);
                                if(ganador) {
                                    if (temp.rest - 1 === 0)
                                        temp.rol = 0;
                                    else temp.rol = 1;
                                    baseDatos.ganar(temp, function (err, ok) {
                                        if (err !== null)
                                        res.render('internerr', {message: "Ocurrió un problema",error: err}); 
                                        else res.redirect("/mainboard");
                                    });
                                }
                                else {
                                    if ((temp.fila === 1 || temp.fila === 3 || temp.fila === 5) && 
                                            temp.columna === 6) {
                                        temp.rol = null;
                                        baseDatos.mostrarOculta(temp, function (err, ok) {
                                            if (err !== null)
                                            res.render('internerr', {message: "Ocurrió un problema",error: err}); 
                                        });
                                    }
                                    baseDatos.cargarRoles(temp.id_partida, function(err, jugadores) {
                                        if (err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                                        else {
                                            cartaNueva.turno = reglas.siguienteJugador(jugadores, 
                                            temp.id_jug, jugadores[0].MAX);
                                            baseDatos.siguienteTurno(cartaNueva, function (err, ok) {
                                                if(err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                                                else res.redirect("/mainboard");
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
        else res.render('internerr', { message: "Ocurrió un problema", error: "Posicion incorrecta" }); 
    }});
    }
});

/**
 * Función de procesamiento clave del juego.
 * Se invoca cuando el jugador ha seleccionado una carta y la quiere eliminar, 
 * genera una nueva carta, comprueba si  hay ganadores y, en caso
 * contrario, pasa el turno al siguiente jugador. Al acabar redirige al mainboard
 */
app.get("/descartaCarta", function(req, res){
    var temp = req.query;
    baseDatos.descartarCarta(temp, function (err, result) {
        if (err !== null)
            res.render('internerr', { message: "Ocurrió un problema", error: err }); 
        else {
            var cartaNueva = {id_partida: temp.id_partida, id_jug: temp.id_jug,
            carta: reglas.generarCartas()}, ok = false;
            baseDatos.insertarCarta(cartaNueva, function (err, ok) {
                if(err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                else {
                    if (temp.rest - 1 === 0) {
                        temp.rol = 0;
                        baseDatos.ganar(temp, function (err, ok) {
                            if (err !== null)
                            res.render('internerr', {message: "Ocurrió un problema",error: err}); 
                            else res.redirect("/mainboard");
                        });
                    }
                    else {
                        baseDatos.cargarRoles(temp.id_partida, function(err, jugadores) {
                            if (err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                            else {
                                var nuevoTurno = reglas.siguienteJugador(jugadores, 
                                temp.id_jug, jugadores[0].MAX);
                                cartaNueva.turno = nuevoTurno;
                                baseDatos.siguienteTurno(cartaNueva, function (err, ok) {
                                    if(err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                                    else res.redirect("/mainboard");
                                });
                            }
                          });
                    }
                }
            });
        }
    });
});

/**
 * Función de procesamiento clave del juego.
 * Se invoca cuando el jugador ha seleccionado una carta lupa, para ello comprueba
 * que se puede utilizar sobre la posición indicada, genera una nueva carta, 
 * comprueba si  hay ganadores y, en casocontrario, pasa el turno al siguiente 
 * jugador. Al acabar redirige al mainboard
 */
app.get("/usarLupa", function(req, res){
    var temp = req.query;
    baseDatos.cargarCartas(temp.id_partida, function(err, cartas) {
        if(err) res.render('internerr', {message: "Ocurrió un problema",error: err});
        else {
        if (reglas.comprobarLupa(temp.fila, temp.columna) === true) {
            var cartaNueva = {id_partida: temp.id_partida, id_jug: temp.id_jug,
            carta: reglas.generarCartas()}, ok = false;
            baseDatos.mostrarOculta(temp, function (err, ok) {
                if(err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                else {

            resultado = reglas.comprobarGanador(cartas, temp.fila, temp.columna, 
                temp.carta, temp.rest);
            if (temp.rest - 1 === 0)
                temp.rol = 1;
            if(resultado) {
                baseDatos.ganar(temp, function (err, ok) {
                    if (err !== null)
                    res.render('internerr', {message: "Ocurrió un problema",error: err}); 
                    else res.redirect("/mainboard");
                });
            }
            else {
                baseDatos.cargarRoles(temp.id_partida, function(err, jugadores) {
                    if (err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                    else {
                        cartaNueva.turno = reglas.siguienteJugador(jugadores, 
                        temp.id_jug, jugadores[0].MAX);
                        baseDatos.siguienteTurno(cartaNueva, function (err, ok) {
                            if(err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                            else res.redirect("/mainboard");
                        });
                    }
                  });
                }
            }
            });
        }
        else res.render('internerr', { message: "Ocurrió un problema", error: "Posicion incorrecta" }); 
    }});
});

/**
 * Función de procesamiento clave del juego.
 * Se invoca cuando el jugador ha seleccionado una carta bomba, para ello comprueba
 * que se puede utilizar sobre la posición indicada, genera una nueva carta, 
 * comprueba si  hay ganadores y, en casocontrario, pasa el turno al siguiente 
 * jugador. Al acabar redirige al mainboard
 */
app.get("/bomba", function(req, res){
    var temp = req.query;
    baseDatos.cargarCartas(temp.id_partida, function(err, cartas) {
        if(err) res.render('internerr', {message: "Ocurrió un problema",error: err});
        else {
        if (reglas.comprobarBomba(cartas, temp.fila, temp.columna) === true) {
            var cartaNueva = {id_partida: temp.id_partida, id_jug: temp.id_jug,
            carta: reglas.generarCartas()}, ok = false;
            baseDatos.boom(temp, function (err, ok) {
                if(err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                else {

            resultado = reglas.comprobarGanador(cartas, temp.fila, temp.columna, 
                temp.carta, temp.rest);
            if (temp.rest - 1 === 0)
                temp.rol = 1;
            if(resultado) {
                baseDatos.ganar(temp, function (err, ok) {
                    if (err !== null)
                    res.render('internerr', {message: "Ocurrió un problema",error: err}); 
                    else res.redirect("/mainboard");
                });
            }
            else {
                baseDatos.cargarRoles(temp.id_partida, function(err, jugadores) {
                    if (err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                    else {
                        cartaNueva.turno = reglas.siguienteJugador(jugadores, 
                        temp.id_jug, jugadores[0].MAX);
                        baseDatos.siguienteTurno(cartaNueva, function (err, ok) {
                            if(err) res.render('internerr', { message: "Ocurrió un problema", error: err });
                            else res.redirect("/mainboard");
                        });
                    }
                  });
                }
            }
            });
        }
        else res.render('internerr', { message: "Ocurrió un problema", error: "Posicion incorrecta" }); 
    }});
});

/**
 * Función para insertar un comentario en una partida, requiere el id del usuario
 * que escribe el comentario y el id de la partida
 */
app.post("/comentario", function(req, res) {
    baseDatos.insertarComentario(req.body, function(err, results) {
        if (err !== null)
            res.render('internerr', { message: "Ocurrió un problema", error: err});  
        if (results)
            res.redirect('/mainboard');
    });
});

// Captura 404 y reenvía al error handle
app.use(function(req, res, next) {
  var err = new Error('No encontrado');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(3000);

module.exports = app;