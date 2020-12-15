import React from 'react';

import { flexClass, btnClass, qs } from '../App'

export const Giver = ({ state, update }) => {

    const {
        app, wallet, links
    } = state

    return <>
        <div class={flexClass}>
            <h2>NEAR Stocking Stuffers</h2>
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
        <h2>Create Account</h2>
        <form class={'needs-validation ' + (app.wasValidated ? 'was-validated' : '')}>
            <div class="form-floating mb-3">
                <input type="number" class="form-control" id="fundingAmount" placeholder=" " required min="5" />
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
                    onChange={() => wallet.isAccountTaken(qs('#accountName').value)}
                />
                <label for="accountName">Account Name</label>
                <div class="invalid-feedback">
                    {app.accountTaken ? 'Account name is already taken' : '2 <= Name <= 48 characters'}
                </div>
            </div>
        </form>
        <button class={btnClass} onClick={() => wallet.fundAccount(qs('#fundingAmount').value, qs('#accountName').value)}>
            Create Account
        </button>
        {
            links.sort((a) => a.claimed ? 1 : -1).map(({ key, accountId, claimed }) => <p key={key}>
                {accountId} - {claimed ? 'claimed' : 'not claimed'}
                <br />
                <a href={`${window.location.origin}?accountId=${accountId}&key=${key}`}>Share Me</a>
            </p>)
        }
    </>
}