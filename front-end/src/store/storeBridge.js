// Lets non-React code (the fetch client and Razorpay callback) read the live
// in-memory Redux session without coupling those modules to React hooks.
let activeStore;

export function attachStore(store) {
  activeStore = store;
}

export function getStoreState() {
  return activeStore?.getState();
}

export function dispatchStore(action) {
  return activeStore?.dispatch(action);
}
