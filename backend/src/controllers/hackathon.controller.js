// HACKATHON CONTROLLER FIX
// Place this file temporarily as hackathon.controller.js to diagnose the issue

const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const emailService = require('../services/email.service');
const crypto = require('crypto');

// @desc    Create hackathon
// @route   POST /api/hackathons
// @access  Private
exports.createHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.create({
      ...req.body,
      organizer: req.user._id
    });

    res.status(201).json({
      success: true,
      hackathon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all hackathons
// @route   GET /api/hackathons
// @access  Public
exports.getHackathons = async (req, res) => {
  try {
    const { status, mode, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (mode) query.mode = mode;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const hackathons = await Hackathon.find(query)
      .populate('organizer', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single hackathon
// @route   GET /api/hackathons/:id
// @access  Public
exports.getHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('organizer', 'fullName email organization')
      .populate('coordinators.user', 'fullName email')
      .populate('judges.user', 'fullName email');

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    res.status(200).json({
      success: true,
      hackathon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update hackathon
// @route   PUT /api/hackathons/:id
// @access  Private (Organizer)
exports.updateHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    res.status(200).json({
      success: true,
      hackathon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete hackathon
// @route   DELETE /api/hackathons/:id
// @access  Private (Organizer)
exports.deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hackathon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my organized hackathons
// @route   GET /api/hackathons/my/organized
// @access  Private
exports.getMyHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find({ organizer: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my coordinations
// @route   GET /api/hackathons/my/coordinations
// @access  Private
exports.getMyCoordinations = async (req, res) => {
  try {
    const hackathons = await Hackathon.find({
      'coordinators.user': req.user._id
    })
      .populate('organizer', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Invite coordinator
// @route   POST /api/hackathons/:id/coordinators/invite
// @access  Private (Organizer)
exports.inviteCoordinator = async (req, res) => {
  try {
    const { email, permissions } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a coordinator
    const existingCoordinator = hackathon.coordinators.find(
      c => c.user.toString() === user._id.toString()
    );

    if (existingCoordinator) {
      return res.status(400).json({
        success: false,
        message: 'User is already a coordinator'
      });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Add coordinator
    hackathon.coordinators.push({
      user: user._id,
      permissions: permissions || {},
      invitationToken,
      invitedAt: Date.now()
    });

    await hackathon.save();

    // Send invitation email
    try {
      await emailService.sendCoordinatorInvitation(user, hackathon, req.user, invitationToken);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Coordinator invitation sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept coordinator invitation
// @route   POST /api/hackathons/coordinators/accept/:token
// @access  Private
exports.acceptCoordinatorInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const hackathon = await Hackathon.findOne({
      'coordinators.invitationToken': token
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation token'
      });
    }

    const coordinator = hackathon.coordinators.find(
      c => c.invitationToken === token
    );

    if (coordinator.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    coordinator.status = 'accepted';
    coordinator.invitationToken = undefined;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: 'Invitation accepted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update coordinator permissions
// @route   PUT /api/hackathons/:id/coordinators/:userId/permissions
// @access  Private (Organizer)
exports.updateCoordinatorPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    const coordinator = hackathon.coordinators.find(
      c => c.user.toString() === req.params.userId
    );

    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator not found'
      });
    }

    coordinator.permissions = permissions;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: 'Permissions updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Invite judge
// @route   POST /api/hackathons/:id/judges/invite
// @access  Private (Organizer)
exports.inviteJudge = async (req, res) => {
  try {
    const { email } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a judge
    const existingJudge = hackathon.judges.find(
      j => j.user.toString() === user._id.toString()
    );

    if (existingJudge) {
      return res.status(400).json({
        success: false,
        message: 'User is already a judge'
      });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Add judge
    hackathon.judges.push({
      user: user._id,
      invitationToken,
      invitedAt: Date.now()
    });

    await hackathon.save();

    // Send invitation email
    try {
      await emailService.sendJudgeInvitation(user, hackathon, req.user, invitationToken);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Judge invitation sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept judge invitation
// @route   POST /api/hackathons/judges/accept/:token
// @access  Private
exports.acceptJudgeInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const hackathon = await Hackathon.findOne({
      'judges.invitationToken': token
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation token'
      });
    }

    const judge = hackathon.judges.find(
      j => j.invitationToken === token
    );

    if (judge.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    judge.status = 'accepted';
    judge.invitationToken = undefined;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: 'Invitation accepted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// IMPORTANT: Make sure all functions are exported
module.exports = exports;