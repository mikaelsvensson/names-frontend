const votes = {}

const stale = {}

export default {
    data: function () {
        return {
            lastVoteUpdate: 0
        }
    },
    methods: {
        async loadVotes(userId) {
            if (typeof stale[userId] === 'undefined' || stale[userId] === true) {
                try {
                    const votesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/votes`, {mode: 'cors'})
                    if (votesResponse.ok) {
                        votes[userId] = await votesResponse.json()
                    } else {
                        console.log('💥 Failed to fetch votes')
                        votes[userId] = []
                    }
                } catch (e) {
                    console.log('💥', e)
                    votes[userId] = []
                }
                stale[userId] = false
            }
        },
        getVoteValue: function (userId, nameId) {
            return (votes[userId] ?? []).find(vote => vote.nameId === nameId)?.value
        },
        vote: async function (nameId, value) {
            try {
                const userId = await this.getUserId();
                const voteResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/votes/${nameId}`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({value})
                })
                if (voteResponse.ok) {
                    if (!votes[userId]) {
                        votes[userId] = []
                    }
                    const userVote = votes[userId].find(vote => vote.nameId === nameId);
                    if (userVote) {
                        userVote.value = value
                    } else {
                        votes[userId].push({
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
