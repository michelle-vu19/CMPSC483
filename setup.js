// const { toHaveErrorMessage } = require('@testing-library/jest-dom/dist/matchers');
let csv = require("csv-parse");
let createCsvWriter = require("csv-writer").createObjectCsvWriter;
let fs = require("fs");
let mySQL = require("mysql");
const { resolve } = require("path");
let SQL = require("sql-template-strings");
const { isDataView } = require("util/types");

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

let preferences;
let projects;
let students;
let studentsNoSurvey;

// MySQL connection objects.
const mySQLConnection = mySQL.createConnection({
  host: "localhost",
  user: "mav5499",
  password: mySQLPassword,
});

const databaseName = "capstone";
const databaseConnection = mySQL.createConnection({
  host: "localhost",
  user: "mav5499",
  password: mySQLPassword,
  database: databaseName,
});

// Main code.
databaseSetup(function () {
  readCSVs(function () {
    // Test Data.
    // addStudent('drs5972', 'Dan', 'Stebbins', 'CMPSC', 1, 1, 0, function() {});
    // addProject('XKCD', 'PSU', 'Test Project', 'CMPSC', 'EE', 'ME; CMPEN', 1, 0, '4 AM', 'CMPSC -2^10', 1, function() {});
    // addPreference('XKCD', 'drs5972', '8 AM', '10 AM', '4 AM', 2, 'Please no anything but this project I hate it.', function() {});
    // addAssignment('drs5972', 'XKCD', function() {});

    loadTables(function () {
      writeAssignmentsCSV(function () {});
    });
  });
});

// ==================================== DATABASE SETUP ====================================

function databaseSetup(callback) {
  connectToMySQL(function () {
    createDatabase(function () {
      connectToDatabase(function () {
        createTables(function () {
          callback();
        });
      });
    });
  });
}

function connectToMySQL(callback) {
  mySQLConnection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL!");
    callback();
  });
}

function createDatabase(callback) {
  mySQLConnection.query(
    `CREATE DATABASE IF NOT EXISTS ${databaseName}`,
    function (err, result) {
      if (err) throw err;
      console.log("Database created!");
      callback();
    }
  );
}

function connectToDatabase(callback) {
  databaseConnection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to the database!");
    callback();
  });
}

// Really does delete all data, be careful.
function dropDatabase(callback) {
  databaseConnection.query(
    `DROP DATABASE ${databaseName}`,
    function (err, result) {
      if (err) throw err;
      console.log("Database dropped!");
      callback();
    }
  );
}

// ==================================== TABLE CREATION ====================================

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
                        first_name          VARCHAR(255),
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

// ==================================== CSV READING AND TABLE LOADING ====================================

function readCSVs(callback) {
  readCSV(
    preferencesCSV,
    csv.parse({ delimiter: "," }, function (err, data) {
      preferences = data.slice(1, data.length);
    }),
    function () {
      readCSV(
        projectsCSV,
        csv.parse({ delimiter: "," }, function (err, data) {
          projects = data.slice(1, data.length);
        }),
        function () {
          readCSV(
            studentsCSV,
            csv.parse({ delimiter: "," }, function (err, data) {
              students = data.slice(1, data.length);
            }),
            function () {
              readCSV(
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

function readCSV(file, parser, callback) {
  fs.createReadStream(file)
    .pipe(parser)
    .on("error", function (err) {
      console.log(err);
    })
    .on("close", callback);
}

function loadTables(callback) {
  loadAssignmentsTable(function () {
    loadPreferencesTable(function () {
      loadProjectsTable(function () {
        loadStudentsTable(function () {
          callback();
        });
      });
    });
  });
}

async function loadAssignmentsTable(callback) {
  for (const student of students) {
    // projectID, studentID.
    await addAssignment(student[8], student[1], function () {});
  }
  callback();
}

async function loadPreferencesTable(callback) {
  for (const preference of preferences) {
    // projectID, studentID, timeA, timeB, timeC, preference, comment.
    await addPreference(
      preference[1],
      preference[9],
      preference[2],
      preference[3],
      preference[4],
      preference[5],
      preference[6],
      function () {}
    );
  }
  console.log("Preference Table Loaded!");
  callback();
}

async function loadProjectsTable(callback) {
  for (const project of projects) {
    // Getting primary, secondary, and tertiary majors from 1-2-3 format
    let primary = "";
    let secondary = "";
    let tertiary = "";
    for (let j = 0; j < majors.length; j++) {
      if (project[j + 3] == 1) primary = majors[j];
      else if (project[j + 3] == 2) secondary = majors[j];
      else if (project[j + 3] == 3) tertiary += majors[j] + ";";
    }

    // id, company, title, primary, secondary, tertiary, confidentiality, ip, courseTime, courseName, prototype.
    await addProject(
      project[0],
      project[1],
      project[2],
      primary,
      secondary,
      tertiary,
      project[14],
      project[15],
      project[16],
      project[17],
      project[18],
      function () {}
    );
  }
  console.log("Projects Table Loaded!");
  callback();
}

async function loadStudentsTable(callback) {
  for (const student of students) {
    // id, first, last, major, nda, ip, onCampus.
    await addStudent(
      student[8],
      student[10],
      student[9],
      student[0],
      student[6],
      student[7],
      student[11] == "Yes" ? 1 : 0,
      function () {}
    );
  }
  for (const student of studentsNoSurvey) {
    // Assume NULL for major and 0 for NDA, IP, and onCampus until further notice.
    await addStudent(
      student[2].substring(0, student[2].indexOf("@")),
      student[0],
      student[1],
      "",
      0,
      0,
      0,
      function () {}
    );
  }
  callback();
}

// ==================================== CSV WRITING FROM TABLES ====================================

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
      { id: "comment", title: "Comments" },
      { id: "nda", title: "Student_NDA" },
      { id: "ip", title: "Student_IP" },
      { id: "studentID", title: "campus_id" },
      { id: "lastName", title: "last_name" },
      { id: "firstName", title: "first_name" },
      { id: "onCampus", title: "OnCampus" },
    ],
  });

  let data = [];
  let assignments = await getAssignments();
  for (const assignment of assignments) {
    let row = {};
    row["studentID"] = assignment.student_id;
    row["projectID"] = assignment.project_id;

    let student = await getStudentDataForWrite(assignment.student_id);
    student = student[0];
    row["firstName"] = student.first_name;
    row["lastName"] = student.last_name;
    row["major"] = student.major;
    row["nda"] = student.nda;
    row["ip"] = student.ip;
    row["onCampus"] = student.on_campus == 1 ? "Yes" : "No";

    let comment = await getComment(
      assignment.student_id,
      assignment.project_id
    );
    comment = comment[0];
    row["comment"] = comment.comment;

    data.push(row);
  }
  await csvWriter.writeRecords(data);
  console.log("CSV Written!");
  callback();
}

// ==================================== QUERIES ====================================

// Gets all assignments.
function getAssignments() {
  return new Promise(function (resolve, reject) {
    const query = SQL`SELECT * FROM assignments`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      else {
        console.log("Assignments Retrieved!");
        resolve(result);
      }
    });
  });
}

function getStudentDataForWrite(studentID) {
  return new Promise(function (resolve, reject) {
    const query = SQL`SELECT first_name, last_name, major, nda, ip, on_campus
                            FROM students
                            WHERE id = ${studentID}`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      else {
        console.log("Student Data Retrieved!");
        resolve(result);
      }
    });
  });
}

function getComment(studentID, projectID) {
  return new Promise(function (resolve, reject) {
    const query = SQL`SELECT comment
                            FROM preferences
                            WHERE student_id = ${studentID} AND project_id = ${projectID}`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      else {
        console.log("Comment Retrieved!");
        resolve(result);
      }
    });
  });
}

// Adding rows to tables.
function addAssignment(studentID, projectID) {
  return new Promise(function (resolve, reject) {
    const query = SQL`INSERT INTO assignments
                            (student_id, project_id)
                            VALUES (${studentID}, ${projectID})`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      else {
        console.log("Assignment added!");
        resolve();
      }
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

function addStudent(id, first, last, major, nda, ip, onCampus) {
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

// ==================================== QUERY FUNCTIONS ====================================

// Given a number, return all the teams that have greater than that number of students.
// Maybe also get it to display the count
function getTeamsAbove(n) {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``.
    const query = SQL`SELECT projects.title, projects.company, projects.id
                            FROM projects
                            INNER JOIN assignments 
                                ON projects.id = assignments.project_id
                            GROUP BY assignments.project_id
                            HAVING COUNT(assignments.project_id) >= ${n}`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Given a number, return all the teams that have less than that number of students.
function getTeamsBelow(n) {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``.
    const query = SQL`SELECT projects.title, projects.company, projects.id
                            FROM projects
                            INNER JOIN assignments 
                                ON projects.id = assignments.project_id
                            GROUP BY assignments.project_id
                            HAVING COUNT(assignments.project_id) <= ${n}`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

//Displays the number of students on a team given a project ID
function getTeamCount(projectID) {
  // Put the query in the ``.
  const query = SQL`SELECT COUNT(assignments.project_id)
                        FROM assignments
                        WHERE assignments.project_id = ${projectID}
                        GROUP BY assignments.project_id`;
  databaseConnection.query(query, function (err, result) {
    if (err) reject(err);
    resolve(result);
  });
}

// Given a project and a major, return how many students of that major are on that project.
function getMajorCount(projectID, major) {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``.
    const query = SQL`SELECT COUNT(s.id)
                            FROM assignments AS a
                            INNER JOIN students AS s
                                ON a.student_id = s.id
                            WHERE a.project_id = ${projectID} AND s.major = ${major}`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Given a project, return whether or not it has the right amount of primary, secondary, and tertiary majors.
function holdsMajorInequality(projectID) {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``. Remember to use getMajorCount().
    const query = SQL`SELECT `;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Given a student, return a list of other projects they could be moved to according to their preferences and major.
function getAlternateProjects(studentID) {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``.
    const query = SQL``;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Given a project, return all display information for that project.
function getProjectData(projectID) {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``.
    const query = SQL`SELECT p.company, p.title, 
                                    p.primary_major, p.secondary_major,p.tertiary_majors
                                    p.confidentiality, p.ip, p.course_time, 
                                    p.couse_name, p.prototype
                                FROM projects AS p
                                WHERE p.id = ${projectID}`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Given a student, return all display information for that student.
//want to add current project
function getStudentData(studentID) {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``.
    const query = SQL`SELECT s.first_name, s.last_name, s.major, 
                                    s.nda, s.ip, s.on_campus,
                                    p.company, p.title
                            FROM assignments AS a
                            INNER JOIN students AS s
                                ON a.student_id = s.id
                            INNER JOIN projects AS p
                                ON a.project_id = p.id
                            WHERE a.student_id = ${studentID}`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Given a project, return all display information for all of it's students.
function getStudentsInProject(projectID) {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``.
    const query = SQL`SELECT `;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      // Do something with the result.
    });
  });
}

// Given a student and a project, update the student’s entry in the assignments table to move them to that project.
function updateAssignment(studentID, projectID) {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``.
    const query = SQL`UPDATE assigments 
                            SET project_id = ${projectID} 
                            WHERE student_id = $${studentID}`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      // Do something with the result.
    });
  });
}

function getMajorDistribution() {
  return new Promise(function (resolve, reject) {
    // Put the query in the ``.
    const query = SQL`SELECT
                            s.major, COUNT(*)
                            FROM students AS s
                            GROUP BY s.major;`;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      // Do something with the result.
    });
  });
}

function getCompletedPercent() {
  return new Promise(function (resolve, reject) {
    const query = SQL``;
    databaseConnection.query(query, function (err, result) {
      if (err) reject(err);
      // Do something with the result.
    });
  });
}
