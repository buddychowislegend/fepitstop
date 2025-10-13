require('dotenv').config();
const db = require('../config/db');

const indianFirst = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Reyansh','Ishaan','Shaurya','Atharv','Krishna','Ananya','Diya','Anika','Ira','Aadhya','Myra','Aaradhya','Advika','Saanvi','Kyra'];
const indianLast = ['Sharma','Verma','Gupta','Agarwal','Iyer','Reddy','Menon','Kapoor','Bansal','Kulkarni'];
const usFirst = ['Noah','Liam','Mason','Jacob','William','Ethan','Michael','Alexander','James','Benjamin','Olivia','Emma','Ava','Sophia','Isabella','Mia','Charlotte','Amelia','Evelyn','Abigail'];
const usLast = ['Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez'];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function makeUsers(count, region){
  const list = [];
  for(let i=0;i<count;i++){
    const first = region==='india'? pick(indianFirst): pick(usFirst);
    const last = region==='india'? pick(indianLast): pick(usLast);
    const name = `${first} ${last}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random()*10000)}@example.com`;
    const mobile = `+${region==='india'?91:1}${Math.floor(9000000000+Math.random()*999999999).toString().slice(0,10)}`;
    list.push({ name, email, mobile, password: 'Pass@1234' });
  }
  return list;
}

(async () => {
  try{
    console.log('🌱 Seeding 30 users...');
    const indian = makeUsers(18,'india');
    const us = makeUsers(12,'us');
    const users = [...indian, ...us];
    for(const u of users){
      await db.createUser(u);
    }
    console.log('✅ Seeded users:', users.length);
    process.exit(0);
  }catch(e){
    console.error('✗ Seed users failed:', e);
    process.exit(1);
  }
})();


