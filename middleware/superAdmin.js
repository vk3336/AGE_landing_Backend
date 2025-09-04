const checkSuperAdmin = (req, res, next) => {
  const roleManagementKey = process.env.ROLE_MANAGEMENT_KEY;
  const roleManagementValue = process.env.ROLE_MANAGEMENT_VALUE;
  const roleHeader = req.headers[roleManagementKey?.toLowerCase()];

  if (!roleManagementKey || !roleManagementValue) {
    console.error("Role management environment variables not configured.");
    return res.status(500).json({
      error: "Internal server error: Role management not properly configured."
    });
  }

  if (!roleHeader || roleHeader !== roleManagementValue) {
    return res.status(403).json({ 
      success: false,
      message: "Forbidden: Invalid or missing role management credentials." 
    });
  }
  next();
};

module.exports = checkSuperAdmin;
