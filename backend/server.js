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

app.get("/api/projects", async (req, res) => {
  const query = SQL`SELECT Projects.id, Projects.company, Projects.title, Projects.primary_major, Projects.secondary_major, Projects.tertiary_majors, Projects.confidentiality, Projects.ip, Projects.course_time, Projects.course_name, Projects.prototype, COUNT(Assignments.student_id) as count
  FROM Projects
  LEFT JOIN Assignments ON Projects.id = Assignments.project_id
  GROUP BY Projects.id
  ORDER BY Projects.id`;
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
