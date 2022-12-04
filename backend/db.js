const mySQL = require("mysql2");
const SQL = require("sql-template-strings");

// Edit with your MySQL Password:
const mySQLPassword = "password";

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

function connectToDatabase(callback) {
  databaseConnection.connect(function (err) {
    //if (err) throw err;
    callback();
  });
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

async function addStudent(id, first, last, major, nda, ip, onCampus) {
  return new Promise(function (resolve, reject) {
    const query = SQL`INSERT INTO students
                              (id, first_name, last_name, major, nda, ip, on_campus)
                              VALUES (${id}, ${first}, ${last}, NULLIF(${major}, ''), ${nda}, ${ip}, ${onCampus})`;
    databaseConnection.query(query, (err, result) => {
      if (err) {
        console.log("Fail!");
        reject(err);
      } else {
        console.log("Student added!");
        resolve();
      }
    });
  });
}

const getAssignmentsQuery = () => SQL`SELECT * FROM assignments`;
const getStudentDataForWriteQuery = (studentID) => {
  return SQL`SELECT first_name, last_name, major, nda, ip, on_campus
                            FROM students
                            WHERE id = ${studentID}`;
};

const getCommentQuery = (studentID, projectID) => {
  return SQL`SELECT comment
                          FROM preferences
                          WHERE student_id = ${studentID} AND project_id = ${projectID}`;
};

const addAssignmentQuery = (studentID, projectID) => {
  return SQL`INSERT INTO assignments
                          (student_id, project_id)
                          VALUES (${studentID}, ${projectID})`;
};

const addPreferenceQuery = function (
  projectID,
  studentID,
  timeA,
  timeB,
  timeC,
  preference,
  comment
) {
  return SQL`INSERT INTO preferences
                          (project_id, student_id, time_a, time_b, time_c, preference, comment)
                          VALUES (${projectID}, ${studentID}, ${timeA}, ${timeB}, ${timeC}, ${preference}, ${comment})`;
};

const addProjectQuery = function addProject(
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
  return SQL`INSERT INTO projects
                          (id, company, title, primary_major, secondary_major, tertiary_majors, confidentiality, ip, course_time, course_name, prototype)
                          VALUES (${id}, ${company}, ${title}, ${primary}, ${secondary}, ${tertiary}, ${confidentiality}, ${ip}, ${courseTime}, ${courseName}, ${prototype})`;
};

const addStudentQuery = function (id, first, last, major, nda, ip, onCampus) {
  return SQL`INSERT INTO students
                          (id, first_name, last_name, major, nda, ip, on_campus)
                          VALUES (${id}, ${first}, ${last}, NULLIF(${major}, ''), ${nda}, ${ip}, ${onCampus})`;
};

module.exports = {
  addAssignment,
  addPreference,
  addProject,
  addStudent,
  mySQLConnection,
  databaseConnection,
  connectToMySQL,
  connectToDatabase,
  databaseName,
  getAssignmentsQuery,
  getStudentDataForWriteQuery,
  getCommentQuery,
};
