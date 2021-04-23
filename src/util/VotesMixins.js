export const VOTE_STRENGTH = {
    VERY_POSITIVE: 100,
    POSITIVE: 50,
    NEUTRAL: 0,
    NEGATIVE: -50,
    VERY_NEGATIVE: -100
};

export default {
    methods: {
        vote: async function (nameId, value, authToken) {
            try {
                const voteResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/votes/${nameId}`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? {'Authorization': 'Bearer ' + authToken} : {})
                    },
                    body: JSON.stringify({value})
                });
                if (voteResponse.ok) {
                    return true
                } else {
                    console.log('💥 Failed to cast votes')
                }
            } catch (e) {
                console.log('💥', e)
            }
            return false
        }
    }
};
