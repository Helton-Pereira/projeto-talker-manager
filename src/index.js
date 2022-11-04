const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const str = require('@supercharge/strings');
const validateEmail = require('./middlewares/validateEmail');
const validatePassword = require('./middlewares/validatePassword');
const validateToken = require('./middlewares/validateToken');
const validateName = require('./middlewares/validateName');
const validateAge = require('./middlewares/validateAge');
const validateTalk = require('./middlewares/validateTalk');
const validateWatchedAt = require('./middlewares/validateWatchedAt');
const validateRate = require('./middlewares/validateRate');

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

// Req 8
app.get('/talker/search', validateToken, async (req, res) => {
  const { q } = req.query;
  const talkers = await getTalkers();

  const filteredTalkers = talkers.filter((talker) => talker.name.includes(q));
  return res.status(200).json(filteredTalkers);
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

// Req 3 e 4
app.post('/login',
  validateEmail,
  validatePassword,
  (req, res) => {
  const generatedToken = str.random(16);

    return res.status(200).send({ token: generatedToken });
});

// Req 5
app.post('/talker',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  async (req, res) => {
  const { name, age, talk } = req.body;
  const allTalkers = await getTalkers();
  const newTalker = {
    name,
    age,
    id: allTalkers[allTalkers.length - 1].id + 1,
    talk,
  };

  const updatedTalkers = JSON.stringify([...allTalkers, newTalker]);
  await fs.writeFile(talkersPath, updatedTalkers);

  res.status(201).json(newTalker);
});

// Req 6
app.put('/talker/:id',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  async (req, res) => {
  const { id } = req.params;
  const { name, age, talk } = req.body;
  const allTalkers = await getTalkers();
  const index = allTalkers.findIndex((e) => e.id === Number(id));

  allTalkers[index] = {
    name,
    age,
    id: Number(id),
    talk,
  };

  const updateTalkers = JSON.stringify(allTalkers);
  await fs.writeFile(talkersPath, updateTalkers);

  res.status(200).json(allTalkers[index]);
});

// Req 7
app.delete('/talker/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const allTalkers = await getTalkers();

  const filteredTalkers = allTalkers.filter((talker) => talker.id !== Number(id));
  const updateTalkers = JSON.stringify(filteredTalkers);
  await fs.writeFile(talkersPath, updateTalkers);

  res.status(204).end();
});

app.listen(PORT, () => {
  console.log('Online');
});
