import { initializeDatabase } from '../services/sqlService.js';
import { v4 as uuidv4 } from 'uuid';
import Challenge from '../models/Challenge.js';

/**
 * Initialize sample challenges in the database
 */
export const initializeSampleChallenges = async () => {
  try {
    // Check if challenges already exist
    const existingChallenges = await Challenge.countDocuments();
    if (existingChallenges > 0) {
      console.log('Sample challenges already exist, skipping initialization');
      return;
    }
    
    console.log('Initializing sample challenges...');
    
    // Sample challenges
    const challenges = [
      {
        title: 'SELECT Basics',
        description: 'Learn how to use the SELECT statement to retrieve data from a table.',
        difficulty: 'easy',
        category: 'basics',
        initialCode: '-- Write a query to select all columns from the employees table',
        schema: `
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  salary REAL NOT NULL,
  hire_date TEXT NOT NULL
);

INSERT INTO employees (id, name, email, department, salary, hire_date)
VALUES
  (1, 'John Smith', 'john@example.com', 'Engineering', 75000, '2020-01-15'),
  (2, 'Jane Doe', 'jane@example.com', 'Marketing', 65000, '2019-05-20'),
  (3, 'Bob Johnson', 'bob@example.com', 'Engineering', 80000, '2018-11-10'),
  (4, 'Alice Williams', 'alice@example.com', 'HR', 60000, '2021-03-05'),
  (5, 'Charlie Brown', 'charlie@example.com', 'Marketing', 70000, '2020-08-22');
`,
        order: 1,
        testCases: [
          {
            input: 'SELECT * FROM employees;',
            expectedOutput: JSON.stringify([
              { id: 1, name: 'John Smith', email: 'john@example.com', department: 'Engineering', salary: 75000, hire_date: '2020-01-15' },
              { id: 2, name: 'Jane Doe', email: 'jane@example.com', department: 'Marketing', salary: 65000, hire_date: '2019-05-20' },
              { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Engineering', salary: 80000, hire_date: '2018-11-10' },
              { id: 4, name: 'Alice Williams', email: 'alice@example.com', department: 'HR', salary: 60000, hire_date: '2021-03-05' },
              { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', department: 'Marketing', salary: 70000, hire_date: '2020-08-22' }
            ]),
            isHidden: false
          }
        ],
        hints: [
          {
            text: 'Use the * symbol to select all columns from a table.',
            cost: 5
          }
        ],
        reward: {
          xp: 10
        },
        databaseFile: 'challenge_select_basics.db'
      },
      {
        title: 'WHERE Clause',
        description: 'Learn how to filter data using the WHERE clause.',
        difficulty: 'easy',
        category: 'basics',
        initialCode: '-- Write a query to select all employees from the Engineering department',
        schema: `
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  salary REAL NOT NULL,
  hire_date TEXT NOT NULL
);

INSERT INTO employees (id, name, email, department, salary, hire_date)
VALUES
  (1, 'John Smith', 'john@example.com', 'Engineering', 75000, '2020-01-15'),
  (2, 'Jane Doe', 'jane@example.com', 'Marketing', 65000, '2019-05-20'),
  (3, 'Bob Johnson', 'bob@example.com', 'Engineering', 80000, '2018-11-10'),
  (4, 'Alice Williams', 'alice@example.com', 'HR', 60000, '2021-03-05'),
  (5, 'Charlie Brown', 'charlie@example.com', 'Marketing', 70000, '2020-08-22');
`,
        order: 2,
        testCases: [
          {
            input: "SELECT * FROM employees WHERE department = 'Engineering';",
            expectedOutput: JSON.stringify([
              { id: 1, name: 'John Smith', email: 'john@example.com', department: 'Engineering', salary: 75000, hire_date: '2020-01-15' },
              { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Engineering', salary: 80000, hire_date: '2018-11-10' }
            ]),
            isHidden: false
          }
        ],
        hints: [
          {
            text: "Use the WHERE clause with department = 'Engineering'",
            cost: 5
          }
        ],
        reward: {
          xp: 15
        },
        databaseFile: 'challenge_where_clause.db'
      },
      {
        title: 'Basic Joins',
        description: 'Learn how to join tables to retrieve related data.',
        difficulty: 'medium',
        category: 'joins',
        initialCode: '-- Write a query to join the employees and departments tables to show all employees with their department information',
        schema: `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department_id INTEGER NOT NULL,
  salary REAL NOT NULL,
  hire_date TEXT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments (id)
);

INSERT INTO departments (id, name, location) 
VALUES
  (1, 'Engineering', 'Building A'),
  (2, 'Marketing', 'Building B'),
  (3, 'HR', 'Building C');

INSERT INTO employees (id, name, email, department_id, salary, hire_date)
VALUES
  (1, 'John Smith', 'john@example.com', 1, 75000, '2020-01-15'),
  (2, 'Jane Doe', 'jane@example.com', 2, 65000, '2019-05-20'),
  (3, 'Bob Johnson', 'bob@example.com', 1, 80000, '2018-11-10'),
  (4, 'Alice Williams', 'alice@example.com', 3, 60000, '2021-03-05'),
  (5, 'Charlie Brown', 'charlie@example.com', 2, 70000, '2020-08-22');
`,
        order: 3,
        testCases: [
          {
            input: `
SELECT e.id, e.name, e.email, e.salary, e.hire_date, d.name as department_name, d.location
FROM employees e
JOIN departments d ON e.department_id = d.id;
            `,
            expectedOutput: JSON.stringify([
              { id: 1, name: 'John Smith', email: 'john@example.com', salary: 75000, hire_date: '2020-01-15', department_name: 'Engineering', location: 'Building A' },
              { id: 2, name: 'Jane Doe', email: 'jane@example.com', salary: 65000, hire_date: '2019-05-20', department_name: 'Marketing', location: 'Building B' },
              { id: 3, name: 'Bob Johnson', email: 'bob@example.com', salary: 80000, hire_date: '2018-11-10', department_name: 'Engineering', location: 'Building A' },
              { id: 4, name: 'Alice Williams', email: 'alice@example.com', salary: 60000, hire_date: '2021-03-05', department_name: 'HR', location: 'Building C' },
              { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', salary: 70000, hire_date: '2020-08-22', department_name: 'Marketing', location: 'Building B' }
            ]),
            isHidden: false
          }
        ],
        hints: [
          {
            text: "Use the JOIN keyword to connect the employees and departments tables on the department_id field.",
            cost: 5
          },
          {
            text: "Make sure to use table aliases to distinguish between columns from different tables.",
            cost: 10
          }
        ],
        reward: {
          xp: 25
        },
        databaseFile: 'challenge_basic_joins.db'
      }
    ];
    
    // Initialize databases for each challenge
    for (const challenge of challenges) {
      const dbName = `${uuidv4()}.db`; // Generate unique database filename
      const success = await initializeDatabase(challenge.schema, dbName);
      
      if (success) {
        // Update the database file reference
        challenge.databaseFile = dbName;
        
        // Create the challenge in MongoDB
        await new Challenge(challenge).save();
        console.log(`Created challenge: ${challenge.title}`);
      } else {
        console.error(`Failed to initialize database for challenge: ${challenge.title}`);
      }
    }
    
    console.log('Sample challenges initialized successfully');
  } catch (error) {
    console.error('Error initializing sample challenges:', error.message);
  }
}; 