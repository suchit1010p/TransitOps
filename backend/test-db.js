import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_Dbj4tAQrJwv7@ep-withered-frog-atyecj6e-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
async function run() {
  const fRes = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'fuel_logs'`;
  console.log('fuel_logs:', fRes.map(r => r.column_name).join(', '));
  
  const eRes = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'expenses'`;
  console.log('expenses:', eRes.map(r => r.column_name).join(', '));
}
run().catch(console.error);
