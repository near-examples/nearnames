import React from 'react';
import screenshot from '/static/connect.png';

export default function SignedOutSteps({ forExample }) {
  return (
    <>
      <p>Below, we'll guide you through these easy steps:</p>
      <ol>
        <li>
          <strong>Sign in</strong> to your{' '}
          <a href="https://wallet.near.org/" target="_blank" style={{ fontWeight: 'bold' }}>
            NEAR Wallet
          </a>
          .
        </li>
        <li>
          <strong>Connect</strong> to your NEAR Wallet using the button below.
          <ul>
            <li>
              You will see a screen like this and click "Next" to confirm:{' '}
              <a style={{ border: '1px dashed #ccc', padding: '1rem', maxWidth: '200px' }} className="d-inline-block" target="_blank" href={screenshot}>
                <img src={screenshot} alt="screenshot" className="img-fluid" />
              </a>
            </li>
          </ul>
        </li>
        <li>
          <strong>Choose an account name</strong> for the new NEAR account {forExample}.
        </li>
        <li>
          <strong>Choose an amount</strong> of NEAR tokens that you want to send to that account (from your own wallet).
        </li>
        <li>
          <strong>Send</strong> the magic link to your friend.
          <ul>
            <li>When your friend visits the link, they'll be able to claim and take full ownership of that account and all of its tokens!</li>
          </ul>
        </li>
      </ol>
    </>
  );
}
