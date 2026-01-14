# React Tutorial with TypeScript - Part 2: Adding Interactivity

A hands-on introduction to React interactivity concepts using TypeScript. This tutorial continues from Part 1, progressively enhancing the HelloWorld component to demonstrate event handling, state management, and React's rendering behavior.

## Table of Contents

1. [Responding to Events](#1-responding-to-events)
2. [State: A Component's Memory](#2-state-a-components-memory)
3. [Render and Commit](#3-render-and-commit)
4. [State as a Snapshot](#4-state-as-a-snapshot)

---

## 1. Responding to Events

React lets you add **event handlers** to JSX—functions that trigger in response to user interactions like clicking, hovering, and typing.

### Step 1: Add a Basic Event Handler

Update HelloWorld to handle a button click:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  // Define the event handler inside the component
  const handleClick = () => {
    alert(`Hello, ${name}! You clicked the button.`);
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <button className="btn btn-primary" onClick={handleClick}>
        Click me
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
      <HelloWorld name="World" />
    </div>
  );
};

export default App;
```

### Key Concepts

**Naming Convention**: Event handlers start with `handle` followed by the event name (`handleClick`, `handleSubmit`, `handleMouseEnter`).

**Pass, Don't Call**: Notice we pass `onClick={handleClick}` without parentheses. Adding parentheses would call the function immediately during render!

```tsx
// ✅ Correct - passes the function reference
<button onClick={handleClick}>

// ❌ Wrong - calls the function immediately during render
<button onClick={handleClick()}>
```

### Step 2: Inline Event Handlers

For simple logic, you can define handlers inline:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>

      {/* Inline handler with arrow function */}
      <button
        className="btn btn-primary"
        onClick={() => alert(`Hello, ${name}!`)}
      >
        Greet
      </button>

      {/* Another inline handler */}
      <button
        className="btn btn-secondary"
        onMouseEnter={() => console.log('Mouse entered!')}
      >
        Hover over me
      </button>
    </div>
  );
};

export default HelloWorld;
```

### Step 3: Passing Event Handlers as Props

Parent components can control child behavior by passing handlers as props:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  onGreet: (name: string) => void;  // Event handler prop
  onDismiss?: () => void;           // Optional handler
}

const HelloWorld = ({ name, onGreet, onDismiss }: HelloWorldProps) => {
  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={() => onGreet(name)}
        >
          Greet
        </button>

        {onDismiss && (
          <button
            className="btn btn-secondary"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        )}
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
  // Define handlers in the parent
  const handleGreet = (name: string) => {
    alert(`Greetings, ${name}! Welcome to React.`);
  };

  const handleDismiss = () => {
    console.log('Card dismissed');
  };

  return (
    <div className="app">
      <HelloWorld
        name="Alice"
        onGreet={handleGreet}
        onDismiss={handleDismiss}
      />
      <HelloWorld
        name="Bob"
        onGreet={handleGreet}
        // No onDismiss - button won't show
      />
    </div>
  );
};

export default App;
```

### Step 4: Event Propagation and Stopping It

Events **bubble up** the component tree. Use `e.stopPropagation()` to prevent this:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  onCardClick?: () => void;
}

const HelloWorld = ({ name, onCardClick }: HelloWorldProps) => {
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevents the card click from firing
    alert(`Button clicked for ${name}`);
  };

  return (
    <div
      className="hello-world"
      onClick={onCardClick}
      style={{ cursor: onCardClick ? 'pointer' : 'default' }}
    >
      <h1>Hello, {name}!</h1>
      <p className="subtitle">Click the card or the button</p>

      <button className="btn btn-primary" onClick={handleButtonClick}>
        Click me (stops propagation)
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
      <HelloWorld
        name="World"
        onCardClick={() => alert('Card was clicked!')}
      />
    </div>
  );
};

export default App;
```

### Step 5: Preventing Default Behavior

Use `e.preventDefault()` to stop default browser actions (like form submission):

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  title: string;
  onSubmit: (value: string) => void;
}

const HelloWorld = ({ title, onSubmit }: HelloWorldProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents page reload
    const formData = new FormData(e.currentTarget);
    const inputValue = formData.get('greeting') as string;
    onSubmit(inputValue);
  };

  return (
    <div className="hello-world">
      <h1>{title}</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="greeting"
          placeholder="Enter a greeting..."
          className="input"
        />
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default HelloWorld;
```

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  const handleFormSubmit = (value: string) => {
    alert(`You submitted: ${value}`);
  };

  return (
    <div className="app">
      <HelloWorld title="Greeting Form" onSubmit={handleFormSubmit} />
    </div>
  );
};

export default App;
```

### Key Differences

| Method | Purpose |
|--------|---------|
| `e.stopPropagation()` | Stops event from bubbling to parent handlers |
| `e.preventDefault()` | Prevents default browser behavior (form submit, link navigation) |

---

## 2. State: A Component's Memory

State allows components to "remember" information between renders. Regular variables reset on every render—state persists.

### Why Regular Variables Don't Work

```tsx
// ❌ This won't work - variable resets on every render
const HelloWorld = ({ name }: { name: string }) => {
  let count = 0; // Resets to 0 every render

  const handleClick = () => {
    count = count + 1; // Changes don't trigger re-render
    console.log(count); // Logs correctly but UI won't update
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p>Count: {count}</p> {/* Always shows 0 */}
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};
```

### Step 1: Using useState

The `useState` hook solves both problems—it persists values AND triggers re-renders:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  initialCount?: number;
}

const HelloWorld = ({ name, initialCount = 0 }: HelloWorldProps) => {
  // useState returns [currentValue, setterFunction]
  const [count, setCount] = useState(initialCount);

  const handleIncrement = () => {
    setCount(count + 1); // Updates state AND triggers re-render
  };

  const handleDecrement = () => {
    setCount(count - 1);
  };

  const handleReset = () => {
    setCount(initialCount);
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">Count: {count}</p>

      <div className="button-group">
        <button className="btn btn-secondary" onClick={handleDecrement}>
          -
        </button>
        <button className="btn btn-primary" onClick={handleIncrement}>
          +
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
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
      <HelloWorld name="Counter Demo" initialCount={0} />
      <HelloWorld name="Another Counter" initialCount={10} />
    </div>
  );
};

export default App;
```

### Step 2: Multiple State Variables

Components can have multiple independent state variables:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [count, setCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>

      {/* State 1: Counter */}
      <div className="section">
        <p>Count: {count}</p>
        <button className="btn btn-primary" onClick={() => setCount(count + 1)}>
          Increment
        </button>
      </div>

      {/* State 2: Toggle */}
      <div className="section">
        <button
          className="btn btn-secondary"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
        {showDetails && (
          <p className="details">These are the hidden details!</p>
        )}
      </div>

      {/* State 3: Text Input */}
      <div className="section">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="input"
        />
        {message && <p>You typed: {message}</p>}
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
      <HelloWorld name="Multi-State Demo" />
    </div>
  );
};

export default App;
```

### State is Isolated and Private

Each component instance has its own independent state:

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  // Each HelloWorld has its own count state!
  return (
    <div className="app">
      <HelloWorld name="Counter A" initialCount={0} />
      <HelloWorld name="Counter B" initialCount={0} />
      {/* Clicking one doesn't affect the other */}
    </div>
  );
};

export default App;
```

### Rules for Hooks

**Hooks must be called at the top level of your component:**

```tsx
// ❌ WRONG - Hook inside a condition
const HelloWorld = ({ showCounter }: { showCounter: boolean }) => {
  if (showCounter) {
    const [count, setCount] = useState(0); // Error!
  }
  return <div>...</div>;
};

// ✅ CORRECT - Hook at top level, condition in JSX
const HelloWorld = ({ showCounter }: { showCounter: boolean }) => {
  const [count, setCount] = useState(0); // Always called

  return (
    <div className="hello-world">
      {showCounter && <p>Count: {count}</p>}
    </div>
  );
};
```

---

## 3. Render and Commit

React updates the screen in three phases: **Trigger → Render → Commit**. Understanding this helps explain when and how your code runs.

### The Three Phases

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   TRIGGER   │ ──► │   RENDER    │ ──► │   COMMIT    │
│             │     │             │     │             │
│ • Initial   │     │ React calls │     │ React       │
│   render    │     │ component   │     │ updates     │
│ • setState  │     │ functions   │     │ the DOM     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Step 1: Visualizing the Render Cycle

Let's create a component that shows render behavior:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

// This log runs during the RENDER phase
let renderCount = 0;

const HelloWorld = ({ name }: HelloWorldProps) => {
  renderCount++;
  console.log(`Render #${renderCount} - HelloWorld is rendering`);

  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // These calculations happen during RENDER (must be pure!)
  const doubled = count * 2;
  const isEven = count % 2 === 0;

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>

      <div className="info-box">
        <p>Component has rendered {renderCount} time(s)</p>
        <p>Count: {count} (doubled: {doubled})</p>
        <p>Number is {isEven ? 'even' : 'odd'}</p>
      </div>

      <div className="button-group">
        {/* Clicking triggers a re-render */}
        <button
          className="btn btn-primary"
          onClick={() => setCount(count + 1)}
        >
          Increment (triggers render)
        </button>
      </div>

      <div className="section">
        {/* Typing triggers a re-render on each keystroke */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type to trigger renders..."
          className="input"
        />
        <p className="hint">Each keystroke triggers a render!</p>
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
      <h1 className="app-title">Render & Commit Demo</h1>
      <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Open the console to see render logs
      </p>
      <HelloWorld name="Render Demo" />
    </div>
  );
};

export default App;
```

### Step 2: Triggers for Re-renders

There are two triggers for rendering:

1. **Initial render**: When the app first loads
2. **State updates**: When `setState` is called

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [triggerLog, setTriggerLog] = useState<string[]>([
    'Initial render triggered'
  ]);

  const addTrigger = (reason: string) => {
    // Each setTriggerLog call triggers a new render
    setTriggerLog(prev => [...prev, reason]);
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={() => addTrigger('Button A clicked')}
        >
          Trigger A
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => addTrigger('Button B clicked')}
        >
          Trigger B
        </button>
      </div>

      <div className="log-box">
        <h3>Render Triggers:</h3>
        <ul className="trigger-list">
          {triggerLog.map((log, index) => (
            <li key={index}>{index + 1}. {log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HelloWorld;
```

### Step 3: React Only Updates What Changed

React is efficient—it only updates DOM elements that actually changed:

```tsx
// src/components/HelloWorld.tsx
import { useState, useEffect } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [inputValue, setInputValue] = useState('');

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>

      {/* This updates every second */}
      <p className="time-display">Current time: {time}</p>

      {/* This input is NOT affected by time updates */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type here - won't be affected by time updates"
        className="input"
      />

      <p className="hint">
        Notice: The input keeps your text even though the component
        re-renders every second. React only updates the time display!
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
      <HelloWorld name="Efficient Updates" />
    </div>
  );
};

export default App;
```

### Key Takeaways

- **Trigger**: Initial render or `setState()` call
- **Render**: React calls your component function (must be pure!)
- **Commit**: React updates only the changed DOM elements
- **Browser Paint**: The browser repaints the screen

---

## 4. State as a Snapshot

State behaves like a **snapshot**—it's fixed for the duration of a render. Understanding this prevents confusing bugs.

### Step 1: The Snapshot Problem

Each render gets its own snapshot of state that doesn't change:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // All three use the SAME snapshot value (0 on first click)
    setCount(count + 1); // Schedules: 0 + 1 = 1
    setCount(count + 1); // Schedules: 0 + 1 = 1 (not 2!)
    setCount(count + 1); // Schedules: 0 + 1 = 1 (not 3!)

    // count is still 0 here - it's a snapshot!
    console.log('Count in handler:', count); // Logs 0
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">Count: {count}</p>

      <button className="btn btn-primary" onClick={handleClick}>
        +3 (but only adds 1!)
      </button>

      <p className="hint">
        Click the button and check the console.
        Even though we call setCount 3 times, count only increases by 1!
      </p>
    </div>
  );
};

export default HelloWorld;
```

### Step 2: Understanding Why

Let's visualize what happens:

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

  const handleBrokenIncrement = () => {
    const snapshot = count; // Capture the snapshot value

    setLog(prev => [...prev, `Snapshot value: ${snapshot}`]);
    setLog(prev => [...prev, `setCount(${snapshot} + 1) = ${snapshot + 1}`]);
    setLog(prev => [...prev, `setCount(${snapshot} + 1) = ${snapshot + 1}`]);
    setLog(prev => [...prev, `setCount(${snapshot} + 1) = ${snapshot + 1}`]);
    setLog(prev => [...prev, `Result: count becomes ${snapshot + 1}, not ${snapshot + 3}`]);
    setLog(prev => [...prev, '---']);

    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">Count: {count}</p>

      <button className="btn btn-primary" onClick={handleBrokenIncrement}>
        +3 (broken - only adds 1)
      </button>

      <button className="btn btn-secondary" onClick={() => setLog([])}>
        Clear Log
      </button>

      {log.length > 0 && (
        <div className="log-box">
          {log.map((entry, i) => (
            <p key={i} className="log-entry">{entry}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelloWorld;
```

### Step 3: The Solution - Updater Functions

To increment multiple times, use an **updater function** that receives the pending state:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [count, setCount] = useState(0);

  const handleBrokenIncrement = () => {
    // ❌ Uses snapshot - only increments by 1
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  const handleCorrectIncrement = () => {
    // ✅ Uses updater function - increments by 3
    setCount(prev => prev + 1); // 0 → 1
    setCount(prev => prev + 1); // 1 → 2
    setCount(prev => prev + 1); // 2 → 3
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">Count: {count}</p>

      <div className="button-group">
        <button className="btn btn-secondary" onClick={handleBrokenIncrement}>
          +3 (broken)
        </button>
        <button className="btn btn-primary" onClick={handleCorrectIncrement}>
          +3 (works!)
        </button>
        <button className="btn btn-secondary" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>

      <div className="info-box">
        <h3>Difference:</h3>
        <code>setCount(count + 1)</code> - uses snapshot (stale)
        <br />
        <code>setCount(prev =&gt; prev + 1)</code> - uses latest value
      </div>
    </div>
  );
};

export default HelloWorld;
```

### Step 4: State Snapshot in Async Code

The snapshot is captured when the event handler is created, not when it runs:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [count, setCount] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);

  const handleClick = () => {
    const snapshotValue = count; // Capture for demonstration

    setCount(count + 5);

    // This alert will show the OLD value (snapshot)
    setTimeout(() => {
      setAlerts(prev => [
        ...prev,
        `Alert after 3s: count was ${snapshotValue} when clicked`
      ]);
    }, 3000);
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">Count: {count}</p>

      <button className="btn btn-primary" onClick={handleClick}>
        +5 and show alert in 3 seconds
      </button>

      <p className="hint">
        Click multiple times quickly! Each alert shows the count
        value from when THAT click happened (the snapshot).
      </p>

      {alerts.length > 0 && (
        <div className="log-box">
          <h3>Delayed Alerts:</h3>
          {alerts.map((alert, i) => (
            <p key={i}>{alert}</p>
          ))}
          <button
            className="btn btn-secondary"
            onClick={() => setAlerts([])}
          >
            Clear
          </button>
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
      <HelloWorld name="Snapshot Demo" />
    </div>
  );
};

export default App;
```

### Step 5: Practical Example - Form with Delayed Submit

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => {
  const [to, setTo] = useState('Alice');
  const [message, setMessage] = useState('Hello!');
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Capture snapshots
    const snapshotTo = to;
    const snapshotMessage = message;

    setStatus('Sending...');

    // Simulate network delay
    setTimeout(() => {
      // Uses snapshot values, not current input values!
      setStatus(`Sent "${snapshotMessage}" to ${snapshotTo}`);
    }, 2000);
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>To:</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="select"
          >
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
            <option value="Charlie">Charlie</option>
          </select>
        </div>

        <div className="form-group">
          <label>Message:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Send (2s delay)
        </button>
      </form>

      {status && <p className="status">{status}</p>}

      <p className="hint">
        Try this: Click Send, then quickly change the recipient.
        The message still goes to the original recipient (snapshot)!
      </p>
    </div>
  );
};

export default HelloWorld;
```

### Key Takeaways

| Concept | Explanation |
|---------|-------------|
| **Snapshot** | State value is fixed within a render |
| **Multiple setStates** | All use the same snapshot value |
| **Updater function** | `prev => prev + 1` gets the pending state |
| **Async code** | setTimeout/fetch use the snapshot from when handler was created |

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
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## Summary

This tutorial covered four fundamental React interactivity concepts:

1. **Responding to Events**: Add handlers with `onClick`, pass handlers as props, control propagation
2. **State: A Component's Memory**: Use `useState` to persist values and trigger re-renders
3. **Render and Commit**: Understand the Trigger → Render → Commit cycle
4. **State as a Snapshot**: State is fixed per render; use updater functions for sequential updates

Master these concepts to build truly interactive React applications with TypeScript!
