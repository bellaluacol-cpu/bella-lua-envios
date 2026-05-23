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
    const { ciudad, precio, peso } = req.body;

    const response = await axios.post(
      "https://TUAPI.com/api/integration/v1/cotizar",
      {
        destino: {
          nombre: ciudad,
          codigo: ciudad
        },
        origen: {
          nombre: "Bogotá",
          codigo: "11001000"
        },
        IdTipoEntrega: 1,
        IdServicio: 1,
        valorDeclarado: precio,
        peso: peso,
        alto: 10,
        largo: 10,
        ancho: 10,
        fecha: "22-05-2026",
        seguro99: false,
        seguro99plus: false,
        AplicaContrapago: true
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: "Error al cotizar"
    });
  }
});

// INICIAR SERVIDOR
app.listen(3000, async () => {
  console.log("Servidor iniciado");

  await login99();
});