const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const str = require('@supercharge/strings');
const validateEmail = require('./middlewares/validateEmail');
const validatePassword = require('./middlewares/validatePassword');

const app = express();
app.use(bodyParser.json());

app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const talkersPath = path.resolve(__dirname, './talker.json');

const getTalkers = async () => {
  try {
    const data = await fs.readFile(path.resolve(talkersPath));
    const response = await JSON.parse(data);
    return response;
  } catch (error) {
    console.error(`Arquivo não pôde ser lido: ${error}`);
  }
};

// não remova esse endpoint. É para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// Req 1
app.get('/talker', async (req, res) => {
  try {
    const talkers = await getTalkers();
    res.status(200).json(talkers);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Req 2
app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkers = await getTalkers();
  const talker = talkers.find((t) => t.id === Number(id));
  
  if (!talker) {
    return res.status(404).send({ message: 'Pessoa palestrante não encontrada' });
  } 
    return res.status(200).json(talker);
});

// Req 3
app.post('/login',
  validateEmail,
  validatePassword,
  (req, res) => {
  const { email, password } = req.body;
  const generatedToken = str.random(16);
  // Math.random().toString(16).substr(2)

  if (email && password) {
    return res.status(200).send({ token: generatedToken });
  }
});

app.listen(PORT, () => {
  console.log('Online');
});
