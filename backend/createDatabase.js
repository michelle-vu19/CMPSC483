const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parse");
const fs = require("fs");
const mySQL = require("mysql2");
const SQL = require("sql-template-strings");

var mysql = require("mysql");

const preferencesCSV = "studentsFinal.csv";
const projectsCSV = "projectsFinal.csv";
const studentsCSV = "studentAssignments.csv";
const studentsNoSurveyCSV = "Students Without Prefs.csv";

let preferences = undefined;
let projects = undefined;
let students = undefined;
let studentsNoSurvey = undefined;

// MySQL connection objects.
const databaseName = "capstone";

let mySQLConnection = undefined;
let databaseConnection = undefined;

// ==================================== DATABASE SETUP ====================================

function databaseSetup(callback) {
  databaseConnection = mysql.createConnection({
    host: "localhost",
    user: "mav5499",
    password: "password",
    database: databaseName,
  });

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

// ==================================== CSV READING AND TABLE LOADING ====================================

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
    // studentid, projectid
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
