var listPage = Vue.extend({
    template: `
        <div class='list-page'>
            <div class="search-block">
                <slot name="search"></slot>
            </div>
            <div class="operation-block">
                <slot name="operation"></slot>
            </div>
            <div class="chart-block">
                <slot name="chart"></slot>
            </div>
            <div id="table-content">
                <slot name="table"></slot>
            </div>
        </div>
    `,
    props: {},
    data() {
        return {};
    },
    mounted: function () { },
    methods: {},
});

var treePage = Vue.extend({
    template: `
        <div class='tree-page'>
            <div class='left-tree'>
                <slot name='left-tree'></slot>
            </div>
            <div class='right-content'>
                <slot name='right-content'></slot>
            </div>
        </div>
    `,
    props: {},
    data() {
        return {};
    },
    mounted: function () { },
    methods: {},
});

export const useFrame = (Vue) => {
    Vue.component("list-page", listPage);
    // Vue.component("info-page", infoPage);
    Vue.component("tree-page", treePage);
};
