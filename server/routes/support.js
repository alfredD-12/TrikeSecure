const express = require('express');
const router = express.Router();
const { requireAuth } = require('../auth/sessionAuth');

router.use(requireAuth);

router.post('/contact', async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required.' });
  }

  try {
    console.log('Support contact submission:', {
      userId: req.session?.user?.id,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Your message has been received. We will get back to you soon.' });
  } catch (error) {
    console.error('Support contact error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;