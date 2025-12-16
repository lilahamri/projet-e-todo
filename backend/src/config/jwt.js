import dotenv from 'dotenv';
dotenv.config();

export const jwtConfig = {
  secret: process.env.SECRET,
  expiresIn: process.env.JWT_END || '1d',
};
