import React, { useState } from 'react';

import { flexClass, btnClass, qs } from '../App'

import stocking from '../img/stocking.svg'

export const Giver = ({ state, update }) => {

    const {
        app, wallet, links
    } = state

    const [disabled, setDisabled] = useState(true)
    const [message, setMessage] = useState('')
    const [link, setLink] = useState('')

    const checkDisabled = () => {
        setTimeout(() => setDisabled(!!document.querySelectorAll(':invalid').length), 250)
    }

    return <>
        <div class={flexClass + 'mb-3'}>
            <img class="mini-stocking" src={stocking} />
            <h2>Stuffers</h2>
            <img class="mini-stocking" src={stocking} />
        </div>

        <div class={flexClass}>
            {
                wallet.signedIn ?
                    <>
                        <p>{wallet.getAccountId()} - {wallet.balance} N</p>
                        <button class={btnClass + 'ms-3'} onClick={() => {
                            wallet.signOut()
                            update('wallet.signedIn', false)
                        }}>Sign Out</button>
                    </>
                    :
                    <button class={btnClass} onClick={() => wallet.signIn()}>Sign In</button>
            }
        </div>

        {
            wallet.signedIn &&
            <>
                <h2>Create Account</h2>
                <form 
                    class={'needs-validation ' + (app.wasValidated ? 'was-validated' : '')}
                    autocomplete="off"
                    >
                    <div class="form-floating mb-3">
                        <input type="number" class="form-control" id="fundingAmount" placeholder=" " required min="5" 
                            onChange={() => checkDisabled()}
                        />
                        <label for="fundingAmount">Amount (N)</label>
                        <div class="invalid-feedback">
                            Please enter an amount of NEAR > 5
                    </div>
                    </div>
                    <div class="form-floating mb-3">
                        <input
                            type="text" class="form-control" id="accountName" placeholder=" "
                            required minlength={app.accountTaken ? 999999 : 2}
                            maxlength={48}
                            pattern="^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$"
                            autocomplete="off"
                            onChange={() => {
                                wallet.isAccountTaken(qs('#accountName').value.toLowerCase())
                                checkDisabled()
                            }}
                        />
                        <label for="accountName">Account Name</label>
                        <div class="invalid-feedback">
                            {app.accountTaken ? 'Account name is already taken' : '2-48 characters, no spaces, no symbols'}
                        </div>
                    </div>
                    <button 
                        disabled={disabled}
                        class={btnClass} 
                        onClick={() => wallet.fundAccount(qs('#fundingAmount').value, qs('#accountName').value.toLowerCase())}>
                        Create Account
                    </button>
                </form>
                


                <h2>Accounts</h2>
                {
                    links.map(({ key, accountId, claimed }) => <p key={key}>
                        <strong>{accountId}</strong> - {claimed ? 'claimed' : 'not claimed'}
                        <br />
                        {!claimed && <a href={
                            `${window.location.origin}?accountId=${accountId}&key=${key}&from=${wallet.getAccountId()}&message=${message}&link=${link}`
                        }>
                            <button class={btnClass}>
                                Share Account Link
                        </button>
                        </a>}
                    </p>)
                }



                <h2>Customize</h2>
                <form class={'needs-validation ' + (app.wasValidated ? 'was-validated' : '')}>
                    <div class="form-floating mb-3">
                        <textarea 
                            type="text" class="form-control" placeholder=" " maxlength="140"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <label for="fundingAmount">Custom Message</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input type="text" class="form-control" placeholder=" " 
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                        <label for="fundingAmount">YouTube Video</label>
                    </div>
                </form>
            </>
        }
    </>
}