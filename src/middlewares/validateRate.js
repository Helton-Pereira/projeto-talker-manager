module.exports = (req, res, next) => {
  const { rate } = req.body.talk;

  if (rate == null) {
    return res.status(400).send({ message: 'O campo "rate" é obrigatório' });
  }
  if (rate < 1 || rate > 5 || !Number.isInteger(rate)) {
    return res.status(400).send({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};