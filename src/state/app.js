import anime from 'animejs/lib/anime.es.js';
import { generateSeedPhrase } from 'near-seed-phrase'
import { State } from '../utils/state';
import { initNear } from './near';

const initialState = {
	app: {
        mounted: false,
        wasValidated: false,
        accountTaken: false,
        alert: null,
    },
    links: []
};

export const { appStore, AppProvider } = State(initialState, 'app');

export const onAlert = (message) => async ({update}) => {
    await update('app.alert', message)
    anime({
        targets: '.alert',
        easing: 'easeOutElastic',
        keyframes: [
            {translateX: -window.innerWidth, duration: 0},
            {translateX: 0, duration: 500},
            {translateX: 0, duration: 2000},
            {translateX: window.innerWidth, duration: 500},
        ],
    });
    setTimeout(() => update('app.alert', null), 3000)
}

export const onAppMount = () => async ({ update, getState, dispatch }) => {
    update('app', { mounted: true });

    const url = new URL(window.location.href)
    const key = url.searchParams.get('key')
    const from = url.searchParams.get('from')
    const accountId = url.searchParams.get('accountId')
    if (key && from && accountId) {
        const { seedPhrase, publicKey } = generateSeedPhrase()
        update('accountData', { key, from, accountId, seedPhrase, publicKey })
    } else {
        dispatch(initNear());
    }
};
