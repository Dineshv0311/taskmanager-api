require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = require('./db');
const { enrichTask } = require('./gemini');

// Middleware to get user from token
async function getUser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });

  req.user = data.user;
  req.supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    }
  );
  next();
}

// GET all tasks
router.get('/tasks', getUser, async (req, res) => {
  const { data, error } = await req.supabase
    .from('tasks')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET single task
router.get('/tasks/:id', getUser, async (req, res) => {
  const { data, error } = await req.supabase
    .from('tasks')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Task not found' });
  res.json(data);
});

// POST create task with AI enrichment
router.post('/tasks', getUser, async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const ai = await enrichTask(title, description);
    const { data, error } = await req.supabase
      .from('tasks')
      .insert([{
        title,
        description: description || '',
        priority: ai.priority,
        estimated_time: ai.estimated_time,
        tags: ai.tags,
        subtasks: ai.subtasks,
        status: 'todo',
        user_id: req.user.id
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'AI enrichment failed: ' + err.message });
  }
});

// PATCH update task
router.patch('/tasks/:id', getUser, async (req, res) => {
  const { data, error } = await req.supabase
    .from('tasks')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE task
router.delete('/tasks/:id', getUser, async (req, res) => {
  const { error } = await req.supabase
    .from('tasks')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Task deleted' });
});

module.exports = router;