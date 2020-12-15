import React, { useEffect } from 'react';
import copy from 'copy-to-clipboard';
import anime from 'animejs/lib/anime.es.js';
import { onAlert } from './../state/app';
import { keyRotation } from './../state/near';

import { btnClass } from './../App'

export const Receiver = ({ state, dispatch }) => {

    const { accountId, seedPhrase } = state.accountData
    
    useEffect(() => {
        anime({
            targets: 'iframe',
            rotate: '1turn',
            duration: 2000,
            delay: 1000,
        });
    }, [])
    
    return <>
        <h1>Congratulations</h1>

        <div class="container-yt mb-3">
            <iframe id="ytplayer" type="text/html"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&origin=http://example.com"
                frameborder="0" />
        </div>

        <p>So and so has gifted you the NEAR account {accountId}</p>
        <p>You just need to write down this phrase</p>

        <div class="form-floating mb-3">
            <textarea readonly class="form-control" id="seedPhrase" defaultValue={seedPhrase} />
            <label for="seedPhrase">Seed Phrase</label>
        </div>

        <button class={btnClass} onClick={async () => {
            if (navigator.share) {
                navigator.share({
                    text: seedPhrase
                }).catch((e) => {
                    copy(seedPhrase)
                });
            } else {
                copy(seedPhrase)
            }
            dispatch(onAlert('Copied!'))
            
        }}>
            Copy
        </button>

        <button class={btnClass + 'ms-3'} onClick={() => dispatch(keyRotation())}>
            I Wrote it Down
        </button>
    </>
}