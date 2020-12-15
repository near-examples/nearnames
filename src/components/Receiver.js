import React, { useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import anime from 'animejs/lib/anime.es.js';
import { onAlert } from '../state/app';
import { keyRotation } from '../state/near';

import { btnClass, qs } from '../App'

import stocking from '../img/stocking.png'

export const Receiver = ({ state, dispatch }) => {

    const { accountId, seedPhrase } = state.accountData

    const [videoReady, setVideoReady] = useState(false)

    useEffect(() => {
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            window.player = new YT.Player('player-yt', {
                videoId: 'dQw4w9WgXcQ',
                events: {
                    'onReady': () => setVideoReady(true),
                }
            });
        }
    }, [])

    return <>
        <h1>Congratulations</h1>

        <div class="position-yt mb-3">
            <div class="wrap-yt mb-3">
                <div class="size-yt mb-3">
                    <div id="player-yt" />
                </div>
            </div>
        </div>

        <h2>{videoReady ? 'Click to Open' : 'Loading'}</h2>

        <img class="stocking" src={stocking} onClick={() => {
            window.player.playVideo()
            // qs('#ytplayer').src += '&autoplay=1'
            anime({
                targets: '.wrap-yt',
                easing: 'easeOutElastic',
                keyframes: [
                    { opacity: 0, translateX: 50, translateY: 0, scaleX: 0, scaleY: 0, duration: 0 },
                    { opacity: 1, translateX: 25, translateY: -Math.min(125, window.innerWidth / 6), scaleX: 0.5, scaleY: 0.5, duration: 1200 },
                    { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, duration: 500, easing: 'easeOutCubic' },
                ],
            });
        }} />

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