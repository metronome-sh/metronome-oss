import { users } from '../dist/index.server.js';

const newPassword = process.argv[2];

const email = await users.resetUserPassord(newPassword);

console.log(`Password reset successfully, for ${email}`);

process.exit(0);
