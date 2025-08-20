const TherapySession = require('../models/TherapySession');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Schedule = require('../models/Schedule');
 
// Helper: check for time conflict for a therapist
const hasConflict = async (therapistId, start, end, excludeId = null) => {
  const query = {
    therapist: therapistId,
    status: 'scheduled',
    $expr: {
      $and: [
        { $lt: ['$dateTime', end] },
        { $gt: ['$dateTime', start] }
      ]
    }
  };

  // Note: since dateTime stores start, and duration stored separately, $expr with duration needed.
  // Simpler approach: compute session start/end in JS and compare ranges.

  const sessions = await TherapySession.find({ therapist: therapistId, status: 'scheduled' });
  for (const s of sessions) {
    if (excludeId && s._id.equals(excludeId)) continue;
    const sStart = s.dateTime;
    const sEnd = new Date(s.dateTime.getTime() + (s.duration || 0) * 60000);
    if (start < sEnd && end > sStart) return true;
  }
  return false;
};

// @desc Create therapy session
// @route POST /api/therapy
// @access Protected
exports.createSession = async (req, res) => {
  try {
    const { student, therapist, dateTime, duration, type, notes } = req.body;
    if (!student || !therapist || !dateTime || !duration) return res.status(400).json({ success: false, error: 'Missing required fields' });

    const t = await Teacher.findById(therapist);
    if (!t || !t.isActive) return res.status(400).json({ success: false, error: 'Therapist not found or inactive' });
    const st = await Student.findById(student);
    if (!st || !st.isActive) return res.status(400).json({ success: false, error: 'Student not found or inactive' });

    const start = new Date(dateTime);
    const end = new Date(start.getTime() + duration * 60000);

    // Check for existing scheduled sessions conflict
    const conflict = await hasConflict(therapist, start, end);
    if (conflict) return res.status(409).json({ success: false, error: 'Therapist has a conflicting session' });

    // Check teacher schedule availability for the date
    const sessionDate = new Date(start.toDateString());
    const schedule = await Schedule.findOne({ teacher: therapist, date: sessionDate });
    if (schedule) {
      if (schedule.isHoliday) return res.status(409).json({ success: false, error: 'Therapist is on holiday that day' });

      // find a slot that covers the session time
      const startHM = start.getHours().toString().padStart(2,'0') + ':' + start.getMinutes().toString().padStart(2,'0');
      const endHM = end.getHours().toString().padStart(2,'0') + ':' + end.getMinutes().toString().padStart(2,'0');
      const matching = schedule.slots.find(s => s.startTime <= startHM && s.endTime >= endHM && (s.activity === 'therapy' || s.activity === 'other' || s.activity === 'class'));
      if (!matching) return res.status(409).json({ success: false, error: 'No available slot in therapist schedule for this time' });
    }

  const session = await TherapySession.create({ student, therapist, dateTime: start, duration, type, notes });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get sessions (filter by therapist/student/date)
// @route GET /api/therapy
// @access Protected
exports.getSessions = async (req, res) => {
  try {
    const { therapist, student, from, to } = req.query;
    const q = {};
    if (therapist) q.therapist = therapist;
    if (student) q.student = student;
    if (from || to) q.dateTime = {};
    if (from) q.dateTime.$gte = new Date(from);
    if (to) q.dateTime.$lte = new Date(to);

    const sessions = await TherapySession.find(q).populate('student therapist').lean();
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get single session
// @route GET /api/therapy/:id
// @access Protected
exports.getSession = async (req, res) => {
  try {
    const session = await TherapySession.findById(req.params.id).populate('student therapist');
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Update session
// @route PUT /api/therapy/:id
// @access Protected
exports.updateSession = async (req, res) => {
  try {
    const { dateTime, duration, therapist } = req.body;
    const session = await TherapySession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    const newTherapist = therapist || session.therapist;
    const newStart = dateTime ? new Date(dateTime) : session.dateTime;
    const newDuration = duration || session.duration;
    const newEnd = new Date(newStart.getTime() + newDuration * 60000);

    const conflict = await hasConflict(newTherapist, newStart, newEnd, session._id);
    if (conflict) return res.status(409).json({ success: false, error: 'Therapist has a conflicting session' });

    // Check schedule availability similar to create
    const sessionDate = new Date(newStart.toDateString());
    const schedule = await Schedule.findOne({ teacher: newTherapist, date: sessionDate });
    if (schedule) {
      if (schedule.isHoliday) return res.status(409).json({ success: false, error: 'Therapist is on holiday that day' });
      const startHM = newStart.getHours().toString().padStart(2,'0') + ':' + newStart.getMinutes().toString().padStart(2,'0');
      const endHM = newEnd.getHours().toString().padStart(2,'0') + ':' + newEnd.getMinutes().toString().padStart(2,'0');
      const matching = schedule.slots.find(s => s.startTime <= startHM && s.endTime >= endHM && (s.activity === 'therapy' || s.activity === 'other' || s.activity === 'class'));
      if (!matching) return res.status(409).json({ success: false, error: 'No available slot in therapist schedule for this time' });
    }

    Object.assign(session, req.body);
    await session.save();
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Cancel (soft) session
// @route DELETE /api/therapy/:id
// @access Protected
exports.cancelSession = async (req, res) => {
  try {
    const session = await TherapySession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    session.status = 'cancelled';
    await session.save();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
