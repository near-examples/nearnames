import React, { useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import anime from 'animejs/lib/anime.es.js';
import { onAlert } from '../state/app';
import { keyRotation } from '../state/near';

import { btnClass, qs } from '../App'

import stocking from '../img/stocking.svg'

export const Receiver = ({ state, dispatch }) => {

    const { accountId, from, seedPhrase } = state.accountData

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
        <div class="text-center mb-5">
            <h1>Congratulations</h1>
            <p>{from} has gifted you the NEAR account</p>
            <p><strong>{accountId}</strong></p>
        </div>

        <div class="position-yt mb-3">
            <div class="wrap-yt mb-3">
                <div class="size-yt mb-3">
                    <div id="player-yt" />
                </div>
            </div>
        </div>

        <div class="wrap-stocking">
            <div class="stocking-cta">{videoReady ? '👇 Click 👇' : ''}</div>
            <img class="stocking" src={stocking} onClick={() => {
                if (!videoReady) return 
                window.player.playVideo()
                setVideoReady(false)
                // qs('#ytplayer').src += '&autoplay=1'
                anime({
                    targets: '.wrap-yt',
                    easing: 'easeOutElastic',
                    keyframes: [
                        { opacity: -1, translateX: 50, translateY: 50, scaleX: 0, scaleY: 0, duration: 0 },
                        { opacity: 1, translateX: 25, translateY: -Math.min(200, window.innerWidth / 5), scaleX: 0.5, scaleY: 0.5, duration: 1000 },
                        { translateX: 0, translateY: -25, scaleX: 1, scaleY: 1, duration: 250, easing: 'easeOutCubic' },
                    ],
                    complete: function() {
                        anime({
                            targets: '.stocking',
                            opacity: 0,
                            duration: 1000,
                        })
                        setTimeout(() => {
                            qs('.stocking').style.height = qs('.wrap-yt').getBoundingClientRect().height - 20 + 'px'
                            qs('.instructions').style.display = 'block'
                            anime({
                                targets: '.instructions',
                                opacity: 1,
                                duration: 1000,
                            })
                        }, 1000)
                    }
                });
            }} />
        </div>

        <div class="instructions">

            <ol>
                <li>Write these words down in order!</li>
                <li>DO NOT SHARE IT</li>
                <li>You CANNOT recover your account without these words in this order!</li>
            </ol>

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

            <div class="form-floating mb-3">
                <textarea readonly class="form-control" id="seedPhrase" defaultValue={seedPhrase} />
                <label for="seedPhrase">Seed Phrase</label>
            </div>

            <button class={btnClass} onClick={() => dispatch(keyRotation())}>
                I Wrote It Down!
            </button>

        </div>
    </>
}