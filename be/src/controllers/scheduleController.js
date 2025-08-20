const Schedule = require('../models/Schedule');
const Teacher = require('../models/Teacher');

// Validate time string HH:MM
const isValidTime = (t) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);

// Check for overlapping slots within same schedule
const hasOverlappingSlots = (slots) => {
  const intervals = slots.map(s => ({
    start: s.startTime,
    end: s.endTime
  }));
  // sort by start
  intervals.sort((a,b) => a.start.localeCompare(b.start));
  for (let i=1;i<intervals.length;i++){
    if (intervals[i].start < intervals[i-1].end) return true;
  }
  return false;
};

// @desc Create schedule for a teacher (one per date)
// @route POST /api/schedules
// @access Protected
exports.createSchedule = async (req, res) => {
  try {
    const { teacher, date, slots, isHoliday, holidayReason } = req.body;
    if (!teacher || !date) return res.status(400).json({ success:false, error: 'Missing teacher or date' });

    const t = await Teacher.findById(teacher);
    if (!t || !t.isActive) return res.status(400).json({ success:false, error: 'Teacher not found or inactive' });

    if (slots && (!Array.isArray(slots) || slots.length === 0)) return res.status(400).json({ success:false, error: 'Slots must be a non-empty array' });

    if (slots) {
      for (const s of slots) {
        if (!isValidTime(s.startTime) || !isValidTime(s.endTime)) {
          return res.status(400).json({ success:false, error: 'Invalid time format in slots (expected HH:MM)' });
        }
        if (s.startTime >= s.endTime) return res.status(400).json({ success:false, error: 'Slot startTime must be before endTime' });
      }
      if (hasOverlappingSlots(slots)) return res.status(400).json({ success:false, error: 'Slots overlap' });
    }

    const schedule = await Schedule.create({ teacher, date, slots, isHoliday, holidayReason });
    res.status(201).json({ success:true, data: schedule });
  } catch (error) {
    // unique index on teacher+date
    if (error && error.code === 11000) return res.status(409).json({ success:false, error: 'Schedule for this teacher on this date already exists' });
    res.status(500).json({ success:false, error: error.message });
  }
};

// @desc Get schedules (filter by teacher/date range)
// @route GET /api/schedules
// @access Protected
exports.getSchedules = async (req, res) => {
  try {
    const { teacher, from, to } = req.query;
    const q = {};
    if (teacher) q.teacher = teacher;
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);

    const schedules = await Schedule.find(q).populate('teacher').lean();
    res.status(200).json({ success:true, data: schedules });
  } catch (error) {
    res.status(500).json({ success:false, error: error.message });
  }
};

// @desc Get schedule by id
// @route GET /api/schedules/:id
// @access Protected
exports.getSchedule = async (req, res) => {
  try {
    const sched = await Schedule.findById(req.params.id).populate('teacher');
    if (!sched) return res.status(404).json({ success:false, error: 'Schedule not found' });
    res.status(200).json({ success:true, data: sched });
  } catch (error) {
    res.status(500).json({ success:false, error: error.message });
  }
};

// @desc Update schedule
// @route PUT /api/schedules/:id
// @access Protected
exports.updateSchedule = async (req, res) => {
  try {
    const { slots } = req.body;
    if (slots) {
      for (const s of slots) {
        if (!isValidTime(s.startTime) || !isValidTime(s.endTime)) return res.status(400).json({ success:false, error: 'Invalid time format in slots' });
        if (s.startTime >= s.endTime) return res.status(400).json({ success:false, error: 'Slot startTime must be before endTime' });
      }
      if (hasOverlappingSlots(slots)) return res.status(400).json({ success:false, error: 'Slots overlap' });
    }

    const sched = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sched) return res.status(404).json({ success:false, error: 'Schedule not found' });
    res.status(200).json({ success:true, data: sched });
  } catch (error) {
    if (error && error.code === 11000) return res.status(409).json({ success:false, error: 'Schedule for this teacher on this date already exists' });
    res.status(500).json({ success:false, error: error.message });
  }
};

// @desc Delete schedule
// @route DELETE /api/schedules/:id
// @access Protected
exports.deleteSchedule = async (req, res) => {
  try {
    const sched = await Schedule.findByIdAndDelete(req.params.id);
    if (!sched) return res.status(404).json({ success:false, error: 'Schedule not found' });
    res.status(200).json({ success:true, data: {} });
  } catch (error) {
    res.status(500).json({ success:false, error: error.message });
  }
};
