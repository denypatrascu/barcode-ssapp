import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

const STORE_PATH = "/data/products.json";
const STORE_TYPE = "json";

const getModel = () => {
    const abstractModel = {
        form: {
            productName: {
                label: "Product name",
                name: "product-name",
                required: true,
                placeholder: "Short & relevant"
            },
            productDescription: {
                label: "Product description",
                name: "product-description",
                placeholder: "Long & optional"
            },
            publishDate: {
                label: "Publish date",
                name: "publish-date",
                required: true,
                dataFormat: "DD MM YYYY",
                value: Date.now(),
                defaultValue: Date.now(),
            },
            barcode: {
                value: '',
                required: true,
            }
        },
        preview: {
            orderBy: {
                label: "Order by",
                options: [],
                value: 'publishDate'
            },
            order: {
                label: "Select order",
                options: [
                    {
                        label: "Descending ⬇️",
                        value: -1,
                    },
                    {
                        label: "Ascending ⬆️",
                        value: 1,
                    },
                ],
                value: -1,
            },
            howMany: {
                label: "How many products",
                step: 5,  // ?
                min: 0,   // ?
                max: 30,  // ?
                value: 5

            }
        },
        store: {
            products: [],
            queryProducts: []
        },
        keys: {
            form: []
        },
        formActive: true,
        scanner: {
            active: false,
            data: ''
        }
    }

    abstractModel.keys = {
        form: Object.keys(abstractModel.form)
    }

    abstractModel.keys.form
        .forEach(key => {
            if (key === 'barcode') return;

            abstractModel.preview.orderBy.options.push({
                label: abstractModel.form[key].label,
                value: key
            });

            if (abstractModel.form[key].required) {
                abstractModel.form[key].label += '*';
            }
        });

    console.log('initial model:', abstractModel);

    return abstractModel;
}

class HomeController extends ContainerController {
    constructor(element) {
        super(element);

        this.model = this.setModel(getModel());
        // this.model = this.setModel(JSON.parse(JSON.stringify(/*abstractModel*/));

        this._fetchStore(this.model);

        this.model.addExpression('switchExpression', _ => this.model.formActive, 'formActive');

        this.model.onChange('preview.orderBy.value', () => this._queryStore(this.model));
        this.model.onChange('preview.order.value', () => this._queryStore(this.model));
        this.model.onChange('preview.howMany.value', () => this._queryStore(this.model));
        this.model.onChange('scanner.data', () => {
            console.log('barcode scanned:', this.model.scanner.data);
            this.model.form.barcode.value = this.model.scanner.data;
        });

        console.log('model:', this.model);

        this.on('switch', e => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.model.formActive = !this.model.formActive;
            console.log('switched form:', this.model.formActive);
        });

        this.on('new-product-submit', e => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._addProduct(this.model);
        });

        this.on('new-product-reset', e => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._resetForm(this.model);
        });

        this.on('toggle-scanner', _ => {
            this.model.scanner.active = !this.model.scanner.active;
        });
    }

    _fetchStore(model) {
        this.DSUStorage.getItem(STORE_PATH, STORE_TYPE, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log('products:', data);
            model.store = data;

            this._queryStore(model);
        });
    }

    _queryStore(model) {
        const key = model.preview.orderBy.value !== "publishDate" ? model.preview.orderBy.value : "hiddenDate";
        const order = model.preview.order.value;
        const limit = model.preview.howMany.value;

        const queryProducts = () => {
            console.log("sortBy", key, order, limit);

            switch (typeof model.store.products[0][key]) {
                case "string":
                    return [...model.store.products]
                        .sort((a, b) => order * a[key].localeCompare(b[key]))
                case "number":
                    return [...model.store.products]
                        .sort((a, b) => order * (a[key] < b[key] ? -1 : 1))
                default:
                    return 1;
            }
        }

        if (model.store.products.length > 1) {
            model.store.queryProducts = queryProducts().slice(0, limit);
        }
    }

    _addProduct(model) {
        const data = {};

        model.keys.form.forEach(key => data[key] = model.form[key].value);
        data.hiddenDate = data.publishDate;
        data.publishDate = this._parseDate(data.publishDate);

        model.store.products.push(data);

        console.log('new product:', data);

        this.DSUStorage.setObject(STORE_PATH, model.store, err => {
            if (err) {
                console.error(err);
                return;
            }

            this._resetForm(model);
            this._queryStore(model);
        });
    }

    _parseDate(date) {
        return new Date(date).toDateString()
    }

    _resetForm(model) {
        model.keys.form.forEach(key => {
            if (!model.form[key].defaultValue) model.form[key].value = '';
            else model.form[key].value = model.form[key].defaultValue;
        });
    }
}

export default HomeController;