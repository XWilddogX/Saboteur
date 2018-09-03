-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-11-2016 a las 12:52:30
-- Versión del servidor: 10.1.16-MariaDB
-- Versión de PHP: 5.6.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `saboteur`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cartas`
--

CREATE TABLE `cartas` (
  `ID_FICHA` int(11) NOT NULL,
  `ID_PARTIDA` int(11) NOT NULL,
  `ID_JUGADOR` varchar(25) NOT NULL,
  `FILA` int(11) DEFAULT NULL,
  `COLUMNA` int(11) DEFAULT NULL,
  `NOMBRE` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `herramienta`
--

CREATE TABLE `herramienta` (
  `ID` int(11) NOT NULL,
  `ROTA` tinyint(4) NOT NULL DEFAULT '0',
  `ID_JUGADOR` varchar(25) NOT NULL,
  `ID_PARTIDA` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partida`
--

CREATE TABLE `partida` (
  `ID` int(11) NOT NULL,
  `F_CREACION` date NOT NULL,
  `ID_CREADOR` varchar(25) NOT NULL,
  `ACTIVA` tinyint(4) NOT NULL DEFAULT '1',
  `ID_GANADOR` varchar(25) DEFAULT NULL,
  `NUM_JUGADORES` int(11) NOT NULL,
  `TURNOS_RESTANTES` int(11) NOT NULL,
  `FILAS` int(11) NOT NULL DEFAULT '7',
  `COLUMNAS` int(11) NOT NULL DEFAULT '7'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `ROL` tinyint(4) NOT NULL DEFAULT '0',
  `ID_JUGADOR` varchar(25) NOT NULL,
  `ID_PARTIDA` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `NICK` varchar(25) NOT NULL,
  `PASSWORD` varchar(35) NOT NULL,
  `NOM_COMPLETO` varchar(125) NOT NULL,
  `SEXO` tinyint(4) NOT NULL,
  `FOTO` blob,
  `FECHA_NAC` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cartas`
--
ALTER TABLE `cartas`
  ADD PRIMARY KEY (`ID_FICHA`),
  ADD KEY `ID_PARTIDA` (`ID_PARTIDA`,`ID_JUGADOR`);

--
-- Indices de la tabla `herramienta`
--
ALTER TABLE `herramienta`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_JUGADOR` (`ID_JUGADOR`),
  ADD KEY `ID_PARTIDA` (`ID_PARTIDA`);

--
-- Indices de la tabla `partida`
--
ALTER TABLE `partida`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID` (`ID`),
  ADD KEY `ID_CREADOR` (`ID_CREADOR`,`ID_GANADOR`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD KEY `ID_JUGADOR` (`ID_JUGADOR`),
  ADD KEY `ID_PARTIDA` (`ID_PARTIDA`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`NICK`),
  ADD UNIQUE KEY `NICK` (`NICK`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
