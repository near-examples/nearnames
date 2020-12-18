import React, { useContext, useEffect } from 'react';
import { appStore, onAppMount } from './state/app';

import { Container } from './components/Container'
import { Receiver } from './components/Receiver'
import { Giver } from './components/Giver'

import './App.css';

// helpers
export const btnClass = 'btn btn-sm btn-outline-primary mb-3 '
export const flexClass = 'd-flex justify-content-evenly align-items-center '
export const qs = (s) => document.querySelector(s)

const App = () => {
    const { state, dispatch, update } = useContext(appStore);

    const onMount = () => {
        dispatch(onAppMount());
    };
    useEffect(onMount, []);

    console.log('state', state);

    const {
        accountData, funding, wallet
    } = state
    
    let children = null

    if (accountData) {
        children = <Receiver {...{ state, dispatch }} />
    }

    if (funding) {
        children = <>
            <div class={flexClass}>
                <h2>DO NOT CLOSE / REFRESH THIS PAGE</h2>
            </div>
            <div class={flexClass}>
                <h2>Creating Account...</h2>
            </div>
        </>
    }

    if (wallet) {
        children = <Giver {...{ state, dispatch, update }} />
    }
    
    return <Container state={state}>{ children }</Container>
}

export default App;
