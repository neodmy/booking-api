const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');
const { app: { secretKey } } = require('../../config/default');

module.exports = {
  createUser: async (args) => {
    const { email, password } = args.userInput;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error('User exists already.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
    });
    const { _doc: savedUser } = await user.save();

    return { ...savedUser, password: null };
  },
  login: async ({ email, password }) => {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new Error('User does not exists');
    }
    const isEqual = await bcrypt.compare(password, existingUser.password);
    if (!isEqual) {
      throw new Error('Password is incorrect');
    }

    const token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      secretKey,
      { expiresIn: '1h' },
    );

    return {
      userId: existingUser.id,
      token,
      tokenExpiration: 1,
    };
  },
};
