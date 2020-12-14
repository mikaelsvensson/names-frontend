let votes = []

let stale = true

export default {
    data: function () {
        return {
            lastVoteUpdate: 0
        }
    },
    methods: {
        async loadVotes() {
            if (stale) {
                try {
                    const votesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/votes`, {
                        mode: 'cors',
                        headers: {
                            'Authorization': 'Bearer ' + window.localStorage.getItem('user.token')
                        }
                    })
                    if (votesResponse.ok) {
                        votes = await votesResponse.json()
                    } else {
                        console.log('💥 Failed to fetch votes')
                        votes = []
                    }
                } catch (e) {
                    console.log('💥', e)
                    votes = []
                }
                stale = false
            }
        },
        getVoteValue: function (nameId) {
            return votes.find(vote => vote.nameId === nameId)?.value
        },
        vote: async function (nameId, value) {
            try {
                const voteResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/votes/${nameId}`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + window.localStorage.getItem('user.token')
                    },
                    body: JSON.stringify({value})
                })
                if (voteResponse.ok) {
                    const userVote = votes.find(vote => vote.nameId === nameId);
                    if (userVote) {
                        userVote.value = value
                    } else {
                        votes.push({
                            nameId: nameId,
                            userId: null,
                            value
                        })
                    }
                    this.lastVoteUpdate = Date.now()
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
