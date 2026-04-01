const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/superAdminController');
const { protectSuperAdmin } = require('../middleware/auth');

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/auth/login', ctrl.login);

// ── All routes below require superAdmin token ─────────────────────────────────
router.use(protectSuperAdmin);

router.get('/auth/me',              ctrl.getMe);
router.put('/auth/change-password', ctrl.changeOwnPassword);

// Overview / stats
router.get('/overview', ctrl.getOverview);

// Provincial admin management
router.get('/admins',                         ctrl.getAllAdmins);
router.get('/admins/:id',                     ctrl.getAdminById);
router.post('/admins',                        ctrl.createAdmin);
router.patch('/admins/:id/toggle-active',     ctrl.toggleAdminActive);
router.put('/admins/:id/reset-password',      ctrl.resetAdminPassword);
router.delete('/admins/:id',                  ctrl.deleteAdmin);

module.exports = router;