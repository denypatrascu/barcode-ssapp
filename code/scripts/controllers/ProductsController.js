import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

const STORE_PATH = "/data/products.json";
const STORE_TYPE = "json";

const getModel = () => {
    const abstractModel = {
        store: {
            products: []
        }
    }

    console.log('initial model:', abstractModel);

    return abstractModel;
}

class ProductsController extends ContainerController {
    constructor(element) {
        super(element);

        this.model = this.setModel(getModel());

        this._fetchStore(this.model);

        this.on('delete-product', e => {
            // lack of checkins
            console.log(e, e.submitter, e.target);
            const form = e.target.querySelector('form');
            let index = undefined;
            for (const element of form.elements) {
                if (element.name !== 'index') continue;
                index = element.value;
                break;
            }
            if (index) this._deleteProduct(this.model, index)
        })
    }

    _fetchStore(model) {
        this.DSUStorage.getItem(STORE_PATH, STORE_TYPE, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log('products:', data);

            if (!data.products || !data.products.length) return;

            data.products.forEach((product, index) => product.index = index)

            model.store = data;
        });
    }

    _deleteProduct(model, index) {
        model.store.products.splice(index, 1);

        // this.DSUStorage.setObject(STORE_PATH, model.store, err => {
        //     if (err) {
        //         console.error(err);
        //         return;
        //     }
        // });
    }
}


export default ProductsController;