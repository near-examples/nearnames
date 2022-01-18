import React, { createContext, useReducer } from 'react';

export const State = (initialState, prefix) => {
  let updatedState;
  const getState = () => updatedState;
  const store = createContext(initialState);
  const { Provider: InnerProvider } = store;

  const updateState = (state, path = '', newState = {}) => {
    // console.log('updateState', state, path, newState) // debugging

    if (path.length === 0) {
      return { ...state, ...newState };
    }
    const pathArr = path.split('.');
    const first = pathArr[0];

    state = { ...state };
    if (!state[first]) {
      state[first] = {};
    }

    if (pathArr.length === 1) {
      state[first] =
        typeof newState === 'object' && newState !== null && !Array.isArray(newState)
          ? {
              ...state[first],
              ...newState,
            }
          : newState;
    } else {
      state[first] = {
        ...state[first],
        ...updateState(state[first], pathArr.slice(1).join('.'), newState),
      };
    }

    return state;
  };

  const Provider = ({ children }) => {
    const [state, dispatch] = useReducer((state, payload) => {
      const { path, newState } = payload;
      if (path === undefined) {
        return state;
      }
      updatedState = updateState(state, path, newState);
      return updatedState;
    }, initialState);

    const update = (path, newState) => {
      dispatch({ path, newState });
    };
    const wrappedDispatch = (fn) => fn({ update, getState, dispatch: wrappedDispatch });

    return <InnerProvider value={{ update, state, dispatch: wrappedDispatch }}>{children}</InnerProvider>;
  };

  if (prefix) {
    return {
      [prefix + 'Store']: store,
      [prefix.substr(0, 1).toUpperCase() + prefix.substr(1) + 'Provider']: Provider,
    };
  }

  return { store, Provider };
};
