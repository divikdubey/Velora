const express = require("express");

const router = express.Router();

const {
  chatWithAI,
  renderAIPage
} = require("../controllers/aiController");


router.get("/",renderAIPage);
router.post("/chat", chatWithAI);



module.exports = router;