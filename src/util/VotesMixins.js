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
                })
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
