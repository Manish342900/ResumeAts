const bcrypt = require('bcryptjs');
const { client } = require('../config/db');

class User {
  constructor(email, password, name, resumeAnalysed = 0) {
    this.email = email;
    this.password = password;
    this.name = name;
    this.resumeAnalysed = resumeAnalysed;
  }

  static async findByEmail(email) {
    const db = client.db();
    return db.collection('users').findOne({ email });
  }

  static async create({ email, password, name }) {
    const db = client.db();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      email,
      password: hashedPassword,
      name,
      resumeAnalysed: 0,
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async incrementResumeAnalysed(email) {
    const db = client.db();
    await db.collection('users').updateOne(
      { email },
      { $inc: { resumeAnalysed: 1 } }
    );
  }

  static async createGoogleUser({ name, email, googleId }) {
    const db = client.db();
    const user = {
      name,
      email,
      googleId,
      isVerified: true,
      resumeAnalysed: 0,
      createdAt: new Date()
    };
    const result = await db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async updateGoogleId(email, googleId) {
    const db = client.db();
    await db.collection('users').updateOne(
      { email },
      { $set: { googleId, isVerified: true } }
    );
  }
}

module.exports = User;
