# React Escape Hatches Tutorial

This tutorial covers the **Escape Hatches** section of the official React docs: advanced tools for stepping outside React's declarative model when you need to.

We start from the existing `HelloWorld` component and evolve it step-by-step into a **stopwatch with a focusable input**, introducing all 8 concepts along the way.

> Official reference: [react.dev/learn/escape-hatches](https://react.dev/learn/escape-hatches)

---

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Starting Point

```
src/
  main.tsx                  — entry point, wraps App in <StrictMode>
  App.tsx                   — renders <HelloWorld />
  components/
    HelloWorld.tsx           — <div><h1>Hello, world!</h1></div>
    HelloWorld.scss
```

---

## Step 1 — Referencing Values with `useRef`

**Concept:** `useRef` stores a mutable value that **survives re-renders without causing them**.

Update `src/components/HelloWorld.tsx`:

```tsx
import { useRef, useState } from 'react';
import './HelloWorld.scss';

function HelloWorld() {
  const [count, setCount] = useState(0);
  const renderCount = useRef(0);
  renderCount.current += 1;          // mutate directly — no re-render triggered

  return (
    <div className="hello-world">
      <h1>Hello, world!</h1>
      <p>State: {count} — Renders: {renderCount.current}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

export default HelloWorld;
```

> **Key takeaways**
> - `renderCount.current` increments on every render but **never triggers one**
> - `useState` triggers a re-render; `useRef` does not
> - Use refs for values only needed by event handlers or effects — never for anything that affects the rendered output

---

## Step 2 — Manipulating the DOM with Refs

**Concept:** Pass a ref to a JSX element to get a direct handle on the underlying DOM node after mount.

Extend `HelloWorld.tsx`:

```tsx
import { useRef, useState } from 'react';
import './HelloWorld.scss';

function HelloWorld() {
  const [count, setCount] = useState(0);
  const renderCount = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);  // null until after first render
  renderCount.current += 1;

  return (
    <div className="hello-world">
      <h1>Hello, world!</h1>
      <p>State: {count} — Renders: {renderCount.current}</p>
      <input ref={inputRef} placeholder="Type here..." />
      <button onClick={() => inputRef.current?.focus()}>Focus input</button>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

export default HelloWorld;
```

**Why React can't do focus/scroll declaratively**

React's model is declarative: you describe *what* the UI should look like and React figures out *how* to update the DOM. That works perfectly for things that map to a visible state — show this text, apply this class, hide this element.

But some browser APIs are **imperative by nature** — they don't describe a desired state, they trigger a one-time action:

- `element.focus()` — moves keyboard focus to an element *right now*
- `element.scrollIntoView()` — scrolls the viewport *right now*
- `element.getBoundingClientRect()` — reads the element's size/position *right now*

There is no JSX prop or React state that means "this input is currently focused". Focus is not a property of the DOM node's state; it is a transient browser behaviour triggered by a call. React has no declarative equivalent — so you have to step outside React and call the browser API directly, which is exactly what a ref gives you access to.

A useful rule of thumb: if what you want to do would be expressed as a **method call** on a DOM element rather than an **attribute or property** of it, you need a ref.

**Why you must never mutate DOM nodes that React manages**

React maintains a **virtual DOM** — an in-memory description of what the real DOM should look like. On every render it computes the difference between the old and new virtual DOM (reconciliation), then applies only the necessary changes to the real DOM.

When you grab a node via a ref and mutate it directly — changing its text, hiding it with `style.display = 'none'`, removing a child — you change the **real DOM** without telling React. React's virtual DOM still holds the old picture. The next time any state change triggers a re-render, React will diff its virtual DOM against what it *thinks* the real DOM looks like, not what it actually looks like, and may silently overwrite your change or crash trying to apply an invalid diff.

```tsx
// ❌ Hiding a node manually
ref.current.style.display = 'none';

// Later, React re-renders due to some state change.
// React's virtual DOM says the element is visible.
// React does NOT re-apply display:none — it thinks the DOM already
// matches its virtual DOM. Your change is silently lost.
```

The safe boundary is:
- ✅ **Read-only or one-shot actions** (`focus()`, `scrollIntoView()`, `getBoundingClientRect()`) — React doesn't track these, so they can't corrupt its picture
- ❌ **Modifying content, structure, styles, or attributes** on nodes React rendered — those are owned by the reconciler


> **Key takeaways**
> - `ref.current` is `null` until after the first render (React sets it during the **commit phase**)
> - Reach for a ref when you need to trigger a one-time imperative browser action — `focus()`, `scrollIntoView()`, reading size/position — that has no declarative JSX equivalent
> - **Never mutate content, structure, or styles** of DOM nodes React rendered — you will desync its virtual DOM and produce inconsistent UI or crashes

---

## Step 3 — Synchronizing with Effects (`useEffect`)

**Concept:** `useEffect` runs *after* rendering to synchronize your component with something outside React — timers, subscriptions, browser APIs.

React components are supposed to be **pure**: given the same props/state, they return the same JSX. But real apps need to talk to the outside world — start a timer, open a WebSocket, subscribe to an event. These are **side effects**: they reach outside the component and affect something React doesn't control. `useEffect` is the designated place for them.

```
render → commit DOM → [useEffect runs] → ... → [cleanup runs] → re-render → ...
```

Without `useEffect` you'd be tempted to put side effects directly in the render function, which breaks React's rendering guarantees (renders can be called multiple times, cancelled, or run in strict mode twice). `useEffect` defers the side effect until *after* React has safely updated the DOM.

**Plugging into the component lifecycle via the dependency array**

The second argument to `useEffect` — the dependency array — controls *when* the effect runs, effectively mapping to the classic component lifecycle:

```
useEffect(fn)           // no array  → runs after every render        (componentDidUpdate)
useEffect(fn, [])       // empty     → runs once after mount           (componentDidMount)
useEffect(fn, [a, b])   // with deps → runs when a or b changes        (componentDidUpdate, filtered)
```

**Cleanup: running code on unmount (or before the next run)**

The function you *return* from `useEffect` is the **cleanup**. React calls it in two situations:

1. **Before the effect runs again** — e.g. when a dependency changes, React cleans up the previous run first
2. **When the component unmounts** — React calls it one last time to tear down anything the effect set up

```tsx
useEffect(() => {
  // setup: subscribe, start timer, open connection...
  const id = setInterval(tick, 1000);

  return () => {
    // cleanup: unsubscribe, clear timer, close connection...
    clearInterval(id);
  };
}, [dep]);
```

Think of setup and cleanup as a pair: whatever you *open*, you must *close*. A missing cleanup is one of the most common React bugs — resources keep running invisibly after the component is gone.

Replace the contents of `HelloWorld.tsx` with a stopwatch:

```tsx
import { useEffect, useRef, useState } from 'react';
import './HelloWorld.scss';

function HelloWorld() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);    // cleanup: runs before the next effect and on unmount
  }, [isRunning]);                     // re-runs only when isRunning changes

  return (
    <div className="hello-world">
      <h1>Stopwatch: {elapsed}s</h1>
      <button onClick={() => setIsRunning(r => !r)}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
      <button onClick={() => { setIsRunning(false); setElapsed(0); }}>Reset</button>
      <input ref={inputRef} placeholder="Notes..." />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </div>
  );
}

export default HelloWorld;
```

> **Key takeaways**
> - The **cleanup function** is critical: without `clearInterval` the interval keeps firing after unmount or after `isRunning` goes back to `false`
> - **StrictMode** (enabled in `main.tsx`) intentionally mounts → unmounts → remounts in development to surface missing cleanups. If the timer double-fires, you have a cleanup bug
> - Three dependency forms:
>   - `useEffect(fn)` → runs after every render
>   - `useEffect(fn, [])` → runs once on mount
>   - `useEffect(fn, [dep])` → runs when `dep` changes

---

## Step 4 — You Might Not Need an Effect

**Concept:** If a value can be derived from existing state or props, **compute it during rendering** — no effect needed. Effects that call `setState` based on other state almost always create unnecessary render cycles.

A tempting but wrong pattern:

```tsx
// ❌ Unnecessary effect — causes an extra render on every tick
const [formatted, setFormatted] = useState('00:00');
useEffect(() => {
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  setFormatted(`${m}:${s}`);
}, [elapsed]);
```

Replace it with a direct calculation in the component body:

```tsx
// ✅ Derived at render time — no extra state, no extra render
const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
const seconds = (elapsed % 60).toString().padStart(2, '0');
const formatted = `${minutes}:${seconds}`;
```

Update the heading in `HelloWorld.tsx`:

```tsx
<h1>Stopwatch: {formatted}</h1>
```

> **Key takeaways**
>
> | Situation | Solution |
> |---|---|
> | Value derivable from state/props | Compute during rendering |
> | Handling a user interaction | Event handler |
> | Expensive calculation | `useMemo` |
> | Syncing with an external system | `useEffect` ✅ |
>
> If an effect's only job is to call `setState` based on other state, it's a signal to simplify.

---

## Step 5 — Lifecycle of Reactive Effects

**Concept:** Effects don't follow the component lifecycle — they **start synchronizing** and **stop synchronizing**. This cycle can repeat many times while the component stays mounted.

The `[isRunning]` dependency in our stopwatch makes this concrete. When `isRunning` changes, React:

1. Runs the **cleanup** of the previous effect (`clearInterval`)
2. Runs the **effect** again (starts a new interval if `isRunning` is `true`)

**Reactive values** — props, state, and anything computed from them — that are read inside an effect must appear in the dependency array:

```tsx
// isRunning is reactive — it belongs in deps
useEffect(() => {
  if (!isRunning) return;
  const id = setInterval(() => setElapsed(e => e + 1), 1000);
  return () => clearInterval(id);
}, [isRunning]);   // ✅

// With [] instead: the effect runs once on mount.
// isRunning would always read as false inside (stale closure bug).
```

**Why functions declared in the component are also a problem**

The same issue applies to functions. Every render recreates every function defined inside the component body — a new object in memory, a new reference. React compares dependencies using strict equality (`Object.is`), so it always sees the function as "changed", and the effect re-runs on **every render** — not just when the values the function uses actually change.

```tsx
function HelloWorld() {
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('dark');   // unrelated state

  function doSomething() { console.log(isRunning); }

  useEffect(() => {
    doSomething();
  }, [doSomething]);
  // ❌ re-runs on every render — including when theme changes —
  //    because doSomething is a brand new reference each time
}
```

Crucially, React does **not** look inside the function to figure out what it uses. It only sees a new reference and re-runs. The three ways to fix this:

| Fix | How |
|-----|-----|
| Move the function **inside the effect** | It's no longer a dep; list only the primitives it needs |
| Move the function **outside the component** | Module-level functions are created once — stable reference forever |
| Wrap in **`useCallback`** | Pins the reference; only changes when `useCallback`'s own deps change |

The cleanest fix in most cases is the first one:

```tsx
useEffect(() => {
  function doSomething() { console.log(isRunning); }  // defined inside
  doSomething();
}, [isRunning]);   // ✅ only re-runs when isRunning actually changes
```

Functions imported from another file are already module-level — their reference never changes across renders, so the linter won't ask you to include them.

**What actually needs to be in the dependency array**

You might now wonder: our stopwatch calls `setElapsed` inside the effect — why doesn't the linter ask us to include it? Because `useState` setters are **guaranteed by React to have a stable reference forever**. React creates them once on mount and reuses the same object on every render. The linter knows this and silently exempts them.

The same guarantee applies to `useReducer`'s `dispatch` and the ref object returned by `useRef` (though not `ref.current`, which can change freely).

Here is the complete picture:

| Value | Stable reference? | Needs to be in deps? |
|-------|-------------------|----------------------|
| `useState` setter (`setX`) | ✅ Always | No |
| `useReducer` dispatch | ✅ Always | No |
| `useRef` object itself | ✅ Always | No |
| Imported / module-level function | ✅ Always | No |
| `ref.current` | ❌ Can change | No — mutations don't trigger re-renders, so listing it is meaningless |
| State value (`count`, `isRunning`) | ❌ Changes on update | **Yes** |
| Props | ❌ Can change | **Yes** |
| Variable / function defined in component body | ❌ New every render | **Yes** — but better to move it inside the effect |

> **Key takeaways**
> - Never suppress the `react-hooks/exhaustive-deps` ESLint rule — linter complaints point to real bugs
> - `useState` setters, `useReducer` dispatch and `useRef` objects are **stable** — React guarantees their reference never changes, so they never need to be listed
> - Functions defined inside a component are **new references every render** — adding them to deps makes the effect re-run every render, not just when the function's internals change
> - Prefer moving functions inside the effect; fall back to `useCallback` only when the function must live outside the effect and be stable
> - If an effect has two unrelated concerns, split it into **two separate effects** — each for one synchronization purpose

---

## Step 6 — Reusing Logic with Custom Hooks

**Concept:** Custom hooks extract stateful logic into reusable functions. They share **logic**, not state — each call creates independent state.

**What "share logic, not state" actually means**

It is natural to look at `useStopwatch` returning `elapsed` and `isRunning` and think: "but it *is* sharing state". The distinction is about *which* state is returned.

Every component that calls `useStopwatch()` gets its **own private copy** of `isRunning` and `elapsed`. Those variables are not shared between callers — they are completely isolated. Starting the stopwatch in `TimerA` has zero effect on `TimerB`:

```tsx
function TimerA() {
  const { elapsed, start } = useStopwatch(); // own isRunning, own elapsed
}

function TimerB() {
  const { elapsed, start } = useStopwatch(); // entirely separate isRunning, separate elapsed
}
```

What is being shared is the *code* — the wiring of `useState` + `useEffect` + the interval logic — written once and reused. Each call runs that code independently and produces its own state.

Contrast this with **truly shared state**, where two components read and write the *same* variable — a change in one is immediately reflected in the other. That requires lifting state into a common parent or a global store (React Context, Zustand, etc.):

```tsx
// Truly shared — both components see the same elapsed
const [elapsed, setElapsed] = useState(0); // in a parent or global store
```

Custom hooks don't do this. The `elapsed` returned to `TimerA` and the `elapsed` returned to `TimerB` are two separate `useState` variables that happen to have been created by the same hook code.

A useful analogy: a custom hook is like a **class definition**. The definition (the logic) is written once, but every `new Stopwatch()` creates an independent instance with its own private fields. Calling `useStopwatch()` twice is like instantiating the class twice — same blueprint, two entirely separate objects.

Create `src/hooks/useStopwatch.ts`:

```ts
import { useEffect, useState } from 'react';

function useStopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  return {
    elapsed,
    isRunning,
    start: () => setIsRunning(true),
    stop:  () => setIsRunning(false),
    reset: () => { setIsRunning(false); setElapsed(0); },
  };
}

export default useStopwatch;
```

Now `HelloWorld.tsx` becomes thin and expressive:

```tsx
import { useRef } from 'react';
import useStopwatch from '../hooks/useStopwatch';
import './HelloWorld.scss';

function HelloWorld() {
  const { elapsed, isRunning, start, stop, reset } = useStopwatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');

  return (
    <div className="hello-world">
      <h1>Stopwatch: {minutes}:{seconds}</h1>
      <button onClick={isRunning ? stop : start}>{isRunning ? 'Stop' : 'Start'}</button>
      <button onClick={reset}>Reset</button>
      <input ref={inputRef} placeholder="Notes..." />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </div>
  );
}

export default HelloWorld;
```

> **Key takeaways**
> - The name **must start with `use`** — this signals to React and the linter that Hook rules apply
> - Two components calling `useStopwatch()` get **fully independent** stopwatches
> - Extract when logic is complex or duplicated across components; don't extract every small helper into a hook

---

## Step 7 — Bonus: Memoization with `useMemo` and `useCallback`

**Concept:** `useMemo` and `useCallback` let you **cache** a computed value or a function between renders, so React only recomputes it when its dependencies change. They are *performance optimisations* — they don't change what your app does, only how often it recomputes things.

**Why they exist**

Every time a component re-renders, all the code in its body runs again — including expensive calculations and function definitions. Most of the time this is fine. But in two situations it becomes a problem:

1. A **calculation is expensive** and re-running it on every render wastes CPU
2. A **function is listed as a `useEffect` dependency** — since functions are new references every render, the effect re-runs unnecessarily on every render

---

### `useMemo` — cache a computed value

```tsx
import { useMemo } from 'react';

// ❌ Without useMemo: recalculated on every render, even unrelated ones
const formatted = expensiveFormat(elapsed);

// ✅ With useMemo: only recalculated when elapsed changes
const formatted = useMemo(() => expensiveFormat(elapsed), [elapsed]);
```

Applied to our stopwatch — memoize the time formatting:

```tsx
const formatted = useMemo(() => {
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}, [elapsed]);
```

In this specific case the calculation is trivial, so `useMemo` adds no real benefit. It matters when the work is genuinely expensive (sorting/filtering large lists, complex data transformations).

---

### `useCallback` — cache a function reference

```tsx
import { useCallback } from 'react';

// ❌ Without useCallback: new function reference every render
const handleReset = () => { setIsRunning(false); setElapsed(0); };

// ✅ With useCallback: same reference as long as deps don't change
const handleReset = useCallback(() => {
  setIsRunning(false);
  setElapsed(0);
}, []);   // no deps — setters from useState are always stable
```

`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)` — it just reads more clearly when you're caching a function.

It matters when a function appears in a `useEffect` dependency array. Because functions defined in the component body are new references every render, listing one as a dep causes the effect to re-run on *every* render — not just when the function's logic actually changes.

```tsx
// ❌ fetchData is a new reference every render
//    → effect re-runs on every render regardless of whether id changed
function HelloWorld({ id }) {
  const fetchData = () => fetch(`/api/data?id=${id}`);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // always "changed"
}

// ✅ fetchData is stable as long as id is the same
//    → effect only re-runs when id actually changes
function HelloWorld({ id }) {
  const fetchData = useCallback(() => fetch(`/api/data?id=${id}`), [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // changes only when id changes
}
```

> Note: in most cases the cleanest fix is to move the function **inside the effect** (as shown in Step 5), avoiding the need for `useCallback` entirely. Reach for `useCallback` when the function genuinely needs to live outside the effect — for example, because it is reused in multiple effects or in event handlers too.

---

> **Key takeaways**
>
> | Hook | Caches | Use when |
> |------|--------|----------|
> | `useMemo` | A **value** | Calculation is expensive or result is used as an effect dep |
> | `useCallback` | A **function** | Function is used as a `useEffect` dependency and must live outside the effect |
>
> - Both take a dependency array with the same rules as `useEffect`
> - **Don't reach for them by default.** Memoization has its own cost (memory + comparison on every render). Add it only when you have a measured performance problem or a clear referential-stability need
> - `useCallback` and `useMemo` do *not* prevent the component itself from re-rendering — they only skip recomputing the cached value/function

---

## Summary

| Step | API | Core idea |
|------|-----|-----------|
| 1 | `useRef` | Mutable value that survives renders without triggering them |
| 2 | `ref={domRef}` | Direct access to a DOM node, available after the commit phase |
| 3 | `useEffect` + cleanup | Synchronize with external systems; always clean up |
| 4 | *(no hook)* | Derive values during rendering instead of syncing state via effects |
| 5 | Dependency array | Every reactive value the effect reads must be listed; effects re-synchronize on change |
| 6 | Custom hooks | Encapsulate and share stateful logic; each call gets independent state |
| 7 | `useMemo` / `useCallback` | Cache expensive values or stable function references between renders |

---

## Further Reading

- [Escape Hatches — react.dev](https://react.dev/learn/escape-hatches)
- [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs)
- [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)
