const cors = require("cors");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parse");
const express = require("express");
const fs = require("fs");
const mySQL = require("mysql2");
const SQL = require("sql-template-strings");

const app = express();
const corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
});

// Edit with your MySQL Password:
const mySQLPassword = "password";

const preferencesCSV = "studentsFinal.csv";
const projectsCSV = "projectsFinal.csv";
const studentsCSV = "studentAssignments.csv";
const studentsNoSurveyCSV = "Students Without Prefs.csv";

const majors = [
  "BME",
  "CMPEN",
  "CMPSC",
  "DS",
  "ED",
  "EE",
  "EGEE",
  "ESC",
  "IE",
  "MATSE",
  "ME",
];

let preferences = undefined;
let projects = undefined;
let students = undefined;
let studentsNoSurvey = undefined;

// MySQL connection objects.
const mySQLConnection = mySQL.createConnection({
  host: "localhost",
  user: "root",
  password: mySQLPassword,
});

const databaseName = "capstone";
const databaseConnection = mySQL.createConnection({
  host: "localhost",
  user: "root",
  password: mySQLPassword,
  database: databaseName,
});

function connectToMySQL(callback) {
  mySQLConnection.connect(function (err) {
    //if (err) throw err;
    console.log("Connected to MySQL!");
    callback();
  });
}

function createDatabase(callback) {
  mySQLConnection.query(
    `CREATE DATABASE IF NOT EXISTS ${databaseName}`,
    function (err, result) {
      //if (err) throw err;
      console.log("Database created!");
      callback();
    }
  );
}

function connectToDatabase(callback) {
  databaseConnection.connect(function (err) {
    //if (err) throw err;
    console.log("Connected to the database!");
    callback();
  });
}

function createAssignmentsTable(callback) {
  const query = SQL`CREATE TABLE IF NOT EXISTS assignments (
                        project_id          VARCHAR(64),
                        student_id          VARCHAR(64))`;
  databaseConnection.query(query, function (err, result) {
    if (err) throw err;
    console.log("Assignments table created!");
    callback();
  });
}

function createPreferencesTable(callback) {
  const query = SQL`CREATE TABLE IF NOT EXISTS preferences (
                        project_id          VARCHAR(64),
                        student_id          VARCHAR(64),
                        time_a              VARCHAR(64),
                        time_b              VARCHAR(64), 
                        time_c              VARCHAR(64),
                        preference          TINYINT(1),
                        comment            TEXT)`;
  databaseConnection.query(query, function (err, result) {
    if (err) throw err;
    console.log("Preferences table created!");
    callback();
  });
}

function createProjectsTable(callback) {
  const query = SQL`CREATE TABLE IF NOT EXISTS projects (
                        id                  VARCHAR(64),
                        company             VARCHAR(255),
                        title               VARCHAR(255),
                        primary_major       VARCHAR(16),
                        secondary_major     VARCHAR(16),
                        tertiary_majors     VARCHAR(255),
                        confidentiality     TINYINT(1),
                        ip                  TINYINT(1),
                        course_time         VARCHAR(64),
                        course_name         VARCHAR(64),
                        prototype           TINYINT(1))`;
  databaseConnection.query(query, function (err, result) {
    if (err) throw err;
    console.log("Projects table created!");
    callback();
  });
}

function createStudentsTable(callback) {
  const query = SQL`CREATE TABLE IF NOT EXISTS students (
                        id                  VARCHAR(64),
                        first_name           VARCHAR(255),
                        last_name           VARCHAR(255),
                        major               VARCHAR(16),
                        nda                 TINYINT(1),
                        ip                  TINYINT(1),
                        on_campus           TINYINT(1))`;
  databaseConnection.query(query, function (err, result) {
    if (err) throw err;
    console.log("Students table created!");
    callback();
  });
}

function createTables(callback) {
  createAssignmentsTable(function () {
    createPreferencesTable(function () {
      createProjectsTable(function () {
        createStudentsTable(function () {
          callback();
        });
      });
    });
  });
}

function databaseSetup(callback) {
  connectToMySQL(() => {
    createDatabase(() => {
      connectToDatabase(() => {
        createTables(() => {
          callback();
        });
      });
    });
  });
}

function readCSVFile(file, parser, callback) {
  fs.createReadStream(file)
    .pipe(parser)
    .on("error", function (err) {
      console.log(err);
    })
    .on("close", callback);
}

function readCSVs(callback) {
  readCSVFile(
    preferencesCSV,
    csv.parse({ delimiter: "," }, function (err, data) {
      preferences = data.slice(1, data.length);
    }),
    function () {
      readCSVFile(
        projectsCSV,
        csv.parse({ delimiter: "," }, function (err, data) {
          projects = data.slice(1, data.length);
        }),
        function () {
          readCSVFile(
            studentsCSV,
            csv.parse({ delimiter: "," }, function (err, data) {
              students = data.slice(1, data.length);
            }),
            function () {
              readCSVFile(
                studentsNoSurveyCSV,
                csv.parse({ delimiter: "," }, function (err, data) {
                  studentsNoSurvey = data.slice(1, data.length);
                }),
                function () {
                  callback();
                }
              );
            }
          );
        }
      );
    }
  );
}

// Adding rows to tables.
function addAssignment(studentID, projectID) {
  return new Promise(function (resolve, reject) {
    const query = SQL`INSERT INTO assignments
                            (student_id, project_id)
                            VALUES (${studentID}, ${projectID})`;
    databaseConnection.query(query, function (err, result) {
      //if (err) throw err;

      console.log("Assignment added!");
      resolve();
    });
  });
}

//can we note when it finishes adding all preferences or something
function addPreference(
  projectID,
  studentID,
  timeA,
  timeB,
  timeC,
  preference,
  comment
) {
  return new Promise(function (resolve, reject) {
    const query = SQL`INSERT INTO preferences
                            (project_id, student_id, time_a, time_b, time_c, preference, comment)
                            VALUES (${projectID}, ${studentID}, ${timeA}, ${timeB}, ${timeC}, ${preference}, ${comment})`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      else {
        console.log("Preference added!");
        resolve();
      }
    });
  });
}

function addProject(
  id,
  company,
  title,
  primary,
  secondary,
  tertiary,
  confidentiality,
  ip,
  courseTime,
  courseName,
  prototype
) {
  return new Promise(function (resolve, reject) {
    const query = SQL`INSERT INTO projects
                            (id, company, title, primary_major, secondary_major, tertiary_majors, confidentiality, ip, course_time, course_name, prototype)
                            VALUES (${id}, ${company}, ${title}, ${primary}, ${secondary}, ${tertiary}, ${confidentiality}, ${ip}, ${courseTime}, ${courseName}, ${prototype})`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      else {
        console.log("Project added!");
        resolve();
      }
    });
  });
}

function addStudent(id, first, last, major, nda, ip, onCampus, callback) {
  return new Promise(function (resolve, reject) {
    const query = SQL`INSERT INTO students
                            (id, first_name, last_name, major, nda, ip, on_campus)
                            VALUES (${id}, ${first}, ${last}, NULLIF(${major}, ''), ${nda}, ${ip}, ${onCampus})`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      else {
        console.log("Student added!");
        resolve();
      }
    });
  });
}

// I'm assuming the other CSVs don't need to be written to, but they can be added later if they do.
async function writeAssignmentsCSV(callback) {
  const csvWriter = createCsvWriter({
    path: "tempStudentAssignments.csv",
    header: [
      { id: "major", title: "Major" },
      { id: "projectID", title: "ProjectID" },
      { id: "timeA", title: "TimeA" },
      { id: "timeB", title: "TimeB" },
      { id: "timeC", title: "TimeC" },
      { id: "comments", title: "Comments" },
      { id: "nda", title: "Student_NDA" },
      { id: "ip", title: "Student_IP" },
      { id: "studentID", title: "campus_id" },
      { id: "lastName", title: "last_name" },
      { id: "firstName", title: "first_name" },
      { id: "onCampus", title: "OnCampus" },
    ],
  });

  const data = [
    // {
    //   name: 'John',
    //   surname: 'Snow',
    //   age: 26,
    //   gender: 'M'
    // }, {
    //   name: 'Clair',
    //   surname: 'White',
    //   age: 33,
    //   gender: 'F',
    // }, {
    //   name: 'Fancy',
    //   surname: 'Brown',
    //   age: 78,
    //   gender: 'F'
    // }
  ];
  /*var assignments = await getAssignments();
    for (const assignment of assignments) {

    }
    console.log(temp) */
  callback();
}

// Main code.
databaseSetup(function () {
  readCSVs(function () {
    // Test Data.
    addStudent("drs5972", "Dan", "Stebbins", "CMPSC", 1, 1, 0, function () {});
    addProject(
      "XKCD",
      "PSU",
      "Test Project",
      "CMPSC",
      "EE",
      "ME; CMPEN",
      1,
      0,
      "4 AM",
      "CMPSC -2^10",
      1,
      function () {}
    );
    addPreference(
      "XKCD",
      "drs5972",
      "8 AM",
      "10 AM",
      "4 AM",
      2,
      "Please no anything but this project I hate it.",
      function () {}
    );
    addAssignment("XKCD", "drs5972", function () {});
    writeAssignmentsCSV(() => {
      app.listen(PORT, () => console.log(`listening on ${PORT}`));
    });
    // loadTables(function () { });
  });
});

const PORT = process.env.PORT || 8081;

// Gets all assignments.
app.get("/api/assignments", async (req, res) => {
  const query = SQL`SELECT * FROM assignments`;
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

app.get("/api/teams/:count");
