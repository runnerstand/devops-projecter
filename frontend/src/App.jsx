import { useState, useEffect } from 'react';

// STUDENT TODO: This API_URL works for local development
// For Docker, you may need to configure nginx proxy or use container networking
const API_URL = "https://devops-todo-backend.onrender.com";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/todos`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo })
      });
      setNewTodo('');
      fetchTodos();
    } catch (err) {
      alert('Failed to add todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Remove it from the screen immediately
        setTodos(todos.filter(todo => todo.id !== id)); 
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleStatus = async (id, currentStatus, title) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, completed: !currentStatus }),
      });
      if (response.ok) {
        const updatedTodo = await response.json();
        // Update the specific task on the screen
        setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>DevOps Todo App</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          style={{ padding: '10px', width: '70%', marginRight: '10px' }}
        />
        <button onClick={addTodo} style={{ padding: '10px 20px' }}>
          Add Todo
        </button>
      </div>

      <div style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <div key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '5px' }}>
            
            <div 
              style={{ cursor: 'pointer', textDecoration: todo.completed ? 'line-through' : 'none', flexGrow: 1 }}
              onClick={() => toggleStatus(todo.id, todo.completed, todo.title)}
            >
              {todo.completed ? '✅' : '⏳'} {todo.title}
            </div>

            <button 
              onClick={() => deleteTodo(todo.id)} 
              style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;