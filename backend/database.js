import mysql from 'mysql2'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'mav5499',
    password: 'password',
    database: 'capstone'

}).promise()


export async function getTeamsAbove(n){
    const [teams] = await pool.query(`
    SELECT projects.title, projects.company, projects.id
    FROM projects
    INNER JOIN assignments 
        ON projects.id = assignments.project_id
    GROUP BY assignments.project_id
    HAVING COUNT(assignments.project_id) >= ?
    ` , [n]) 
    return teams
}

export async function getTeamsBelow(n){
    const [teams] = await pool.query(`
    SELECT projects.title, projects.company, projects.id
                        FROM projects
                        INNER JOIN assignments 
                            ON projects.id = assignments.project_id
                        GROUP BY assignments.project_id
                        HAVING COUNT(assignments.project_id) <= ?`, [n])

    return teams
}

export async function getTeamCount(projectID) {
    const [count] = await pool.query(`
    SELECT COUNT(assignments.project_id)
                        FROM assignments
                        WHERE assignments.project_id = ?
                        GROUP BY assignments.project_id
    `, [projectID])
    return count
}

export async function getMajorDistribution() {
    // Put the query in the ``.
    const [count] = await pool.query(`
                        SELECT
                        s.major, COUNT(*)
                        FROM students AS s
                        GROUP BY s.major;`)
   return count
    
}




