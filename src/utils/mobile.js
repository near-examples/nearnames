
import copy from 'copy-to-clipboard';

export const share = (text) => {
    if (navigator.share) {
        navigator.share({
            text
        }).catch((e) => {
            copy(text)
        });
    } else {
        copy(text)
    }
}