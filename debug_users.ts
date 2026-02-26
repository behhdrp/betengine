import Database from "better-sqlite3";
const db = new Database("database.sqlite");

const users = db.prepare('SELECT id, name, email, password FROM users').all();
console.log("Users in DB:", users.length);
users.forEach((u: any) => {
  console.log(`ID: ${u.id}, Name: ${u.name}, Email: '${u.email}', PasswordHash: ${u.password.substring(0, 10)}...`);
});
