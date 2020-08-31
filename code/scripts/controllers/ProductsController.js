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
            console.log(e, e.submitter, e.target);
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
}

export default ProductsController;