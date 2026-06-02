import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();

export const connectDB = async () => {
  const client = await pool.connect();
  client.release();
  console.log('PostgreSQL connected');
};

export default pool;
