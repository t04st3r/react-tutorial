# React Tutorial with TypeScript

A hands-on introduction to core React concepts using TypeScript. This tutorial progressively enhances a HelloWorld component to demonstrate essential React patterns and best practices.

## Table of Contents

1. [Passing Props to a Component](#1-passing-props-to-a-component)
2. [Conditional Rendering](#2-conditional-rendering)
3. [Rendering Lists](#3-rendering-lists)
4. [Keeping Components Pure](#4-keeping-components-pure)
5. [Your UI as a Tree](#5-your-ui-as-a-tree)

---

## 1. Passing Props to a Component

Props are the way React components communicate. They allow parent components to pass data to their children, making components reusable and flexible.

### Step 1: Add Props to HelloWorld

Update your HelloWorld component to accept a `name` prop:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  subtitle?: string; // Optional prop
}

const HelloWorld = ({ name, subtitle = 'Welcome to React' }: HelloWorldProps) => {
  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">{subtitle}</p>
    </div>
  );
};

export default HelloWorld;
```

### Step 2: Pass Props from App

Now pass the props from your App component:

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <HelloWorld name="World" />
      <HelloWorld name="React Developer" subtitle="Let's learn together!" />
    </div>
  );
};

export default App;
```

### Key Concepts

- **TypeScript Interface**: Define prop types with `HelloWorldProps` for type safety
- **Default Values**: Use `subtitle = 'Welcome to React'` to provide fallback values
- **Destructuring**: Extract props directly in the function parameters

### Bonus: The Children Prop

Wrap content inside your component:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const HelloWorld = ({ name, subtitle = 'Welcome to React', children }: HelloWorldProps) => {
  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">{subtitle}</p>
      {children && <div className="children-content">{children}</div>}
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
      <HelloWorld name="World">
        <p>This content is passed as children!</p>
      </HelloWorld>
    </div>
  );
};

export default App;
```

---

## 2. Conditional Rendering

Conditional rendering lets you display different UI based on certain conditions.

### Step 1: Add Conditional Props to HelloWorld

Update HelloWorld to conditionally show content:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  subtitle?: string;
  isLoggedIn?: boolean;
  messageCount?: number;
}

const HelloWorld = ({
  name,
  subtitle = 'Welcome to React',
  isLoggedIn = false,
  messageCount = 0
}: HelloWorldProps) => {
  return (
    <div className="hello-world">
      {/* Ternary operator for two alternatives */}
      <h1>{isLoggedIn ? `Welcome back, ${name}!` : `Hello, ${name}!`}</h1>

      <p className="subtitle">{subtitle}</p>

      {/* Logical AND for conditional display */}
      {isLoggedIn && (
        <div className="user-status">
          <span className="badge badge-success">Logged In</span>
        </div>
      )}

      {/* Conditional with comparison */}
      {messageCount > 0 && (
        <p className="notification">
          You have {messageCount} unread message{messageCount > 1 ? 's' : ''}
        </p>
      )}

      {/* Show different content when logged out */}
      {!isLoggedIn && (
        <button className="btn btn-primary">Sign In</button>
      )}
    </div>
  );
};

export default HelloWorld;
```

### Step 2: Control Conditions from App

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      {/* Guest user */}
      <HelloWorld name="Guest" />

      {/* Logged in user with messages */}
      <HelloWorld
        name="Alice"
        isLoggedIn={true}
        messageCount={5}
        subtitle="Great to see you again!"
      />

      {/* Logged in user without messages */}
      <HelloWorld
        name="Bob"
        isLoggedIn={true}
        messageCount={0}
      />
    </div>
  );
};

export default App;
```

### Key Patterns

- **Ternary `? :`**: Choose between two alternatives
- **Logical AND `&&`**: Show something only when condition is true
- **Early return**: Return different JSX entirely based on conditions

### Warning: Avoid Rendering Zero

```tsx
// ❌ BAD: Will render "0" when messageCount is 0
{messageCount && <p>Messages</p>}

// ✅ GOOD: Renders nothing when messageCount is 0
{messageCount > 0 && <p>Messages</p>}
```

---

## 3. Rendering Lists

Display collections of data using JavaScript's `map()` and `filter()` methods.

### Step 1: Create a List-Based HelloWorld

Update HelloWorld to display a list of people:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface Person {
  id: number;
  name: string;
  role: string;
  isActive: boolean;
}

interface HelloWorldProps {
  title: string;
  people: Person[];
  showOnlyActive?: boolean;
}

const HelloWorld = ({ title, people, showOnlyActive = false }: HelloWorldProps) => {
  // Filter the list if needed
  const displayPeople = showOnlyActive
    ? people.filter(person => person.isActive)
    : people;

  return (
    <div className="hello-world">
      <h1>{title}</h1>

      {displayPeople.length === 0 ? (
        <p className="empty-message">No people to display</p>
      ) : (
        <ul className="people-list">
          {displayPeople.map(person => (
            <li key={person.id} className="person-item">
              <span className="person-name">{person.name}</span>
              <span className="person-role">{person.role}</span>
              <span className={`badge ${person.isActive ? 'badge-success' : 'badge-inactive'}`}>
                {person.isActive ? 'Active' : 'Inactive'}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="count">
        Showing {displayPeople.length} of {people.length} people
      </p>
    </div>
  );
};

export default HelloWorld;
```

### Step 2: Pass List Data from App

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  const teamMembers = [
    { id: 1, name: 'Alice Johnson', role: 'Developer', isActive: true },
    { id: 2, name: 'Bob Smith', role: 'Designer', isActive: true },
    { id: 3, name: 'Charlie Brown', role: 'Manager', isActive: false },
    { id: 4, name: 'Diana Ross', role: 'Developer', isActive: true },
    { id: 5, name: 'Eve Wilson', role: 'QA Engineer', isActive: false },
  ];

  return (
    <div className="app">
      {/* Show all team members */}
      <HelloWorld
        title="Our Team"
        people={teamMembers}
      />

      {/* Show only active members */}
      <HelloWorld
        title="Active Team Members"
        people={teamMembers}
        showOnlyActive={true}
      />
    </div>
  );
};

export default App;
```

### Key Rules for Keys

**✅ DO:**
- Use stable, unique IDs from your data (`person.id`)
- Ensure keys are unique among siblings

**❌ DON'T:**
```tsx
// BAD: Using array index as key
{people.map((person, index) => <li key={index}>...</li>)}

// BAD: Generating random keys
{people.map(person => <li key={Math.random()}>...</li>)}
```

---

## 4. Keeping Components Pure

Pure components always return the same output for the same input and don't modify external state.

### Step 1: Understanding Pure Components

A pure HelloWorld always renders the same JSX for the same props:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  multiplier: number;
}

// ✅ PURE: Same props always produce same JSX
const HelloWorld = ({ name, multiplier }: HelloWorldProps) => {
  // Local calculations are fine
  const greeting = `Hello, ${name}!`;
  const cups: JSX.Element[] = [];

  // Local mutation is safe (creating array during render)
  for (let i = 1; i <= multiplier; i++) {
    cups.push(
      <span key={i} className="cup" title={`Cup ${i}`}>
        ☕
      </span>
    );
  }

  return (
    <div className="hello-world">
      <h1>{greeting}</h1>
      <p className="subtitle">Here are {multiplier} cups of coffee for you:</p>
      <div className="cups-container">
        {cups}
      </div>
    </div>
  );
};

export default HelloWorld;
```

### Step 2: Use from App

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <HelloWorld name="Alice" multiplier={3} />
      <HelloWorld name="Bob" multiplier={5} />
      {/* Same props = Same output (pure!) */}
      <HelloWorld name="Alice" multiplier={3} />
    </div>
  );
};

export default App;
```

### What Makes a Component Impure (Avoid This!)

```tsx
// ❌ IMPURE: Modifies external variable
let globalCount = 0;

const BadHelloWorld = ({ name }: { name: string }) => {
  globalCount++; // Side effect during render!
  return <h1>Hello #{globalCount}, {name}!</h1>;
};
```

### Where Side Effects Belong

Side effects go in **event handlers** or **useEffect**:

```tsx
// src/components/HelloWorld.tsx
import { useState } from 'react';
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  initialCups?: number;
}

const HelloWorld = ({ name, initialCups = 1 }: HelloWorldProps) => {
  const [cupCount, setCupCount] = useState(initialCups);

  // ✅ Side effect in event handler
  const handleAddCup = () => {
    setCupCount(prev => prev + 1);
    console.log('Cup added!'); // Side effects OK here
  };

  const handleRemoveCup = () => {
    setCupCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p className="subtitle">You have {cupCount} cup{cupCount !== 1 ? 's' : ''} of coffee</p>

      <div className="cups-container">
        {Array.from({ length: cupCount }, (_, i) => (
          <span key={i} className="cup">☕</span>
        ))}
      </div>

      <div className="button-group">
        <button className="btn btn-primary" onClick={handleAddCup}>
          Add Cup
        </button>
        <button className="btn btn-secondary" onClick={handleRemoveCup}>
          Remove Cup
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
      <HelloWorld name="Coffee Lover" initialCups={2} />
    </div>
  );
};

export default App;
```

### Best Practices

**✅ DO:**
- Treat props and state as read-only
- Use `setState` to update state
- Put side effects in event handlers

**❌ DON'T:**
- Modify variables outside your component during render
- Change props directly
- Make network requests during render

---

## 5. Your UI as a Tree

React models your UI as a tree structure. Understanding this helps you debug and optimize your app.

### Step 1: Create a Tree Structure

Let's visualize the component tree with nested HelloWorld components:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  level?: number;
  children?: React.ReactNode;
}

const HelloWorld = ({ name, level = 0, children }: HelloWorldProps) => {
  const indent = level * 20;

  return (
    <div
      className={`hello-world level-${level}`}
      style={{ marginLeft: `${indent}px` }}
    >
      <div className="node-header">
        <span className="tree-icon">{children ? '📁' : '📄'}</span>
        <h2 className="node-name">{name}</h2>
        <span className="level-badge">Level {level}</span>
      </div>

      {children && (
        <div className="node-children">
          {children}
        </div>
      )}
    </div>
  );
};

export default HelloWorld;
```

### Step 2: Build the Tree in App

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="app">
      <h1 className="app-title">🌳 UI Component Tree</h1>

      <div className="tree-container">
        {/* Root node */}
        <HelloWorld name="App" level={0}>

          {/* Branch: Header */}
          <HelloWorld name="Header" level={1}>
            <HelloWorld name="Logo" level={2} />
            <HelloWorld name="Navigation" level={2}>
              <HelloWorld name="NavLink: Home" level={3} />
              <HelloWorld name="NavLink: About" level={3} />
              <HelloWorld name="NavLink: Contact" level={3} />
            </HelloWorld>
          </HelloWorld>

          {/* Branch: Main Content */}
          <HelloWorld name="Main" level={1}>
            <HelloWorld name="Sidebar" level={2}>
              <HelloWorld name="Menu" level={3} />
            </HelloWorld>
            <HelloWorld name="Content" level={2}>
              <HelloWorld name="Article" level={3} />
              <HelloWorld name="Comments" level={3}>
                <HelloWorld name="Comment 1" level={4} />
                <HelloWorld name="Comment 2" level={4} />
              </HelloWorld>
            </HelloWorld>
          </HelloWorld>

          {/* Leaf: Footer */}
          <HelloWorld name="Footer" level={1} />

        </HelloWorld>
      </div>
    </div>
  );
};

export default App;
```

### Understanding the Tree

```
App (Root)
├── Header (Branch)
│   ├── Logo (Leaf)
│   └── Navigation (Branch)
│       ├── NavLink: Home (Leaf)
│       ├── NavLink: About (Leaf)
│       └── NavLink: Contact (Leaf)
├── Main (Branch)
│   ├── Sidebar (Branch)
│   │   └── Menu (Leaf)
│   └── Content (Branch)
│       ├── Article (Leaf)
│       └── Comments (Branch)
│           ├── Comment 1 (Leaf)
│           └── Comment 2 (Leaf)
└── Footer (Leaf)
```

### Key Concepts

| Component Type | Description | Example |
|---------------|-------------|---------|
| **Root** | Top-level component, entry point | `App` |
| **Branch** | Has children, passes data down | `Header`, `Main` |
| **Leaf** | No children, renders final UI | `Logo`, `Footer` |

### Why This Matters

- **Data flows down**: Props flow from parent to child (top to bottom)
- **Performance**: Changes to parent components affect all children below
- **Debugging**: Understanding the tree helps locate issues
- **Optimization**: Use `React.memo()` to skip re-renders of unchanged subtrees

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

3. Follow each section of this tutorial, updating [src/components/HelloWorld.tsx](src/components/HelloWorld.tsx) and [src/App.tsx](src/App.tsx) as you go!

---

## Additional Resources

- [React Official Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## Summary

This tutorial covered five fundamental React concepts using the HelloWorld component:

1. **Props**: Pass data to components with TypeScript interfaces
2. **Conditional Rendering**: Display different UI based on conditions
3. **Rendering Lists**: Use `map()` and `filter()` with proper keys
4. **Component Purity**: Keep components predictable, use event handlers for side effects
5. **UI as a Tree**: Understand component hierarchy and data flow

Master these concepts and you'll have a solid foundation for building React applications with TypeScript!
