let userVotes = []

let isUserVotesStale = true

export default {
    data: function () {
        return {
            lastVoteUpdate: 0
        }
    },
    methods: {
        async loadVotes(userId) {
            if (isUserVotesStale) {
                try {
                    const votesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/votes`, {mode: 'cors'})
                    if (votesResponse.ok) {
                        userVotes = await votesResponse.json()
                    } else {
                        console.log('💥 Failed to fetch votes')
                        userVotes = []
                    }
                } catch (e) {
                    console.log('💥', e)
                    userVotes = []
                }
                isUserVotesStale = false
            }
        },
        getVoteValue: function (nameId) {
            return userVotes.find(vote => vote.nameId === nameId)?.value
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
                    const userVote = userVotes.find(vote => vote.nameId === nameId);
                    if (userVote) {
                        userVote.value = value
                    } else {
                        userVotes.push({
                            nameId: nameId,
                            userId: null,
                            value
                        })
                    }
                    this.lastVoteUpdate = Date.now()
                } else {
                    console.log('💥 Failed to cast votes')
                }
            } catch (e) {
                console.log('💥', e)
            }
        }
    }
};
