const nodemailer = require('nodemailer');

console.log('Type of nodemailer:', typeof nodemailer);
console.log('Keys:', Object.keys(nodemailer));
console.log('Is createTransporter generic:', typeof nodemailer.createTransporter);

if (typeof nodemailer === 'function') {
    console.log('Nodemailer might be a function itself?');
}
