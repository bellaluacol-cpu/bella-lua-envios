const ciudades = require("./ciudades");
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*
====================================
CONFIG
====================================
*/

const EMAIL = "yosephparra27@gmail.com";
const PASSWORD = "Familia2711.";

const LOGIN_URL =
  "https://integration1.99envios.app/api/integration/v1/login";

const COTIZAR_URL =
  "https://integration1.99envios.app/api/integration/v1/cotizar";

/*
====================================
TOKEN CACHE
====================================
*/

let token = null;
let tokenTime = null;

/*
====================================
GENERAR TOKEN
====================================
*/

async function login99() {

  try {

    console.log("Generando token...");

    const response = await axios.post(
      LOGIN_URL,
      {
        email: EMAIL,
        password: PASSWORD
      }
    );

    token = response.data.token;
    tokenTime = Date.now();

    console.log("Token generado correctamente");

    return token;

  } catch (error) {

    console.log(
      "ERROR LOGIN:",
      error.response?.data || error.message
    );

    return null;
  }
}

/*
====================================
OBTENER TOKEN
====================================
*/

async function getToken() {

  // si no existe token
  if (!token) {
    return await login99();
  }

  // renovar cada 12 horas
  const horas =
    (Date.now() - tokenTime) / 1000 / 60 / 60;

  if (horas >= 12) {

    console.log("Renovando token...");

    return await login99();
  }

  return token;
}

/*
====================================
HEALTH CHECK
====================================
*/

app.get("/ciudades", (req, res) => {

  const q =
    (req.query.q || "")
    .toLowerCase();

  const resultados =
    ciudades.filter(c =>
      c.label
        .toLowerCase()
        .includes(q)
    )
    .slice(0, 20);

  res.json(resultados);

});

/*
====================================
COTIZAR
====================================
*/

app.post("/cotizar", async (req, res) => {

  try {

    /*
    ==========================
    DATOS FRONTEND
    ==========================
    */

    const {
      ciudad,
      valor,
      peso,
      alto,
      largo,
      ancho,
      contra
    } = req.body;

    /*
    ==========================
    VALIDACIONES
    ==========================
    */

    if (!ciudad) {
      return res.status(400).json({
        error: "Ciudad requerida"
      });
    }

    /*
    ==========================
    TOKEN
    ==========================
    */

    const currentToken =
      await getToken();

    if (!currentToken) {
      return res.status(500).json({
        error: "No se pudo generar token"
      });
    }

    /*
    ==========================
    FECHA
    ==========================
    */

    const hoy = new Date();

    const fecha =
      String(hoy.getDate()).padStart(2, "0")
      + "-"
      + String(hoy.getMonth() + 1).padStart(2, "0")
      + "-"
      + hoy.getFullYear();

    /*
    ==========================
    PAYLOAD 99 ENVIOS
    ==========================
    */

    const payload = {

      destino: {
        nombre: "Destino",
        codigo: ciudad
      },

      origen: {
        nombre: "Bogotá",
        codigo: "11001000"
      },

      IdTipoEntrega: 1,

      IdServicio: 1,

      valorDeclarado: Number(valor),

      peso: Number(peso),

      alto: Number(alto),

      largo: Number(largo),

      ancho: Number(ancho),

      fecha: fecha,

      seguro99: false,

      seguro99plus: false,

      AplicaContrapago: contra
    };

    console.log("Payload enviado:");
    console.log(payload);

    /*
    ==========================
    COTIZAR
    ==========================
    */

    const response = await axios.post(
      COTIZAR_URL,
      payload,
      {
        headers: {
          Authorization:
            `Bearer ${currentToken}`
        }
      }
    );

    /*
    ==========================
    RESPUESTA
    ==========================
    */

    console.log("Cotización exitosa");

    res.json(response.data);

  } catch (error) {

    console.log(
      "ERROR COTIZAR:"
    );

    console.log(
      error.response?.data || error.message
    );

    res.status(500).json({

      error: true,

      mensaje:
        error.response?.data ||
        error.message

    });

  }

});

/*
====================================
VERCEL
====================================
*/

module.exports = app;