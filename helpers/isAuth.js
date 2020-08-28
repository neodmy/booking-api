const checkAuthUser = (req) => {
  const { isAuth, userId } = req;
  if (!isAuth) {
    throw new Error('Unauthenticated');
  }
  return userId;
};
module.exports = {
  checkAuthUser,
};
