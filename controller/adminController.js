const Admin = require("../model/Admin");
const RoleManagement = require("../model/RoleManagement");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Debug: Log environment variables
console.log('Environment Variables:');
console.log('NEXT_PUBLIC_SUPER_ADMIN:', process.env.NEXT_PUBLIC_SUPER_ADMIN);
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');

// Generate a 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Configure email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send OTP to admin email
const sendOTP = async (req, res) => {
  try {
    console.log('\n=== OTP Request Debug ===');
    console.log('Request received at:', new Date().toISOString());
    console.log('Request body:', JSON.stringify(req.body));
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Email config:', {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-3) : 'not set'
    });
    
    const { email } = req.body;
    
    if (!email) {
      console.log('No email provided');
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const superAdminEmail = (process.env.NEXT_PUBLIC_SUPER_ADMIN || '').toLowerCase().trim();
    const emailLower = email.toLowerCase().trim();
    
    console.log('Checking auth for:', { emailLower, superAdminEmail });

    // Check if the email is the super admin or exists in RoleManagement
    if (emailLower !== superAdminEmail) {
      console.log('Not superadmin, checking RoleManagement...');
      try {
        const role = await RoleManagement.findOne({ email: emailLower });
        console.log('Role found:', role);
        if (!role) {
          console.log(`Login attempt with unauthorized email: ${emailLower}`);
          return res.status(403).json({
            success: false,
            message: "Unauthorized email address. Please contact the administrator.",
          });
        }
      } catch (error) {
        console.error('Error checking RoleManagement:', error);
        return res.status(500).json({
          success: false,
          message: "Error checking permissions. Please try again.",
          error: error.message
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create admin record
    let admin = await Admin.findOne({ email });
    if (!admin) {
      admin = new Admin({
        email,
        otp: otp,
        otpExpiresAt: otpExpiresAt,
      });
    } else {
      admin.otp = otp;
      admin.otpExpiresAt = otpExpiresAt;
    }

    await admin.save();

    // Send OTP via email
    try {
      console.log('Creating email transporter...');
      const transporter = createTransporter();
      
      console.log('Preparing email options...');
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Admin Login OTP",
        html: `
          <h2>Admin Login OTP</h2>
          <p>Your OTP for admin login is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        `,
      };

      console.log('Sending email...');
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (emailError) {
      console.error('Failed to send email:', {
        error: emailError.message,
        stack: emailError.stack,
        email: email,
        service: process.env.EMAIL_SERVICE
      });
      throw emailError; // Re-throw to be caught by the outer catch
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to admin email",
    });
  } catch (error) {
    console.error('Error in sendOTP:', {
      error: error.message,
      stack: error.stack,
      time: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

// Verify OTP and login admin
const verifyOTP = async (req, res) => {
  try {
    console.log('\n=== OTP Verification Debug ===');
    console.log('Verification request at:', new Date().toISOString());
    console.log('Request body:', JSON.stringify({
      ...req.body,
      otp: req.body.otp ? '***' + req.body.otp.slice(-2) : 'missing'
    }));
    
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      console.log('Missing email or OTP');
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
    
    const superAdminEmail = (process.env.NEXT_PUBLIC_SUPER_ADMIN || '').toLowerCase().trim();
    const emailLower = email.toLowerCase().trim();
    let role = null;
    
    console.log('Verifying OTP for:', { emailLower, superAdminEmail });
    
    // Check if the email is the super admin or exists in RoleManagement
    if (emailLower !== superAdminEmail) {
      try {
        console.log('Not superadmin, checking RoleManagement...');
        role = await RoleManagement.findOne({ email: emailLower });
        console.log('Role found:', role ? 'Yes' : 'No');
        if (!role) {
          console.log(`OTP verification attempt with unauthorized email: ${emailLower}`);
          return res.status(403).json({
            success: false,
            message: "Unauthorized email address. Please contact the administrator.",
          });
        }
      } catch (error) {
        console.error('Error checking RoleManagement:', error);
        return res.status(500).json({
          success: false,
          message: "Error checking permissions. Please try again.",
          error: error.message
        });
      }
    }

    // Check if the email is the super admin or exists in RoleManagement
    if (emailLower !== superAdminEmail) {
      role = await RoleManagement.findOne({ email: emailLower });
      if (!role) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized email address",
        });
      }
    }

    // Find admin record
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Verify OTP
    console.log('Verifying OTP...');
    const isValid = admin.isValidOTP(otp);
    console.log('OTP validation result:', isValid ? 'Valid' : 'Invalid/Expired');
    
    if (!isValid) {
      console.log('OTP verification failed:', {
        storedOTP: admin.otp,
        receivedOTP: otp,
        otpExpiresAt: admin.otpExpiresAt,
        currentTime: new Date()
      });
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Clear OTP and update login status
    console.log('Clearing OTP and updating login status...');
    await admin.clearOTP();
    admin.isLoggedIn = true;
    admin.lastLoginAt = new Date();
    await admin.save();
    
    console.log('Admin login successful:', {
      email: admin.email,
      isSuperAdmin: admin.email.toLowerCase() === process.env.NEXT_PUBLIC_SUPER_ADMIN?.toLowerCase(),
      lastLoginAt: admin.lastLoginAt
    });

    // Prepare response data
    const responseData = {
      email: admin.email,
      isLoggedIn: admin.isLoggedIn,
      lastLoginAt: admin.lastLoginAt,
      isSuperAdmin: admin.email.toLowerCase() === process.env.NEXT_PUBLIC_SUPER_ADMIN?.toLowerCase(),
      permissions: {}
    };

    // If not super admin, include role permissions
    if (!responseData.isSuperAdmin && role) {
      responseData.permissions = {
        filter: role.filter,
        product: role.product,
        seo: role.seo
      };
    } else if (responseData.isSuperAdmin) {
      // Super admin has all permissions
      responseData.permissions = {
        filter: "all access",
        product: "all access",
        seo: "all access"
      };
    }

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

// Logout admin
const logoutAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    const allowedEmails = process.env.ALLOW_EMAIL;
    if (!allowedEmails) {
      return res.status(500).json({
        success: false,
        message: "Allowed emails not configured in environment variables",
      });
    }
    const allowedEmailList = allowedEmails
      .split(",")
      .map((e) => e.trim().toLowerCase());
    if (!allowedEmailList.includes(email.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized email address",
      });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    admin.isLoggedIn = false;
    await admin.save();
    res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to logout admin",
      error: error.message,
    });
  }
};

// Get admin status
const getAdminStatus = async (req, res) => {
  try {
    const { email } = req.query;
    const allowedEmails = process.env.ALLOW_EMAIL;
    if (!allowedEmails) {
      return res.status(500).json({
        success: false,
        message: "Allowed emails not configured in environment variables",
      });
    }
    const allowedEmailList = allowedEmails
      .split(",")
      .map((e) => e.trim().toLowerCase());
    if (!allowedEmailList.includes(email.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized email address",
      });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    // Auto-logout logic
    if (admin.isLoggedIn && admin.lastLoginAt) {
      const sessionHours = parseFloat(process.env.ADMIN_SESSION_HOURS) || 2;
      const sessionExpiry = new Date(
        admin.lastLoginAt.getTime() + sessionHours * 60 * 60 * 1000
      );
      if (new Date() > sessionExpiry) {
        admin.isLoggedIn = false;
        await admin.save();
        return res.status(401).json({
          success: false,
          message: `Session expired after ${sessionHours} hours. Please login again.`,
        });
      }
    }
    res.status(200).json({
      success: true,
      data: {
        email: admin.email,
        isLoggedIn: admin.isLoggedIn,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get admin status",
      error: error.message,
    });
  }
};

// Controller to get the number of allowed admins
const getAllowedAdminCount = (req, res) => {
  const allowedEmails = process.env.ALLOW_EMAIL;
  if (!allowedEmails) {
    return res.status(500).json({
      success: false,
      message: "Allowed emails not configured in environment variables",
    });
  }
  const allowedEmailList = allowedEmails
    .split(",")
    .map((e) => e.trim().toLowerCase());
  res.status(200).json({
    success: true,
    count: allowedEmailList.length,
    emails: allowedEmailList,
  });
};

// Get all admins and their permissions
const getAllAdminPermissions = async (req, res) => {
  try {
    const admins = await Admin.find(
      {},
      "email canAccessProduct canAccessFilter"
    );
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update permissions for a specific admin
const updateAdminPermissions = async (req, res) => {
  try {
    // Super admin check removed; frontend already restricts access
    const { email, canAccessProduct, canAccessFilter } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    if (typeof canAccessProduct === "boolean")
      admin.canAccessProduct = canAccessProduct;
    if (typeof canAccessFilter === "boolean")
      admin.canAccessFilter = canAccessFilter;
    await admin.save();
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get permissions for a specific admin by email
const getAdminPermissions = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    const admin = await Admin.findOne(
      { email },
      "email canAccessProduct canAccessFilter"
    );
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all allowed emails and their permissions (even if not in DB)
const getAllAllowedAdminsWithPermissions = async (req, res) => {
  try {
    const allowedEmails = (process.env.ALLOW_EMAIL || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const admins = await Admin.find({ email: { $in: allowedEmails } });
    const adminMap = {};
    admins.forEach((a) => {
      adminMap[a.email.toLowerCase()] = a;
    });

    const result = allowedEmails.map((email) => {
      const admin = adminMap[email];
      return {
        email,
        canAccessProduct: admin ? admin.canAccessProduct : false,
        canAccessFilter: admin ? admin.canAccessFilter : false,
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  logoutAdmin,
  getAdminStatus,
  getAllowedAdminCount,
  getAllAdminPermissions,
  updateAdminPermissions,
  getAdminPermissions,
  getAllAllowedAdminsWithPermissions,
};
