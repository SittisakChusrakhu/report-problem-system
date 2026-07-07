const tagRepository = require("../repositories/tag.repository");

exports.getAllTags = async () => {
  return await tagRepository.findAll();
};

exports.createTag = async (name) => {
  return await tagRepository.create(name);
};

exports.deleteTag = async (id) => {
  return await tagRepository.delete(id);
};
