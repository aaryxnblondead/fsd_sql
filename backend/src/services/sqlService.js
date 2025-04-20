import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database directory
const DB_DIR = path.join(__dirname, '../../databases');

// Create database directory if it doesn't exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

/**
 * Execute a SQL query against a SQLite database
 * @param {string} query - The SQL query to execute
 * @param {string} databaseFile - The name of the database file
 * @returns {object} The query results or error
 */
export const executeSqlQuery = async (query, databaseFile) => {
  const dbPath = path.join(DB_DIR, databaseFile);
  
  // Check if database file exists
  if (!fs.existsSync(dbPath)) {
    return {
      error: `Database file not found: ${databaseFile}`
    };
  }
  
  let db;
  try {
    // Open database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Execute query with timeout
    const results = await Promise.race([
      db.all(query),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query execution timed out')), 5000)
      )
    ]);
    
    return { results };
  } catch (error) {
    console.error('SQL execution error:', error.message);
    return {
      error: error.message
    };
  } finally {
    if (db) {
      await db.close();
    }
  }
};

/**
 * Initialize a database with schema for a challenge
 * @param {string} schema - SQL schema to initialize the database
 * @param {string} databaseFile - Database filename
 * @returns {boolean} Success status
 */
export const initializeDatabase = async (schema, databaseFile) => {
  const dbPath = path.join(DB_DIR, databaseFile);
  
  // Remove existing database if it exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  let db;
  try {
    // Create new database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Execute schema
    await db.exec(schema);
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error.message);
    return false;
  } finally {
    if (db) {
      await db.close();
    }
  }
};

/**
 * Compare two query results
 * @param {Array} actual - Actual query results
 * @param {Array} expected - Expected query results
 * @returns {boolean} Whether the results match
 */
export const compareQueryResults = (actual, expected) => {
  if (!actual || !expected) return false;
  
  // Convert strings to objects if needed
  const actualResults = typeof actual === 'string' ? JSON.parse(actual) : actual;
  const expectedResults = typeof expected === 'string' ? JSON.parse(expected) : expected;
  
  // Basic array comparison
  if (actualResults.length !== expectedResults.length) return false;
  
  // Compare individual rows
  for (let i = 0; i < actualResults.length; i++) {
    const actualRow = actualResults[i];
    const expectedRow = expectedResults[i];
    
    // Check for property count match
    const actualKeys = Object.keys(actualRow);
    const expectedKeys = Object.keys(expectedRow);
    
    if (actualKeys.length !== expectedKeys.length) return false;
    
    // Check each property value
    for (const key of expectedKeys) {
      if (actualRow[key] !== expectedRow[key]) return false;
    }
  }
  
  return true;
}; 