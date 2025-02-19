const authorize = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role) && !allowedRoles.includes("All")) {
    return res.status(403).json({ message: "You do not have access to this resource." });
  }
  next();
};

module.exports = authorize;
