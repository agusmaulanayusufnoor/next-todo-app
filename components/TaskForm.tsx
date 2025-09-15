'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Todo = {
  id: string;
  task: string;
  is_complete: boolean;
};

type TaskFormProps = {
  todo?: Todo;
  onSuccess: () => void;
};

export default function TaskForm({ todo, onSuccess }: TaskFormProps) {
  const [task, setTask] = useState(todo?.task || '');
  const [isComplete, setIsComplete] = useState(todo?.is_complete || false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (todo) {
        // Update existing task
        const { error } = await supabase
          .from('todos')
          .update({ task, is_complete: isComplete })
          .eq('id', todo.id);

        if (error) throw error;
      } else {
        // Get session first
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        let userId = session?.user?.id;

        // Fallback to getUser if session is missing
        if (!userId) {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError || !user?.id) {
            throw new Error('User session not found. Please log in again.');
          }
          userId = user.id;
        }

        // Insert new task
        const { error } = await supabase.from('todos').insert([
          {
            task,
            is_complete: isComplete,
            user_id: userId,
          },
        ]);

        if (error) throw error;
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Task</label>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isComplete}
            onChange={(e) => setIsComplete(e.target.checked)}
            className="mr-2"
          />
          Completed
        </label>
      </div>
      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : todo ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  );
}
