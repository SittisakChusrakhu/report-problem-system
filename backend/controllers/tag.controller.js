const tagService = require("../services/tag.service");

exports.getAllTags = async (req, res) => {
  try {
    const tags = await tagService.getAllTags();

    res.json(tags);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await tagService.createTag(name);

    res.json(tag);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    await tagService.deleteTag(req.params.id);

    res.send("Tag deleted.");
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
