// Source: https://techformist.com/reusable-debounce-function-vue/
export default {
    methods: {
        debounce(func, delay) {
            let debounceTimer;
            return function () {
                const context = this;
                const args = arguments;
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => func.apply(context, args), delay);
            };
        },
        async getUserId () {
            const existingUserId = window.localStorage.getItem('user.id');
            if (existingUserId) {
                return existingUserId
            }
            const userResponse = await fetch('http://localhost:8080/users', {method: 'POST', mode: 'cors'});
            const user = await userResponse.json();
            window.localStorage.setItem('user.id', user.id);
            return user.id
        }
    }
};
