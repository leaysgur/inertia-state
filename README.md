# inertia-state

Minimum state manager for moment of inertia.

## Install

```
npm i inertia-state
```

or

```html
<script src="https://unpkg.com/inertia-state/dist/inertia-state.umd.js"></script>
<script>
  const { InertiaState } = window.inertiaState;
</script>
```

## Example

```js
const $box = document.getElementById("box");

//
// Usual drag implementation
//
const state = {
  position: [100, 200],
  dragging: false,
};
const rect = $box.getBoundingClientRect();

$box.addEventListener("pointerdown", ({ clientX, clientY }) => {
  state.dragging = true;
  state.position[0] = clientX - rect.width / 2;
  state.position[1] = clientY - rect.height / 2;
});
$box.addEventListener("pointermove", ({ clientX, clientY }) => {
  if (!state.dragging) return;
  state.position[0] = clientX - rect.width / 2;
  state.position[1] = clientY - rect.height / 2;
});
$box.addEventListener("pointerup", () => {
  state.dragging = false;
});

(function render() {
  requestAnimationFrame(render);

  const [x, y] = state.position;
  $box.style.transform = `translate3d(${x}px, ${y}px, 0)`;
})();

//
// + Inertia movement
//
const iState = new InertiaState();

$box.addEventListener("pointerdown", ({ clientX, clientY }) => {
  iState.start([clientX, clientY]);
});
$box.addEventListener("pointermove", ({ clientX, clientY }) => {
  iState.update([clientX, clientY]);
});
$box.addEventListener("pointerup", () => {
  iState.stop();
});

iState.addCallback((ev) => {
  state.position[0] += ev.delta[0];
  state.position[1] += ev.delta[1];
});
```

See https://leader22.github.io/inertia-state/ to check how it works.

### w/ 🤞 `react-use-gesture`

```js
import { useRef, useEffect } from "react";
import { useDrag } from "react-use-gesture";
import { InertiaState } from "inertia-state";

const inertiaState = useRef(new InertiaState());

useDrag((state) => {
  // handle drag...

  // 1️⃣ update inertia state
  if (state.first) inertiaState.current.start(state.movement);
  inertiaState.current.update(state.movement);
  if (state.last) inertiaState.current.stop();
});

useEffect(() => {
  const iState = inertiaState.current;
  const dispose = iState.addCallback(({ delta, movement }) =>
    // 2️⃣ apply inertia here
  );

  return () => {
    dispose();
    iState.reset();
  };
}, [inertiaState]);
```
