/**
 * Arquivo: src/controllers/usuario.controller.js
 * Descrição: arquivo responsável pelo CRUD da classe 'Usuario'
 * Data: 27/06/2019
 * Author: Glaucia Lemos
 */

const Yup = require('yup');
const Bcrypt = require('bcrypt');
const Usuario = require('../Models/usuario.model');

// Async & Await:

// ==> Método responsável por criar um novo Usuario:
exports.create = async (req, res) => {
  // Validando o body da requisição
  const schema = Yup.object().shape({
    displayName: Yup.string().required(),
    email: Yup.string().required(),
    senha: Yup.string()
      .required()
      .min(8)
      .max(32),
  });

  // Se o modelo do body for diferente ao do schema a função retorna erro
  if (!(await schema.isValid(req.body))) return res.status(400).json({ error: 'Campos insuficientes' });

  // Encriptando senha
  req.body.senha = Bcrypt.hashSync(req.body.senha, 10);

  const novoUsuario = new Usuario(req.body);

  await novoUsuario.save((err, success) => {
    // Verificando se houve erros ao adicionar os dados
    if (err) {
      // Verificando se o email já está cadastrado
      if (err.name === 'MongoError' && err.code === 11000) {
        // Se estiver cadastrado
        return res
          .status(422)
          .send({ succes: false, message: 'Usuário já cadastrado!' });
      }
      return res.status(422).send({ succes: false, message: err });
    }

    // Se não houver problemas
    return res
      .status(200)
      .send({ message: 'Usuário(a) criado(a) com sucesso!', usuario: success });
  });
};

// ==> Método responsável por selecionar todos os 'Usuários':
exports.findAll = async (req, res) => {
  const usuarios = await Usuario.find({});
  res.status(200).send(usuarios);
};

// ==> Método responsável por selecionar 'Usuário' pelo 'Id':
exports.findById = async (req, res) => {
  const { id } = req.params;
  // Validando o id
  if (!id.match(/^[a-fA-F0-9]{24}$/)) {
    return res.status(400).send({ success: false, error: 'ID mal formatado' });
  }

  await Usuario.findById(id, (err, success) => {
    if (err) {
      return res.status(400).send({ success: false, message: err });
    }
    if (!success) {
      return res
        .status(404)
        .send({ success: false, message: 'Usuário não cadastrado' });
    }

    return res.status(200).send({ success: true, usuario: success });
  });
};

// ==> Método responsável por atualizar 'Usuário' pelo 'Id':
exports.update = async (req, res) => {
  const { id } = req.params;
  // Validando o id
  if (!id.match(/^[a-fA-F0-9]{24}$/)) {
    return res.status(400).send({ success: false, error: 'ID mal formatado' });
  }
  // Validando o body da requisição
  const schema = Yup.object().shape({
    displayName: Yup.string().required(),
    email: Yup.string().required(),
    senha: Yup.string()
      .required()
      .min(8)
      .max(32),
  });

  // Se o modelo do body for diferente ao do schema a função retorna erro
  if (!(await schema.isValid(req.body))) return res.status(400).json({ error: 'Campos insuficientes' });

  // Encriptando senha
  req.body.senha = Bcrypt.hashSync(req.body.senha, 10);

  await Usuario.findByIdAndUpdate(id, req.body, (err, success) => {
    if (err) {
      return res.status(400).send({ success: false, message: err });
    }
    if (!success) {
      return res
        .status(404)
        .send({ success: false, message: 'Usuário não cadastrado' });
    }

    return res.status(200).send({
      success: true,
      message: 'Usuário(a) atualizado(a) com sucesso!',
      usuario: success,
    });
  });
};

// Método responsável por deletar 'Usuário pelo 'Id':
exports.delete = async (req, res) => {
  const { id } = req.params;
  // Validando o id
  if (!id.match(/^[a-fA-F0-9]{24}$/)) {
    return res.status(400).send({ success: false, error: 'ID mal formatado' });
  }

  await Usuario.findByIdAndRemove(id, (err, success) => {
    if (err) {
      return res.status(400).send({ success: false, message: err });
    }
    if (!success) {
      return res
        .status(404)
        .send({ success: false, message: 'Usuário não cadastrado' });
    }

    return res.status(200).send({
      success: true,
      message: 'Usuário(a) excluído com sucesso!',
      usuario: success,
    });
  });
};