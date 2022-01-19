import React, { useState } from 'react';
import { onAlert } from '../state/app';
import { nameSuffix, unclaimLink } from '../state/near';
import { share } from '../utils/mobile';
import { flexClass, btnClass, qs } from '../App';
import { getVideoId } from '../utils/youtube';
import SignedOutSteps from './SignedOutSteps';
import Footer from './Footer';

const forExample = `(for example: "bestie${nameSuffix}" or "squad${nameSuffix}")`;
const forExampleWithoutSuffix = forExample.replaceAll(nameSuffix, '');
const baseUrl = window.location.href.substr(0, window.location.href.lastIndexOf('/'));
const getLink = (accountId, key, wallet, message = '', link = '') =>
  `${baseUrl}?accountId=${accountId}&key=${key}&from=${wallet.getAccountId()}&message=${encodeURIComponent(message)}&link=${getVideoId(link)}`;

console.log(nameSuffix);

export const Giver = ({ state, update, dispatch }) => {
  const { app, wallet, links, claimed } = state;

  const [id, setId] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  const checkDisabled = () => {
    setTimeout(() => setDisabled(!!document.querySelectorAll(':invalid').length), 250);
  };

  return (
    <>
      <div className={flexClass + 'mb-3 text-center'}>
        <h1>Gift a name on NEAR Protocol!</h1>
      </div>

      <h4>
        Claim a name for friends and family on the{' '}
        <a href="https://near.org/" target="_blank">
          NEAR blockchain
        </a>
        .
      </h4>

      {wallet.signedIn ? (
        <>
          <p>
            Your wallet (<strong>{wallet.getAccountId()}</strong>) currently has a balance of <strong>{wallet.balance} N</strong>.
          </p>
          <ol>
            <li className="mb-3">
              When you <strong>submit the form below</strong>, a new account will be created (using the account name you choose) and will be funded with the amount of NEAR tokens
              that you're gifting to that account (minus a small amount of NEAR that is used to claim the custom account name).
            </li>
            <li className="mb-3">
              On the following page, <strong>you'll receive a "magic link"</strong> that you'll be able to share with your friend.
            </li>
            <li className="mb-3">
              <strong>Your friend will click the link</strong> that you shared and will then be guided through the easy process of claiming and taking full ownership of that new
              account.
            </li>
          </ol>
        </>
      ) : (
        <SignedOutSteps forExample={forExample} />
      )}

      {wallet.signedIn ? (
        <>
          <h2 className="pt-3">My Wallet</h2>
          <div className={flexClass}>
            <div>
              <p>{wallet.getAccountId()}</p>
              <p>Balance: {wallet.balance} N</p>
            </div>
            <button
              className={btnClass + 'ms-3'}
              onClick={() => {
                wallet.signOut();
                update('wallet.signedIn', false);
              }}
            >
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <div className={flexClass}>
          <button className={btnClass} onClick={() => wallet.signIn()}>
            Connect to NEAR Wallet
          </button>
        </div>
      )}

      {wallet.signedIn && (
        <>
          {links && links.length > 0 && (
            <>
              <h2>Gift Links</h2>
              <center>
                {links.map(({ key, accountId, recipientName = '' }) => (
                  <div key={key}>
                    <div>
                      <strong>{accountId}</strong> {recipientName.length > 0 && <span>for {recipientName}</span>}
                    </div>
                    <div>
                      <button
                        className={btnClass + 'mt-2'}
                        onClick={() => {
                          share(getLink(accountId, key, wallet, message, link));
                          dispatch(onAlert('Copied!'));
                        }}
                      >
                        Click to Share
                      </button>
                    </div>
                  </div>
                ))}
              </center>
              <h4 className="mb-3">Include Gift Message (optional)</h4>
              <p className="sub-note">
                Personalize each link <i>before</i> you "Click to Share" above.
              </p>
              <form className={'was-validated'}>
                <div className="form-floating mb-3">
                  <textarea type="text" className="form-control" placeholder=" " maxlength="140" value={message} onChange={(e) => setMessage(e.target.value)} />
                  <label for="fundingAmount">Custom Message</label>
                </div>
                {/* <div className="form-floating mb-3" name="yt-link">
                                <input type="text" className="form-control" placeholder=" "
                                    value={link}
                                    pattern="(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)"
                                    onChange={(e) => setLink(e.target.value)}
                                />
                                <label for="fundingAmount">YouTube Link</label>
                                <div className="invalid-feedback">
                                    Not a valid YT link
                                </div>
                            </div> */}
              </form>
              {/* <select className="form-control" id="video-select" onChange={() => setLink(qs('#video-select').value)}>
                            <option value="">Select a Video</option>
                            <option value="https://www.youtube.com/watch?v=s1LUXQWzCno">Charlie Brown Christmas Dance</option>
                            <option value="https://www.youtube.com/watch?v=ppWrbYC3WwQ">How the Grinch Stole Christmas</option>
                            <option value="https://www.youtube.com/watch?v=uwCcVRH8idA">Otis Redding - White Christmas</option>
                            <option value="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Never Gonna Give You Up</option>
                            <option value="https://www.youtube.com/watch?v=B7u6bMBlCXw">Love Actually - To me you are perfect</option>
                            <option value="https://www.youtube.com/watch?v=76WFkKp8Tjs">Bruce Springsteen - Santa Claus Is Comin' To Town</option>
                            <option value="https://www.youtube.com/watch?v=sDfcQ_LBHqY">Mean Girls  - Jingle Bell Rock</option>
                            <option value="https://www.youtube.com/watch?v=yXQViqx6GMY">Mariah Carey - All I Want For Christmas Is You</option>
                        </select> */}
            </>
          )}
          <h2 className="mt-5">Create {links && links.length > 0 ? 'Another' : ''} Gift Account</h2>
          <form className={'needs-validation ' + (app.wasValidated ? 'was-validated' : '')} autocomplete="off">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="accountName"
                placeholder=" "
                required
                minlength={app.accountTaken ? 999999 : 2}
                maxlength={48}
                pattern="^(([a-z\d]+[\-_])*[a-z\d]+$"
                autocomplete="off"
                value={id}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase();
                  setId(v);
                  wallet.isAccountTaken(v);
                  checkDisabled();
                }}
              />
              <label for="accountName">Account Name {forExampleWithoutSuffix}</label>
              <div className="invalid-feedback">{app.accountTaken ? 'Account name is already taken' : '2-48 characters, no spaces, no symbols'}</div>
            </div>
            <small className="text-muted d-block mb-3">The "{nameSuffix}" suffix will be added automatically to this account name.</small>

            <div className="form-floating mb-3">
              <input type="number" className="form-control" id="fundingAmount" placeholder=" " required min={0.1} step={0.00001} onChange={() => checkDisabled()} />
              <label for="fundingAmount">Gift Amount (N)</label>
              <div className="invalid-feedback">Please enter an amount of NEAR &gt;= 0.1</div>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="recipientName"
                placeholder=" "
                required
                minlength={1}
                maxlength={64}
                autocomplete="off"
                onChange={() => checkDisabled()}
              />
              <label for="recipientName">Recipient Name</label>
              <section id="accordion">
                <section id="recipient-name-hint">
                  <a href="#recipient-name-hint">
                    <small className="text-muted">How does Recipient Name get used?</small>
                  </a>
                  <div>
                    This form only asks for the Recipient Name so your friend will see a friendly greeting on the page when claiming the account. The Recipient Name does not get
                    stored in the account anywhere.
                  </div>
                </section>
              </section>
              <div className="invalid-feedback">Please enter a name</div>
            </div>
          </form>
          <button disabled={disabled} className={btnClass + 'pulse'} onClick={() => wallet.fundAccount(qs('#fundingAmount').value, id, qs('#recipientName').value)}>
            CREATE GIFT ACCOUNT
          </button>
          {links && links.length > 0 && (
            <>
              <h2 className="mt-5">Backup</h2>

              <button
                className={btnClass + 'mt-3'}
                onClick={() => {
                  let backupTxt = '';
                  links.forEach(({ key, accountId, recipientName = '' }) => {
                    backupTxt += `accountId: ${getLink(accountId, key, wallet, message, link)} for ${recipientName}\n\n`;
                  });
                  share(backupTxt);
                  dispatch(onAlert('Copied!'));
                }}
              >
                Copy All Gift Links
              </button>
              <p className="sub-note">In case your browser's storage is cleared. Keep them somewhere safe!</p>
            </>
          )}
          {claimed.length > 0 && <h2 className="mt-5">Past Gifted Accounts</h2>}
          {claimed.map(({ key, accountId, recipientName = '' }) => (
            <div key={key}>
              <p className={'mb-0'}>
                <strong>{accountId}</strong>: claimed by {recipientName}
              </p>
              <button className={btnClass + 'mb-3'} onClick={() => dispatch(unclaimLink(key))}>
                Try Share Link Again
              </button>
            </div>
          ))}
        </>
      )}

      <Footer />
    </>
  );
};
