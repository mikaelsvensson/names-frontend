const maxAge = 365 * 24 * 60 * 60;

export default {
    methods: {
        getAnonymousAuthenticatorUserId() {
            const cookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('anonymousProfileId='));
            if (cookie) {
                return cookie.substr('anonymousProfileId='.length);
            }
            return null
        },
        setAnonymousAuthenticatorUserId(id) {
            document.cookie = [
                'anonymousProfileId=' + id,
                'secure',
                'samesite=strict',
                'max-age=' + maxAge
            ].join(';')
        },
        unsetAnonymousAuthenticatorUserId() {
            document.cookie = [
                'anonymousProfileId=',
                'expires=Thu, 01 Jan 1970 00:00:00 GMT'
            ].join(';')
        }
    }
};
