# React Tutorial with TypeScript - Part 3: Managing Complex State

A hands-on introduction to advanced state management in React using TypeScript. This tutorial continues from Parts 1 & 2, demonstrating how to properly update complex state like objects and arrays.

## Table of Contents

1. [Queueing a Series of State Updates](#1-queueing-a-series-of-state-updates)
2. [Updating Objects in State](#2-updating-objects-in-state)
3. [Updating Arrays in State](#3-updating-arrays-in-state)

---

## 1. Queueing a Series of State Updates

React batches state updates for performance. Understanding how updates are queued helps you write predictable code.

### How React Batches Updates

React waits until **all code in an event handler finishes** before processing state updates. Multiple `setState` calls trigger only one re-render.

### Step 1: Understanding the Queue

Let's visualize how React processes state updates:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

interface QueueItem {
  action: string;
  inputValue: number;
  outputValue: number;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [count, setCount] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const handleBrokenAdd3 = () => {
    // All three see count as 0 (or current snapshot)
    const snapshot = count;

    setQueue([
      { action: `setCount(${snapshot} + 1)`, inputValue: snapshot, outputValue: snapshot + 1 },
      { action: `setCount(${snapshot} + 1)`, inputValue: snapshot, outputValue: snapshot + 1 },
      { action: `setCount(${snapshot} + 1)`, inputValue: snapshot, outputValue: snapshot + 1 },
    ]);

    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    // Result: count becomes 1, not 3!
  };

  const handleCorrectAdd3 = () => {
    setQueue([
      { action: 'setCount(n => n + 1)', inputValue: count, outputValue: count + 1 },
      { action: 'setCount(n => n + 1)', inputValue: count + 1, outputValue: count + 2 },
      { action: 'setCount(n => n + 1)', inputValue: count + 2, outputValue: count + 3 },
    ]);

    setCount(n => n + 1);
    setCount(n => n + 1);
    setCount(n => n + 1);
    // Result: count becomes 3!
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">Count: {count}</p>

      <div className="button-group">
        <button className="btn btn-secondary" onClick={handleBrokenAdd3}>
          +3 (broken)
        </button>
        <button className="btn btn-primary" onClick={handleCorrectAdd3}>
          +3 (works!)
        </button>
        <button className="btn btn-secondary" onClick={() => { setCount(0); setQueue([]); }}>
          Reset
        </button>
      </div>

      {queue.length > 0 && (
        <div className="queue-visualization">
          <h3>Update Queue Processing:</h3>
          <table className="queue-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Action</th>
                <th>Input (n)</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><code>{item.action}</code></td>
                  <td>{item.inputValue}</td>
                  <td>{item.outputValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HelloWorld;
```

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <HelloWorld name="Queue Demo" />
    </div>
  );
};

export default App;
```

### Step 2: Mixed Updates - Replacement vs. Updater

When you mix direct values with updater functions, the order matters:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const handleMixedUpdates = () => {
    setLog([]);

    // Queue: replace with 5, then add 1
    setCount(5);           // "Replace with 5"
    setCount(n => n + 1);  // "Add 1 to previous"

    setLog([
      '1. setCount(5) → replaces with 5',
      '2. setCount(n => n + 1) → 5 + 1 = 6',
      'Final result: 6'
    ]);
  };

  const handleReplacementWins = () => {
    setLog([]);

    // Queue: add 1, add 1, then replace with 42
    setCount(n => n + 1);  // Would make it 1
    setCount(n => n + 1);  // Would make it 2
    setCount(42);          // Replaces everything with 42

    setLog([
      '1. setCount(n => n + 1) → 0 + 1 = 1',
      '2. setCount(n => n + 1) → 1 + 1 = 2',
      '3. setCount(42) → replaces with 42',
      'Final result: 42 (replacement wins!)'
    ]);
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">Count: {count}</p>

      <div className="button-group">
        <button className="btn btn-primary" onClick={handleMixedUpdates}>
          Set 5, then +1
        </button>
        <button className="btn btn-secondary" onClick={handleReplacementWins}>
          +1, +1, then 42
        </button>
        <button className="btn btn-secondary" onClick={() => { setCount(0); setLog([]); }}>
          Reset
        </button>
      </div>

      {log.length > 0 && (
        <div className="log-box">
          {log.map((entry, i) => (
            <p key={i}>{entry}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelloWorld;
```

### Step 3: Real-World Example - Async Request Tracker

Updater functions are essential for async operations:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [pending, setPending] = useState(0);
  const [completed, setCompleted] = useState(0);

  const handleRequest = async () => {
    // ✅ Use updater functions for async operations
    setPending(p => p + 1);

    await delay(2000); // Simulate network request

    setPending(p => p - 1);
    setCompleted(c => c + 1);
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>

      <div className="stats-grid">
        <div className="stat-card pending">
          <span className="stat-value">{pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-value">{completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleRequest}>
        Send Request (2s)
      </button>

      <p className="hint">
        Click multiple times quickly! Each request correctly tracks
        its pending/completed state using updater functions.
      </p>
    </div>
  );
};

export default HelloWorld;
```

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <HelloWorld name="Async Tracker" />
    </div>
  );
};

export default App;
```

### Naming Conventions for Updater Functions

```tsx
// Short form - first letter(s) of state variable
setCount(c => c + 1);
setEnabled(e => !e);
setFirstName(fn => fn.toUpperCase());

// Verbose form - full name or "prev" prefix
setCount(count => count + 1);
setCount(prevCount => prevCount + 1);
```

---

## 2. Updating Objects in State

Objects in state must be treated as **immutable**. Never mutate them directly—always create new copies.

### Why Mutation Doesn't Work

```tsx
// ❌ This won't trigger a re-render!
person.name = 'New Name';
setPerson(person); // Same object reference

// ✅ This works - new object reference
setPerson({ ...person, name: 'New Name' });
```

### Step 1: Basic Object Updates with Spread

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  title: string;
}

interface Person {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
}

const HelloWorld = ({ title }: HelloWorldProps) => {
  const [person, setPerson] = useState<Person>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    age: 25
  });

  // Generic handler for any field
  const handleChange = (field: keyof Person, value: string | number) => {
    setPerson({
      ...person,      // Copy all existing fields
      [field]: value  // Override the specific field
    });
  };

  return (
    <div className="hello-world">
      <h1>{title}</h1>

      <div className="form-grid">
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            value={person.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            value={person.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={person.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            value={person.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
            className="input"
          />
        </div>
      </div>

      <div className="preview-card">
        <h3>Preview:</h3>
        <p><strong>{person.firstName} {person.lastName}</strong></p>
        <p>{person.email}</p>
        <p>Age: {person.age}</p>
      </div>
    </div>
  );
};

export default HelloWorld;
```

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <HelloWorld title="Edit Profile" />
    </div>
  );
};

export default App;
```

### Step 2: Updating Nested Objects

For nested objects, you must spread at **each level**:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  title: string;
}

interface Address {
  street: string;
  city: string;
  country: string;
}

interface UserProfile {
  name: string;
  address: Address;
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

const HelloWorld = ({ title }: HelloWorldProps) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alice',
    address: {
      street: '123 Main St',
      city: 'New York',
      country: 'USA'
    },
    settings: {
      theme: 'light',
      notifications: true
    }
  });

  // Update name (top level)
  const handleNameChange = (name: string) => {
    setProfile({
      ...profile,
      name
    });
  };

  // Update address (nested object)
  const handleAddressChange = (field: keyof Address, value: string) => {
    setProfile({
      ...profile,
      address: {
        ...profile.address,  // Spread the nested object too!
        [field]: value
      }
    });
  };

  // Update settings (nested object)
  const handleThemeToggle = () => {
    setProfile({
      ...profile,
      settings: {
        ...profile.settings,
        theme: profile.settings.theme === 'light' ? 'dark' : 'light'
      }
    });
  };

  const handleNotificationsToggle = () => {
    setProfile({
      ...profile,
      settings: {
        ...profile.settings,
        notifications: !profile.settings.notifications
      }
    });
  };

  return (
    <div className="hello-world">
      <h1>{title}</h1>

      {/* Name - Top level */}
      <div className="section">
        <h3>Basic Info</h3>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Address - Nested */}
      <div className="section">
        <h3>Address</h3>
        <div className="form-group">
          <label>Street:</label>
          <input
            type="text"
            value={profile.address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            className="input"
          />
        </div>
        <div className="form-group">
          <label>City:</label>
          <input
            type="text"
            value={profile.address.city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            className="input"
          />
        </div>
        <div className="form-group">
          <label>Country:</label>
          <input
            type="text"
            value={profile.address.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Settings - Nested */}
      <div className="section">
        <h3>Settings</h3>
        <div className="toggle-group">
          <button
            className={`btn ${profile.settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleThemeToggle}
          >
            Theme: {profile.settings.theme}
          </button>
          <button
            className={`btn ${profile.settings.notifications ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleNotificationsToggle}
          >
            Notifications: {profile.settings.notifications ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="preview-card">
        <h3>Current State:</h3>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </div>
    </div>
  );
};

export default HelloWorld;
```

### Step 3: Interactive Position Tracker

A practical example with mouse tracking:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

interface Position {
  x: number;
  y: number;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [history, setHistory] = useState<Position[]>([]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newPosition = {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    };

    setPosition(newPosition);

    // Add to history (also immutable update!)
    setHistory(prev => [...prev.slice(-9), newPosition]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>

      <div
        className="tracking-area"
        onPointerMove={handlePointerMove}
      >
        <div
          className="cursor-dot"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`
          }}
        />
        <p className="tracking-label">Move your cursor here</p>
      </div>

      <div className="position-display">
        <p>Position: <code>{'{'} x: {position.x}, y: {position.y} {'}'}</code></p>
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <h3>Recent Positions:</h3>
            <button className="btn btn-secondary" onClick={clearHistory}>
              Clear
            </button>
          </div>
          <div className="history-list">
            {history.map((pos, i) => (
              <span key={i} className="history-item">
                ({pos.x}, {pos.y})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelloWorld;
```

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <HelloWorld name="Position Tracker" />
    </div>
  );
};

export default App;
```

### Key Rules for Objects

| Do | Don't |
|---|---|
| `setPerson({...person, name: 'New'})` | `person.name = 'New'` |
| Create new objects | Mutate existing objects |
| Spread at each nesting level | Shallow copy nested objects |

---

## 3. Updating Arrays in State

Like objects, arrays must be treated as immutable. Use methods that return new arrays instead of mutating.

### Methods Reference

| Operation | ❌ Mutates (avoid) | ✅ Returns New Array (use) |
|-----------|-------------------|---------------------------|
| **Adding** | `push`, `unshift` | `[...arr, item]`, `concat` |
| **Removing** | `pop`, `shift`, `splice` | `filter`, `slice` |
| **Replacing** | `splice`, `arr[i] = x` | `map` |
| **Sorting** | `sort`, `reverse` | Copy first: `[...arr].sort()` |

### Step 1: Adding and Removing Items

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  title: string;
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

let nextId = 1;

const HelloWorld = ({ title }: HelloWorldProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');

  // ADD: Use spread to create new array
  const handleAddTask = () => {
    if (!inputValue.trim()) return;

    setTasks([
      ...tasks,  // Keep existing items
      { id: nextId++, text: inputValue, completed: false }  // Add new item
    ]);
    setInputValue('');
  };

  // ADD TO START: New item first
  const handleAddToStart = () => {
    if (!inputValue.trim()) return;

    setTasks([
      { id: nextId++, text: inputValue, completed: false },  // New item first
      ...tasks  // Then existing items
    ]);
    setInputValue('');
  };

  // REMOVE: Use filter to exclude item
  const handleRemoveTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // CLEAR ALL
  const handleClearAll = () => {
    setTasks([]);
  };

  return (
    <div className="hello-world">
      <h1>{title}</h1>

      <div className="input-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Enter a task..."
          className="input"
        />
        <button className="btn btn-primary" onClick={handleAddTask}>
          Add to End
        </button>
        <button className="btn btn-secondary" onClick={handleAddToStart}>
          Add to Start
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="empty-message">No tasks yet. Add one above!</p>
      ) : (
        <>
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className="task-item">
                <span className="task-text">{task.text}</span>
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveTask(task.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button className="btn btn-secondary" onClick={handleClearAll}>
            Clear All
          </button>
        </>
      )}
    </div>
  );
};

export default HelloWorld;
```

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <HelloWorld title="Task List" />
    </div>
  );
};

export default App;
```

### Step 2: Transforming and Replacing Items

Use `map()` to transform or replace items:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  title: string;
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const initialTasks: Task[] = [
  { id: 1, text: 'Learn React', completed: true },
  { id: 2, text: 'Learn TypeScript', completed: false },
  { id: 3, text: 'Build a project', completed: false },
];

const HelloWorld = ({ title }: HelloWorldProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // TOGGLE: Use map to replace one item
  const handleToggle = (id: number) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        // Return NEW object with toggled completed
        return { ...task, completed: !task.completed };
      }
      return task;  // Return unchanged
    }));
  };

  // TRANSFORM ALL: Mark all as completed
  const handleCompleteAll = () => {
    setTasks(tasks.map(task => ({
      ...task,
      completed: true
    })));
  };

  // TRANSFORM ALL: Reset all
  const handleResetAll = () => {
    setTasks(tasks.map(task => ({
      ...task,
      completed: false
    })));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="hello-world">
      <h1>{title}</h1>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(completedCount / tasks.length) * 100}%` }}
        />
        <span className="progress-text">
          {completedCount} / {tasks.length} completed
        </span>
      </div>

      <ul className="task-list">
        {tasks.map(task => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
            onClick={() => handleToggle(task.id)}
          >
            <span className="checkbox">
              {task.completed ? '✓' : '○'}
            </span>
            <span className="task-text">{task.text}</span>
          </li>
        ))}
      </ul>

      <div className="button-group">
        <button className="btn btn-primary" onClick={handleCompleteAll}>
          Complete All
        </button>
        <button className="btn btn-secondary" onClick={handleResetAll}>
          Reset All
        </button>
      </div>
    </div>
  );
};

export default HelloWorld;
```

### Step 3: Inserting at a Specific Position

Use `slice()` to insert at any position:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  title: string;
}

const HelloWorld = ({ title }: HelloWorldProps) => {
  const [items, setItems] = useState<string[]>(['First', 'Second', 'Third']);
  const [newItem, setNewItem] = useState('');
  const [insertIndex, setInsertIndex] = useState(0);

  const handleInsert = () => {
    if (!newItem.trim()) return;

    // Use slice to insert at specific position
    const newItems = [
      ...items.slice(0, insertIndex),  // Items before insertion point
      newItem,                          // New item
      ...items.slice(insertIndex)       // Items after insertion point
    ];

    setItems(newItems);
    setNewItem('');
  };

  return (
    <div className="hello-world">
      <h1>{title}</h1>

      <div className="insert-controls">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="New item..."
          className="input"
        />
        <select
          value={insertIndex}
          onChange={(e) => setInsertIndex(parseInt(e.target.value))}
          className="select"
        >
          {items.map((_, index) => (
            <option key={index} value={index}>
              Before "{items[index]}"
            </option>
          ))}
          <option value={items.length}>At the end</option>
        </select>
        <button className="btn btn-primary" onClick={handleInsert}>
          Insert
        </button>
      </div>

      <ul className="item-list">
        {items.map((item, index) => (
          <li key={index} className="item">
            <span className="item-index">{index}</span>
            <span className="item-text">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HelloWorld;
```

### Step 4: Sorting and Reversing

**Always copy the array first** before using mutating methods:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  title: string;
}

interface Person {
  id: number;
  name: string;
  age: number;
}

const initialPeople: Person[] = [
  { id: 1, name: 'Charlie', age: 35 },
  { id: 2, name: 'Alice', age: 28 },
  { id: 3, name: 'Bob', age: 42 },
  { id: 4, name: 'Diana', age: 31 },
];

const HelloWorld = ({ title }: HelloWorldProps) => {
  const [people, setPeople] = useState<Person[]>(initialPeople);

  // SORT: Copy first, then sort
  const sortByName = () => {
    const sorted = [...people].sort((a, b) => a.name.localeCompare(b.name));
    setPeople(sorted);
  };

  const sortByAge = () => {
    const sorted = [...people].sort((a, b) => a.age - b.age);
    setPeople(sorted);
  };

  // REVERSE: Copy first, then reverse
  const reverseOrder = () => {
    const reversed = [...people].reverse();
    setPeople(reversed);
  };

  // RESET
  const resetOrder = () => {
    setPeople(initialPeople);
  };

  return (
    <div className="hello-world">
      <h1>{title}</h1>

      <div className="button-group">
        <button className="btn btn-primary" onClick={sortByName}>
          Sort by Name
        </button>
        <button className="btn btn-primary" onClick={sortByAge}>
          Sort by Age
        </button>
        <button className="btn btn-secondary" onClick={reverseOrder}>
          Reverse
        </button>
        <button className="btn btn-secondary" onClick={resetOrder}>
          Reset
        </button>
      </div>

      <ul className="people-list">
        {people.map(person => (
          <li key={person.id} className="person-item">
            <span className="person-name">{person.name}</span>
            <span className="person-age">Age: {person.age}</span>
          </li>
        ))}
      </ul>

      <div className="info-box">
        <p><strong>Important:</strong> Always use <code>[...array]</code> before <code>.sort()</code> or <code>.reverse()</code>!</p>
        <code>
          const sorted = [...people].sort(...); // ✅ Correct
        </code>
      </div>
    </div>
  );
};

export default HelloWorld;
```

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <HelloWorld title="Sortable List" />
    </div>
  );
};

export default App;
```

### Step 5: Updating Objects Inside Arrays

This is a common pattern—use `map()` to create new objects:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  title: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const initialCart: CartItem[] = [
  { id: 1, name: 'React Book', price: 29.99, quantity: 1 },
  { id: 2, name: 'TypeScript Course', price: 49.99, quantity: 1 },
  { id: 3, name: 'Coffee Mug', price: 12.99, quantity: 2 },
];

const HelloWorld = ({ title }: HelloWorldProps) => {
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  // UPDATE OBJECT IN ARRAY: Use map + spread
  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };  // New object!
      }
      return item;
    }));
  };

  // REMOVE: Filter out items with 0 quantity
  const removeEmpty = () => {
    setCart(cart.filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="hello-world">
      <h1>{title}</h1>

      <div className="cart-list">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-price">${item.price.toFixed(2)}</span>
            </div>

            <div className="quantity-controls">
              <button
                className="btn-quantity"
                onClick={() => updateQuantity(item.id, -1)}
              >
                -
              </button>
              <span className="quantity-value">{item.quantity}</span>
              <button
                className="btn-quantity"
                onClick={() => updateQuantity(item.id, 1)}
              >
                +
              </button>
            </div>

            <span className="cart-item-subtotal">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <span>Total:</span>
        <span className="total-value">${total.toFixed(2)}</span>
      </div>

      <button className="btn btn-secondary" onClick={removeEmpty}>
        Remove Empty Items
      </button>
    </div>
  );
};

export default HelloWorld;
```

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <HelloWorld title="Shopping Cart" />
    </div>
  );
};

export default App;
```

### Common Mistake: Shallow Copy

```tsx
// ❌ WRONG: Shallow copy still mutates the object!
const newCart = [...cart];
const item = newCart.find(i => i.id === id);
item.quantity = 5;  // Mutates the original object!
setCart(newCart);

// ✅ CORRECT: Create new object with map
setCart(cart.map(item =>
  item.id === id
    ? { ...item, quantity: 5 }  // New object
    : item
));
```

---

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Follow each section, updating [src/components/HelloWorld.tsx](src/components/HelloWorld.tsx) and [src/App.tsx](src/App.tsx) as you go!

---

## Additional Resources

- [React Official Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Immer Library](https://immerjs.github.io/immer/) - For complex state updates

---

## Summary

This tutorial covered three advanced state management concepts:

1. **Queueing State Updates**: Use updater functions (`n => n + 1`) for multiple updates and async code
2. **Updating Objects**: Use spread syntax (`{...obj, prop: value}`) at each nesting level
3. **Updating Arrays**: Use `map()`, `filter()`, `slice()`, and spread—never mutate directly

Master these patterns to handle any state complexity in your React applications with TypeScript!
