import React from 'react';

import { flexClass } from '../App';

export const Container = ({ children, state }) => {
  return (
    <>
      <div class="background"></div>
      <div class={flexClass}>
        <div class="container container-custom">{children}</div>
      </div>
      {state.app.alert && (
        <div class="container-alert">
          <div class={flexClass + ' mt-0'}>
            <div class="container container-custom mt-0">
              <div class="alert alert-primary mt-0" role="alert">
                {state.app.alert}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
