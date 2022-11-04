module.exports = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) {
    return res.status(400).send({ message: 'O campo "talk" é obrigatório' });
  }
  next();
};