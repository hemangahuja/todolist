const express = require("express"); // Include ExpressJS
const app = express(); // Create an ExpressJS app

//shantaram
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static(__dirname));
app.use(
  express.json({
    type: ["application/json", "text/plain"],
  })
);

//Create database
let db = new sqlite3.Database("deebee.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the database.");
  }
});
db.run(
  "CREATE TABLE IF NOT EXISTS users(uname text primary key not null,pw text not null)"
);
db.run(
  "create table if not exists lists(uuid integer PRIMARY key,uname text not null,todotext text not null,isdone integer not null);"
);

//Init session
app.use(
  session({
    secret: "Keep it secret",
    name: "uniqueSessionID",
    saveUninitialized: false,
    resave: true,
  })
);

// Route to Homepage or LoginPage
app.get("/", (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(__dirname + "/2.html");
  } else {
    res.sendFile(__dirname + "/login.html");
  }
});

app.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(__dirname + "/2.html");
  } else {
    res.sendFile(__dirname + "/login.html");
  }
});

// Route to Reg page
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

//Login post
app.post("/login", (req, res) => {
  let username = req.body.Username;
  let password = req.body.Password;
  db.get(
    `select exists(select* from users where uname=(?) and pw=(?))`,
    [username, password],
    function (err, check) {
      if (err) {
        console.log(err);
        res.sendFile(__dirname + "/login.html");
      } else {
        let idk = Object.keys(check)[0];
        let isLoggedIn = check[idk];
        if (isLoggedIn) {
          req.session.loggedIn = true;
          req.session.username = username;
          res.locals.username = req.body.username;
          res.sendFile(__dirname + "/2.html");
        } else {
          res.sendFile(__dirname + "/register.html");
        }
      }
    }
  );
});

//LogOut

app.get("/logout", (req, res) => {
  req.session.destroy();
  console.log("session destroyed");
  res.sendFile(__dirname + "/login.html");
});

//auth

var auth = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

//AddToDo

app.post("/addtodo", auth, (req, res) => {
  let data = req["body"];
  console.log(data);
  db.run(
    "insert into lists(uname,todotext,isdone) values(?,?,?)",
    [req.session.username, data.todotext, data.isdone],
    function (err) {
      if (err) {
        console.log(err.message);
      } else {
        console.log(req.session.username, data.todotext, data.isdone);
      }
    }
  );
  res.status(200).end();
});

//ReadToDo
app.get("/readtodo", auth, (req, res) => {
  db.all(
    "select uuid,todotext,isdone from lists where uname=(?)",
    [req.session.username],
    function (err, rows) {
      if (err) {
        console.log(err);
      } else {
        res.send(rows);
      }
    }
  );
});

//DeleteToDo

app.post("/deletetodo", auth, (req, res) => {
  data = req["body"];
  db.run("delete from lists where uuid=(?)", [data.uuid], function (err) {
    if (err) {
      console.log(err.message);
    } else {
      console.log("deleted sucessfully");
    }
  });
  res.status(200).end();
});

//UpdateToDo

app.post("/updatetodo", auth, (req, res) => {
  data = req["body"];
  db.run(
    "update lists set isdone=not isdone where uuid=(?)",
    [data.uuid],
    function (err) {
      if (err) {
        console.log(err.message);
      } else {
        console.log("updated successfully");
      }
    }
  );
  res.status(200).end();
});

//Register Post
app.post("/register", (req, res) => {
  let username = req.body.Username;
  let password = req.body.Password;
  db.run(
    `INSERT INTO users(uname,pw) VALUES(?,?)`,
    [username, password],
    function (err) {
      if (err) {
        console.log(err.message);
        res.sendFile(__dirname + "/register.html");
      } else {
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.sendFile(__dirname + "/login.html");
      }
    }
  );
});
const port = 3000; // Port we will listen on

// Function to listen on the port
app.listen(port, () => console.log(`This app is listening on port ${port}`));