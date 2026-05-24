const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let token = "";

// LOGIN 99 ENVIOS
async function login99() {
  try {
    const response = await axios.post(
      "https://integration1.99envios.app/api/integration/v1/login",
      {
        email: "yosephparra27@gmail.com",
        password: "Familia2711."
      }
    );

    token = response.data.token;

    console.log("Token generado");
  } catch (error) {
    console.log(error.response?.data || error.message);
  }
}

// COTIZAR
app.post("/cotizar", async (req, res) => {

  try {

    const {
      ciudad,
      valor,
      peso,
      alto,
      largo,
      ancho,
      contra
    } = req.body;

    const response = await axios.post(
      "https://api.99envios.com/api/integration/v1/cotizar",
      {
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
        valorDeclarado: valor,
        peso: peso,
        alto: alto,
        largo: largo,
        ancho: ancho,
        fecha: "23-05-2026",
        seguro99: false,
        seguro99plus: false,
        AplicaContrapago: contra
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // escogemos la más barata automáticamente
    const precios = response.data;

    let menor = 999999;

    for (let key in precios) {
      if (precios[key].valor && precios[key].valor < menor) {
        menor = precios[key].valor;
      }
    }

    res.json(response.data);

  } catch (err) {
    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: "Error cotizando"
    });

  }
});

// INICIAR SERVIDOR
app.listen(3000, async () => {
  console.log("Servidor iniciado");

  await login99();
});