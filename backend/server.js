const cors = require("cors");
const express = require("express");
const SQL = require("sql-template-strings");

const app = express();
const corsOptions = {
  origin: "http://localhost:8081",
};

console.log("Server is runbning");

const {
  addAssignment,
  addPreference,
  addProject,
  addStudent,
  databaseConnection,
  connectToMySQL,
  connectToDatabase,
  getAssignmentsQuery,
} = require("./db.js");

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
});

let preferences = undefined;
let projects = undefined;
let students = undefined;
let studentsNoSurvey = undefined;

function databaseSetup(callback) {
  connectToMySQL(() => {
    connectToDatabase(() => {
      callback();
    });
  });
}

databaseSetup(() => {
  app.listen(PORT, () => console.log(`listening on ${PORT}`));
});
const PORT = process.env.PORT || 8081;

// Gets all assignments.
app.get("/api/assignments", async (req, res) => {
  const query = getAssignmentsQuery();
  databaseConnection.execute(query, (error, result) => {
    if (error) {
      res
        .status(401)
        .json({ message: `Error occurred when querying database: ${error}` });
    }
    console.log("Assignments Retrieved!");
    res.json(result);
  });
});

app.get("/api/highteams/:count", async (req, res) => {
  const query = SQL`SELECT projects.title, projects.company, projects.id
    FROM projects
    INNER JOIN assignments 
        ON projects.id = assignments.project_id
    GROUP BY assignments.project_id
    HAVING COUNT(assignments.project_id) >= ${n}`;
  databaseConnection.execute(query, (error, result) => {
    if (error) {
      res
        .status(401)
        .json({ message: `Error occurred when querying database: ${error}` });
    }
    console.log("highteams Retrieved!");
    res.json(result);
  });
});

app.get("/api/lowteams/:count", async (req, res) => {
  const query = SQL`SELECT projects.title, projects.company, projects.id
    FROM projects
    INNER JOIN assignments 
        ON projects.id = assignments.project_id
    GROUP BY assignments.project_id
    HAVING COUNT(assignments.project_id) <= ${n}`;
  databaseConnection.execute(query, (error, result) => {
    if (error) {
      res
        .status(401)
        .json({ message: `Error occurred when querying database: ${error}` });
    }
    console.log("lowteams Retrieved!");
    res.json(result);
  });
});

app.get("/api/projects", async (req, res) => {
  const query = SQL`SELECT *, COUNT(p.id)
  FROM projects AS p
  INNER JOIN assignments AS a
  ON p.id = a.project_id
  GROUP BY a.project_id`;
  databaseConnection.execute(query, (error, result) => {
    if (error) {
      res
        .status(401)
        .json({ message: `Error occurred when querying database: ${error}` });
    }
    console.log("Projects Retrieved!");
    res.json(result);
  });
});

app.get("/api/students", async (req, res) => {
  const query = SQL`SELECT * from students`;
  databaseConnection.execute(query, (error, result) => {
    if (error) {
      res
        .status(401)
        .json({ message: `Error occurred when querying database: ${error}` });
    }
    console.log("Students Retrieved!");
    res.json(result);
  });
});

app.get("/api/dashboard-major", async (req, res) => {
  const query = SQL`SELECT
                        s.major, COUNT(*) AS count
                        FROM students AS s
                        GROUP BY s.major;`;

  databaseConnection.execute(query, (error, result) => {
    if (error) {
      res
        .status(401)
        .json({ message: `Error occurred when querying database: ${error}` });
    }
    console.log("Major Distribution Retrieved!");
    res.json(result);
  });
});

app.get("/api/student-assignments", async (req, res) => {
  const query = SQL`SELECT *
                    FROM students AS s
                    INNER JOIN assignments AS a
                    ON s.id = a.student_id`;

  databaseConnection.execute(query, (error, result) => {
    if (error) {
      res
        .status(401)
        .json({ message: `Error occurred when querying database: ${error}` });
    }
    console.log("Student Assignments Recieved!");
    res.json(result);
  });
});
