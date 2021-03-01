import React, { useEffect, useState } from 'react';
import { onAlert } from '../state/app';
import { nameSuffix, unclaimLink } from '../state/near';
import { share } from '../utils/mobile';
import { flexClass, btnClass, qs } from '../App'
import { getVideoId } from '../utils/youtube'

const forExample = `(for example: "bestie.near" or "squad.near")`
const baseUrl = window.location.href.substr(0, window.location.href.lastIndexOf('/'))
const getLink = (accountId, key, wallet, message = '', link = '') => `${baseUrl}?accountId=${accountId}&key=${key}&from=${wallet.getAccountId()}&message=${encodeURIComponent(message)}&link=${getVideoId(link)}`

export const Giver = ({ state, update, dispatch }) => {

    const {
        app, wallet, links, claimed
    } = state

    const [id, setId] = useState('')
    const [disabled, setDisabled] = useState(true)
    const [message, setMessage] = useState('')
    const [link, setLink] = useState('')

    const checkDisabled = () => {
        setTimeout(() => setDisabled(!!document.querySelectorAll(':invalid').length), 250)
    }

    return <>
        <div class={flexClass + 'mb-3 text-center'}>
            <h5><b>Gift a name on<br />NEAR Protocol!</b></h5>
        </div>

        <p>Claim a name for friends and fam on the NEAR blockchain.</p>

        {
            wallet.signedIn ?
                <>
                    <ul>
                        <li>Use your tokens to give a unique NEAR account name {forExample}.</li>
                        <li>Fill in the form below and choose an amount of NEAR to give.</li>
                        <li>Note: a small amount of NEAR is used to claim the custom account name and the rest will go in the gifted wallet.</li>
                    </ul>
                    <p><b>Welcome to the party, from your friends at NEAR!</b></p>
                </> :
                <p>If you have tokens in your <b>NEAR Wallet</b>, <i>Sign In</i> to give the gift of a unique NEAR account {forExample} to your friends and family 🤗</p>
        }



        {
            wallet.signedIn ?
                <>

                    <h2>My Wallet</h2>
                    <div class={flexClass}>
                        <p>{wallet.getAccountId()} - {wallet.balance} N</p>
                        <button class={btnClass + 'ms-3'} onClick={() => {
                            wallet.signOut()
                            update('wallet.signedIn', false)
                        }}>Sign Out</button>
                    </div>
                </>
                :
                <div class={flexClass}>
                    <button class={btnClass} onClick={() => wallet.signIn()}>Sign In to NEAR Wallet</button>
                </div>
        }

        {
            wallet.signedIn &&
            <>

                {
                    links && links.length > 0 && <>
                        <h2>Gift Links</h2>
                        <center>
                            {
                                links.map(({ key, accountId, recipientName = '' }) => <div key={key}>
                                    <div>
                                        <strong>{accountId}</strong> {recipientName.length > 0 && <span>for {recipientName}</span>}
                                    </div>
                                    <div>
                                        <button class={btnClass + 'mt-2'} onClick={() => {
                                            share(getLink(accountId, key, wallet, message, link))
                                            dispatch(onAlert('Copied!'))
                                        }}>
                                            Click to Share
                            </button>
                                    </div>
                                </div>)
                            }
                        </center>

                        <h4 class="mb-3">Include Gift Message (optional)</h4>
                        <p class="sub-note">Personalize each link <i>before</i> you "Click to Share" above.</p>
                        <form class={'was-validated'}>
                            <div class="form-floating mb-3">
                                <textarea
                                    type="text" class="form-control" placeholder=" " maxlength="140"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <label for="fundingAmount">Custom Message</label>
                            </div>
                            {/* <div class="form-floating mb-3" name="yt-link">
                                <input type="text" class="form-control" placeholder=" "
                                    value={link}
                                    pattern="(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)"
                                    onChange={(e) => setLink(e.target.value)}
                                />
                                <label for="fundingAmount">YouTube Link</label>
                                <div class="invalid-feedback">
                                    Not a valid YT link
                                </div>
                            </div> */}

                        </form>

                        {/* <select class="form-control" id="video-select" onChange={() => setLink(qs('#video-select').value)}>
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
                }


                <h2 class="mt-5">Create {links && links.length > 0 ? 'Another' : ''} Gift Account</h2>
                <form
                    class={'needs-validation ' + (app.wasValidated ? 'was-validated' : '')}
                    autocomplete="off"
                >

                    <div class="form-floating mb-3">
                        <input
                            type="text" class="form-control" id="accountName" placeholder=" "
                            required
                            minlength={app.accountTaken ? 999999 : 2}
                            maxlength={48}
                            pattern="^(([a-z\d]+[\-_])*[a-z\d]+$"
                            autocomplete="off"
                            value={id}
                            onChange={(e) => {
                                const v = e.target.value.toLowerCase()
                                setId(v)
                                wallet.isAccountTaken(v)
                                checkDisabled()
                            }}
                        />
                        <label for="accountName">Account Name</label>
                        <div class="invalid-feedback">
                            {app.accountTaken ? 'Account name is already taken' : '2-48 characters, no spaces, no symbols'}
                        </div>
                    </div>
                    <p class="sub-note">{nameSuffix}</p>

                    <div class="form-floating mb-3">
                        <input type="number" class="form-control" id="fundingAmount" placeholder=" " required 
                            min={0.1} step={0.00001}
                            onChange={() => checkDisabled()}
                        />
                        <label for="fundingAmount">Gift Amount (N)</label>
                        <div class="invalid-feedback">
                            Please enter an amount of NEAR >= 0.1
                        </div>
                    </div>

                    <div class="form-floating mb-3">
                        <input
                            type="text" class="form-control" id="recipientName" placeholder=" "
                            required minlength={1} maxlength={64}
                            autocomplete="off"
                            onChange={() => checkDisabled()}
                        />
                        <label for="accountName">Recipient Name</label>
                        <div class="invalid-feedback">
                            Please enter a name
                        </div>
                    </div>
                </form>

                <button
                    disabled={disabled}
                    class={btnClass + "pulse"}
                    onClick={() => wallet.fundAccount(qs('#fundingAmount').value, id, qs('#recipientName').value)}>
                    CREATE GIFT ACCOUNT
                </button>


                { links && links.length > 0 && <>
                
                    <h2 class="mt-5">Backup</h2>

                    <button class={btnClass + 'mt-3'} onClick={() => {
                        let backupTxt = ''
                        links.forEach(({ key, accountId, recipientName = '' }) => {
                            backupTxt += `accountId: ${getLink(accountId, key, wallet, message, link)} for ${recipientName}\n\n`
                        })
                        share(backupTxt)
                        dispatch(onAlert('Copied!'))
                    }}>
                        Copy All Gift Links
                    </button>
                    <p class="sub-note">In case your browser's storage is cleared. Keep them somewhere safe!</p>
                
                </>}


                {claimed.length > 0 && <h2 class="mt-5">Past Gifted Accounts</h2>}
                {
                    claimed.map(({ key, accountId, recipientName = '' }) => <div key={key}>
                        <p class={'mb-0'} ><strong>{accountId}</strong>: claimed by {recipientName}</p>
                        <button class={btnClass + 'mb-3'} onClick={() => dispatch(unclaimLink(key))}>Try Share Link Again</button>
                    </div>)
                }
            </>
        }

        <div class="container text-center mt-5">
            <p>Questions? Comments? Cookies?<br />Hit us up <a href="https://twitter.com/NEARProtocol?s=20" target="_blank">@NEARProtocol on Twitter</a> 🌈</p>
        </div>

    </>
}