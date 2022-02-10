import React, { useEffect, useState } from 'react';
import { share } from '../utils/mobile';
import anime from 'animejs/lib/anime.es.js';
import { onAlert } from '../state/app';
import { keyRotation, walletUrl, SEED_PHRASE_LOCAL_COPY } from '../state/near';
import { btnClass, qs } from '../App';
import { get } from '../utils/storage';

import stocking from '../img/stocking.svg';
import tweet from '../img/twitter.webp';

export const Receiver = ({ state, dispatch }) => {
  const { accountId, from, seedPhrase, message, link, keyExists } = state.accountData;
  const sender = from;
  const btnSuccessClass = `${btnClass.replace('btn-outline-primary', '')} btn-success pulse`;

  const [claiming, setClaiming] = useState(false);
  const [success, setSuccess] = useState(0);
  const [seedHidden, setSeedHidden] = useState(true);

  useEffect(() => {
    var tag = document.createElement('script');

    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      window.player = new YT.Player('player-yt', {
        videoId: link && link.length > 0 ? link : 's1LUXQWzCno',
        events: {
          onReady: () => setVideoReady(true),
        },
      });
    };
  }, []);

  if (claiming) {
    return (
      <div class="container container-custom">
        <h2>DO NOT CLOSE OR REFRESH THIS PAGE</h2>
        <h2>Claiming Your Account...</h2>
      </div>
    );
  }

  if (!keyExists || success === 1) {
    return (
      <div class="container container-custom">
        <h2>Congratulations!</h2>
        <ul>
          <li>Your passphrase is like a password.</li>
          <li>Do not share it with anyone!</li>
          <li>Your account is forever tied to this phrase. You can log into or recover your account with your passphrase at wallet.near.org from now on!</li>
        </ul>

        <div class="container text-center mt-5">
          <a href={walletUrl + '/recover-seed-phrase'} target="_blank">
            <button class={btnClass}>Sign in to NEAR Wallet</button>
          </a>
        </div>

        <div class="container text-center mt-5">
          <button
            class={btnClass}
            onClick={() => {
              const localSeedPhrase = get(SEED_PHRASE_LOCAL_COPY, '');
              if (!localSeedPhrase.length) {
                window.alert(
                  'There is no seed phrase on this device for this gift link. Did you open the link in another browser? Please open that link again and use this button!',
                );
              }
              share(localSeedPhrase);
              dispatch(onAlert('Copied!'));
            }}
          >
            COPY SEED PHRASE
          </button>
          <p class="sub-note">This is a local copy in your browser, just in case you didn't write it down. Please write down your passphrase and keep it somewhere safe!</p>
        </div>

        <div class="container text-center mt-5">
          <p>Sharing is caring! Spread the love ✌️</p>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `${sender} gifted me the snazzy NEAR Account Name: ${accountId} @nearprotocol #NEARName https://nearnames.com/ `,
            )}`}
            target="_blank"
          >
            <button class={btnClass + 'tweet-button'}>
              <img class="tweet-icon" src={tweet} />
              &nbsp;&nbsp;Tweet About Your Gift
            </button>
          </a>
        </div>

        <div class="container text-center mt-5">
          <p>
            Questions? Comments? Cookies?
            <br />
            Hit us up{' '}
            <a href="https://twitter.com/NEARProtocol?s=20" target="_blank">
              @NEARProtocol on Twitter
            </a>{' '}
            🌈
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div class="text-center mt-3 mb-5">
        <h3>Welcome to NEAR!</h3>
        <p>
          <b>{sender}</b> has gifted you a brand new{' '}
          <a href="https://near.org/" target="_blank">
            NEAR
          </a>{' '}
          account (<b>{accountId}</b>), along with some NEAR tokens inside it!
        </p>

        {message && message.length > 0 && (
          <div className="card p-3">
            <p>
              Message from <b>{sender}</b>:
            </p>
            <p>{message}</p>
          </div>
        )}
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
        <p>To accept this gift (i.e. claim ownership of your new account), simply follow the steps below.</p>
        <p>The passphrase that you'll see below is like an account password but with a couple important differences:</p>
        <ul>
          <li className="mb-3">
            Anyone who knows a NEAR account's passphrase has full control of the account without even needing to know the account name. (So keep the passphrase private!)
          </li>
          <li>
            If you were to forget your passphrase, you'd completely lose access to your account. You would be permanently locked out. (Even the NEAR team does not have the ability
            to assign a new passphrase to an account.)
          </li>
        </ul>
        <h3>Claim Your New Account</h3>
        <ol>
          <li className="mb-3">Click the button below to reveal your passphrase.</li>
          <li className="mb-3">Write those 12 words down in their exact order.</li>
          <li className="mb-3">Click the "Claim My Account Now" button once you've safely stored your passphrase somewhere.</li>
          <li className="mb-3">Do not share your passphrase with anyone! This passphrase controls your NEAR account and its NEAR tokens, so keep it somewhere safe and private.</li>
          <li>
            Going forward, you can use your passphrase at{' '}
            <a href={walletUrl} target="_blank">
              wallet.near.org
            </a>{' '}
            to access your account.
          </li>
        </ol>

        {seedHidden && (
          <button
            className={btnClass}
            style={{ textTransform: 'uppercase' }}
            onClick={() => {
              setSeedHidden(!seedHidden);
            }}
          >
            Reveal My Passphrase
          </button>
        )}

        <div class="form-floating mb-3">
          <textarea readonly class="form-control" id="seedPhrase" value={seedHidden ? `******** ****  ********  ******` : seedPhrase} />
          <label for="seedPhrase">Passphrase</label>
        </div>

        {!seedHidden && (
          <>
            <button
              className={btnClass}
              style={{ textTransform: 'uppercase' }}
              onClick={() => {
                share(seedPhrase);
                dispatch(onAlert('Copied!'));
              }}
            >
              Copy Passphrase
            </button>

            <br />
            <center>
              <button
                className={btnSuccessClass}
                onClick={async () => {
                  setClaiming(true);
                  try {
                    await dispatch(keyRotation());
                    setSuccess(1);
                  } catch (e) {
                    if (e.message.indexOf('Can not sign transactions') > -1) {
                      alert('It looks like the account has already been claimed!');
                      setSuccess(1);
                    } else {
                      alert('There was an error claiming your account. Please try again.');
                      console.error(e);
                    }
                  }
                  setClaiming(false);
                }}
              >
                I wrote down my passphrase! CLAIM MY ACCOUNT NOW!
              </button>
            </center>
          </>
        )}
        <small className="text-muted">
          (Until you click the "Claim My Account" button, the account technically remains available for anyone to claim by visiting this special account claiming page, but
          presumably you are the only person who knows the URL of this page, other than the friend who sent it to you.)
        </small>
      </div>
    </>
  );
};
