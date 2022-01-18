import anime from 'animejs/lib/anime.es.js';
import { generateSeedPhrase } from 'near-seed-phrase';
import { State } from '../utils/state';
import { initNear, hasKey } from './near';

const initialState = {
  app: {
    mounted: false,
    wasValidated: false,
    accountTaken: false,
    alert: null,
  },
  links: [],
};

export const { appStore, AppProvider } = State(initialState, 'app');

let alertAnimation;
export const onAlert =
  (message) =>
  async ({ update }) => {
    await update('app.alert', message);
    if (alertAnimation) {
      alertAnimation.pause();
    }
    alertAnimation = anime({
      targets: '.alert',
      easing: 'easeOutElastic',
      keyframes: [
        { scaleX: 0, scaleY: 0, duration: 0 },
        { scaleX: 1, scaleY: 1, duration: 500 },
        { duration: 2000 },
        { scaleX: 0, scaleY: 0, duration: 500, easing: 'easeInCubic' },
      ],
      complete: function () {
        update('app.alert', null);
      },
    });
  };

export const onAppMount =
  () =>
  async ({ update, getState, dispatch }) => {
    update('app', { mounted: true });

    const url = new URL(window.location.href);
    const key = url.searchParams.get('key');
    const from = url.searchParams.get('from');
    const message = decodeURIComponent(url.searchParams.get('message') || '');
    const link = url.searchParams.get('link') || '';
    const accountId = url.searchParams.get('accountId');
    if (key && accountId) {
      const { seedPhrase, publicKey } = generateSeedPhrase();
      const keyExists = await hasKey(key, accountId);
      update('accountData', { key, from, message, link, accountId, seedPhrase, publicKey, keyExists });
    } else {
      dispatch(initNear());
    }
  };
