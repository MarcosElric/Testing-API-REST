const express = require("express");

const router = express.Router();

router.get("/activities", (req, res) => {
  const queryString = "SELECT * FROM blv_detalle_act";

  connection.query(queryString, (err, rows, fields) => {
    if (err) {
      console.log("Error: " + err);
      res.end();
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
