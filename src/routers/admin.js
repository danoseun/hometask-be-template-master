const { Router } = require("express");
const { getBestProfession, getBestClients } = require("../controllers/admin");

const router = Router();

router.get("/best-profession", getBestProfession);
router.get("/best-clients", getBestClients);

module.exports = router;
