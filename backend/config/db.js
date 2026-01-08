const { Pool } = require('pg');
require("dotenv").config();

// Force IPv4 to fix Render/Supabase connection issues
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;