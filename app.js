//Import express and create app
const express = require("express");
const app = express();
//Import morgan for perfomance measurement
const morgan = require("morgan");
//Import bodyParser for POST requests
const bodyParser = require("body-parser");

//Import MySQL connection Pool
const pool = require("./database");

//Pool lifecycle events just for fun
pool.on("acquire", function(connection) {
  //console.log("Connection %d acquired", connection.threadId);
});
pool.on("connection", function(connection) {
  //console.log("New connection");
});
pool.on("enqueue", function() {
  console.log("Waiting for available connection slot");
});
pool.on("release", function(connection) {
  //console.log("Connection %d released", connection.threadId);
});

//Make our app use morgan and bodyparser
app.use(morgan("short"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Setup port variable
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Hellou");
  res.end();
});

//ROUTES FOR API

let router = express.Router();

//middleware to use for all requests
router.use(function(req, res, next) {
  //We can use this middleware to do analitics
  //To check the request for vulnerabilities
  //Throw errors if something is wrong... a lot of cool things
  console.log("Something is happening");
  //We need to do this to indicate to our app that it should continue to other routes or it will stop here
  next();
});
//Test route
router.get("/", function(req, res) {
  res.json({ message: "Heeey, welcome to our API" });
});

// ACTIVITYDATA ROUTE
router.route("/activities").get(function(req, res) {
  const queryString = "SELECT * FROM blv_detalle_act";
  pool.query(queryString, (err, results, fields) => {
    if (err) {
      console.log("ERROR : " + err);
      res.sendStatus(500);
      res.end();
      return;
    }
    res.json(results);
  });
});

router.route("/activities/:id_activity").get(function(req, res) {
  const activityID = req.params.id_activity;
  const queryString = `SELECT * FROM blv_detalle_act WHERE id_actividad = ?`;
  pool.query(queryString, [activityID], (err, results, fields) => {
    if (err) {
      console.log("ERROR : " + err);
      res.sendStatus(500);
      res.end();
      return;
    }
    res.json(results);
  });
});

//USERS ROUTE
router
  .route("/users")
  .post(function(req, res) {
    let user = { uuid: "default", info: "default" }; //I should Implement some kind of struct for the user, for now this is fine
    console.log(req.body);
    user.uuid = req.body.uuid; //The name to set is on the request
    user.info = req.body.info;

    const queryString = "INSERT INTO blv_act_realiz (uuid, info) VALUES (?,?)";
    pool.query(queryString, [user.uuid, user.info], (err, results, fields) => {
      if (err) {
        console.log("ERROR : " + err);
        res.sendStatus(500);
        res.end();
        return;
      }
      res.json({ message: "User inserted", userID: results.insertId });
      res.end();
    });
  })
  .get(function(req, res) {
    const queryString = "SELECT * FROM blv_act_realiz";
    pool.query(queryString, (err, results, fields) => {
      if (err) {
        console.log("ERROR : " + err);
        res.sendStatus(500);
        res.end();
        return;
      }
      res.json(results);
    });
  });

//USERS/:USERSID ROUTE
router
  .route("/users/:user_id")
  .get(function(req, res) {
    const userId = req.params.user_id;
    const queryString = `SELECT * FROM blv_act_realiz WHERE id = ${userId}`;
    pool.query(queryString, (err, results, fields) => {
      if (err) {
        console.log("ERROR : " + err);
        res.sendStatus(500);
        res.end();
        return;
      }
      res.json(results);
    });
  })
  .put(function(req, res) {
    const userID = req.params.user_id;
    const newUUID = req.body.uuid;
    queryString = ` UPDATE blv_act_realiz SET uuid =  ? WHERE id = ? `;
    pool.query(queryString, [newUUID, userID], (err, results, fields) => {
      if (err) {
        console.log("ERROR : " + err);
        res.sendStatus(500);
        res.end();
        return;
      }
      res.json(results);
    });
  })
  .delete(function(req, res) {
    const userID = req.params.user_id;
    queryString = "DELETE FROM blv_act_realiz WHERE id = ?";
    pool.query(queryString, [userID], (err, results, fields) => {
      console.log(`FIELDS : ${fields}`);
      if (err) {
        console.log("ERROR : " + err);
        res.sendStatus(500);
        res.end();
        return;
      }
      res.json(results);
    });
  });

//Prefix all routes with "api"
app.use("/api", router);

//Start the server
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
