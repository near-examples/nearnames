import React, { useEffect, useState } from 'react';
import { share } from '../utils/mobile';
import anime from 'animejs/lib/anime.es.js';
import { onAlert } from '../state/app';
import { keyRotation, walletUrl, SEED_PHRASE_LOCAL_COPY } from '../state/near';
import { btnClass, qs } from '../App'
import { get } from '../utils/storage'

import stocking from '../img/stocking.svg'
import tweet from '../img/twitter.webp'

export const Receiver = ({ state, dispatch }) => {

    const { accountId, from, seedPhrase, message, link, keyExists } = state.accountData

    const [claiming, setClaiming] = useState(false)
    const [success, setSuccess] = useState(0)
    const [seedHidden, setSeedHidden] = useState(true)

    useEffect(() => {
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            window.player = new YT.Player('player-yt', {
                videoId: link && link.length > 0 ? link : 's1LUXQWzCno',
                events: {
                    'onReady': () => setVideoReady(true),
                }
            });
        }
    }, [])


    if (claiming) {
        return <div class="container container-custom">
            <h2>DO NOT CLOSE OR REFRESH THIS PAGE</h2>
            <h2>Claiming Your Account...</h2>
        </div>
    }

    if (!keyExists || success === 1) {
        return <div class="container container-custom">
            <h2>Congratulations!</h2>
            <ul>
                <li>Your seed phrase is like a password.</li>
                <li>Do not share it with anyone!</li>
                <li>Your account is forever tied to this phrase. You can log into or recover your account with your seed phrase at wallet.near.org from now on!</li>
            </ul>

            <div class="container text-center mt-5">

                <a href={walletUrl + '/recover-seed-phrase'} target="_blank"><button class={btnClass}>Sign in to NEAR Wallet</button></a>

            </div>

            <div class="container text-center mt-5">

                <button class={btnClass} onClick={() => {
                        const localSeedPhrase = get(SEED_PHRASE_LOCAL_COPY, '')
                        if (!localSeedPhrase.length) {
                            window.alert('There is no seed phrase on this device for this gift link. Did you open the link in another browser? Please open that link again and use this button!')
                        }
                        share(localSeedPhrase)
                        dispatch(onAlert('Copied!'))
                    }}>
                        COPY SEED PHRASE
                </button>
                <p class="sub-note">This is a local copy in your browser, just in case you didn't write it down. Please write down your seed phrase and keep it somewhere safe!</p>

            </div>

            <div class="container text-center mt-5">

                <p>Sharing is caring! Spread the love ✌️</p>

                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${from} gifted me the snazzy NEAR Account Name: ${accountId} @nearprotocol #NEARName https://nearnames.com/ `)}`} target="_blank">
                    <button class={btnClass + "tweet-button"}>
                        <img class="tweet-icon" src={tweet} />&nbsp;&nbsp;Tweet About Your Gift
                    </button>
                </a>
            </div>

            <div class="container text-center mt-5">
                <p>Questions? Comments? Cookies?<br />Hit us up <a href="https://twitter.com/NEARProtocol?s=20" target="_blank">@NEARProtocol on Twitter</a> 🌈</p>
            </div>
        </div>
    }

    return <>

        <div class="text-center mt-3 mb-5">
            <h3>Welcome to NEAR!</h3>
            <p><b>{from}</b> has gifted you some NEAR tokens and the account name:</p>
            <p><b>{accountId}</b></p>
            {message && message.length > 0 && <p>{message}</p>}
        </div>

        <div class="position-yt mb-3">
            <div class="wrap-yt mb-3">
                <div class="size-yt mb-3">
                    <div id="player-yt" />
                </div>
            </div>
        </div>

        {/* <div class="wrap-stocking">
            <div class="stocking-cta">{videoReady ? '👇 Open Stocking 👇' : ''}</div>
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
                    complete: function () {
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
        </div> */}

        <div class="instructions">

            <p>
                Now this part is on you. Your seed phrase is like an account password, but we do not store it for you and can't recover it if you forget: if you lose it, that's it.
            </p>

            <ol>
                <li>Write these 12 words down in this exact order.</li>
                <li>Do not share them with anyone! This phrase is the key to your NEAR tokens, so keep it somewhere safe.</li>
                <li>Your account is forever tied to this recovery phrase. You can log into or recover your account with your seed phrase at <a href={walletUrl} target="_blank">wallet.near.org</a> from now on!</li>
            </ol>

            {seedHidden && <button class={btnClass} onClick={() => {
                setSeedHidden(!seedHidden)
            }}>
                REVEAL MY SECRET SEED PHRASE
            </button>}

            <div class="form-floating mb-3">
                <textarea readonly class="form-control" id="seedPhrase" value={seedHidden ? `************` : seedPhrase} />
                <label for="seedPhrase">Seed Phrase</label>
            </div>

            {!seedHidden && <>


                <button class={btnClass} onClick={() => {
                    share(seedPhrase)
                    dispatch(onAlert('Copied!'))
                }}>
                    COPY SEED PHRASE
            </button>

                <br />
                <center>
                <button class={btnClass + 'pulse'} onClick={async () => {
                    setClaiming(true)
                    try {
                        await dispatch(keyRotation())
                        setSuccess(1)
                    } catch (e) {
                        if (e.message.indexOf('Can not sign transactions') > -1) {
                            alert('It looks like the account has already been claimed!')
                            setSuccess(1)
                        } else {
                            alert('There was an error claiming your account. Please try again.')
                            console.error(e)
                        }
                    }
                    setClaiming(false)
                }}>
                    I Wrote It Down! CLAIM MY ACCOUNT NOW!
            </button>
            </center>

            </>}


        </div>
    </>
}