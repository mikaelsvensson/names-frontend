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
        }
    }
};
