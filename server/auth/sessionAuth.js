function normalizeRole(role) {
  if (role === 'admin') {
    return 'lgu';
  }
  return role;
}

function getClientRole(accountRole) {
  return normalizeRole(accountRole) === 'lgu' ? 'admin' : normalizeRole(accountRole);
}

function getAccountRole(req) {
  return normalizeRole(req?.session?.accountRole || req?.session?.role || null);
}

function isAuthenticated(req) {
  return Boolean(req?.session?.userId);
}

function requireAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  return next();
}

function hasRole(req, ...roles) {
  const actualRole = getAccountRole(req);
  if (!actualRole) {
    return false;
  }

  return roles.map(normalizeRole).includes(actualRole);
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!hasRole(req, ...roles)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role.' });
    }

    return next();
  };
}

function serializeUser(user) {
  const accountRole = normalizeRole(user.role);

  return {
    userId: user.user_id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    role: getClientRole(accountRole),
    accountRole,
    status: user.status,
  };
}

function setSessionUser(req, user) {
  const serializedUser = serializeUser(user);

  req.session.userId = serializedUser.userId;
  req.session.username = serializedUser.username;
  req.session.fullName = serializedUser.fullName;
  req.session.email = serializedUser.email;
  req.session.role = serializedUser.role;
  req.session.accountRole = serializedUser.accountRole;
  req.session.status = serializedUser.status;

  return serializedUser;
}

module.exports = {
  getAccountRole,
  getClientRole,
  hasRole,
  isAuthenticated,
  requireAuth,
  requireRole,
  serializeUser,
  setSessionUser,
};
