const express = require('express');
const router = express.Router();
const {
  createHackathon,
  getHackathons,
  getHackathon,
  updateHackathon,
  deleteHackathon,
  getMyHackathons,
  getMyCoordinations,
  inviteCoordinator,
  acceptCoordinatorInvitation,
  updateCoordinatorPermissions,
  getCoordinators,
  removeCoordinator,
  cancelCoordinatorInvite,
  resendCoordinatorInvite,
  inviteJudge,
  acceptJudgeInvitation
} = require('../controllers/hackathon.controller');
const { protect, authorize, isOrganizer } = require('../middleware/auth');

// IMPORTANT: Specific routes MUST come before parameterized routes!

// Public routes
router.get('/', getHackathons);

// Protected routes - MUST come before /:id
router.post('/', protect, createHackathon);
router.get('/my/organized', protect, getMyHackathons);
router.get('/my/coordinations', protect, getMyCoordinations);
router.post('/coordinators/accept/:token', protect, acceptCoordinatorInvitation);
router.post('/judges/accept/:token', protect, acceptJudgeInvitation);

// Parameterized routes - come AFTER specific routes
router.get('/:id', getHackathon);
router.put('/:id', protect, isOrganizer, updateHackathon);
router.delete('/:id', protect, isOrganizer, deleteHackathon);

// Coordinator management
router.get('/:id/coordinators', protect, getCoordinators);
router.post('/:id/coordinators/invite', protect, isOrganizer, inviteCoordinator);
router.delete('/:id/coordinators/:userId', protect, isOrganizer, removeCoordinator);
router.delete('/:id/coordinators/:userId/cancel', protect, isOrganizer, cancelCoordinatorInvite);
router.post('/:id/coordinators/:userId/resend', protect, isOrganizer, resendCoordinatorInvite);
router.put('/:id/coordinators/:userId/permissions', protect, isOrganizer, updateCoordinatorPermissions);

// Judge management
router.post('/:id/judges/invite', protect, isOrganizer, inviteJudge);

module.exports = router;